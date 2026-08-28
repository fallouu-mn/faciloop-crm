/**
 * Faciloop CRM V2 - Edge Function : Réinitialisation du code PIN
 *
 * Actions :
 *  - send_otp   : envoie un OTP par SMS via DEXCHANGE
 *  - verify_otp : vérifie l'OTP et réinitialise le PIN (6 chiffres)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@faciloop.app`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = body.action || 'send_otp';

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // ─── ACTION : send_otp ───────────────────────────────────────
    if (action === 'send_otp') {
      const { phone } = body;
      if (!phone) {
        return jsonResponse({ error: 'Le numéro de téléphone est requis' }, 400);
      }

      const cleanPhone = phone.replace(/\D/g, '');
      const email = phoneToEmail(cleanPhone);

      // Vérifier que le user existe
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const userExists = existingUsers?.users?.some((u) => u.email === email);

      if (!userExists) {
        return jsonResponse({ error: 'Aucun compte trouvé avec ce numéro' }, 404);
      }

      // Envoyer OTP via DEXCHANGE
      const dexchangeApiKey = Deno.env.get('DEXCHANGE_API_KEY');
      if (!dexchangeApiKey) {
        console.error('[reset-pin] DEXCHANGE_API_KEY not configured');
        return jsonResponse({ error: 'Service SMS non configuré' }, 500);
      }

      const smsResponse = await fetch('https://api-v2.dexchange-sms.com/api/v1/send/otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dexchangeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'Faciloop CRM',
          number: cleanPhone,
          channel: 'sms',
          signature: 'DEXCHANGE',
        }),
      });

      const smsData = await smsResponse.json();
      console.log('[reset-pin] DEXCHANGE send_otp response:', smsResponse.status, JSON.stringify(smsData));

      if (!smsResponse.ok) {
        return jsonResponse({ error: "Erreur lors de l'envoi du SMS" }, 500);
      }

      return jsonResponse({ success: true, message: 'Code OTP envoyé par SMS' });
    }

    // ─── ACTION : verify_otp ─────────────────────────────────────
    if (action === 'verify_otp') {
      const { phone, otp, newPin } = body;

      if (!phone) {
        return jsonResponse({ error: 'Le numéro de téléphone est requis' }, 400);
      }
      if (!otp || typeof otp !== 'string' || !/^\d{4}$/.test(otp)) {
        return jsonResponse({ error: 'Le code OTP doit contenir 4 chiffres' }, 400);
      }
      if (!newPin || typeof newPin !== 'string' || !/^\d{6}$/.test(newPin)) {
        return jsonResponse({ error: 'Le nouveau code PIN doit contenir 6 chiffres' }, 400);
      }

      const cleanPhone = phone.replace(/\D/g, '');
      const email = phoneToEmail(cleanPhone);

      // Trouver le user par email
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const targetUser = existingUsers?.users?.find((u) => u.email === email);

      if (!targetUser) {
        return jsonResponse({ error: 'Aucun compte trouvé avec ce numéro' }, 404);
      }

      // Vérifier OTP via DEXCHANGE
      const dexchangeApiKey = Deno.env.get('DEXCHANGE_API_KEY');
      if (!dexchangeApiKey) {
        return jsonResponse({ error: 'Service SMS non configuré' }, 500);
      }

      const verifyResponse = await fetch('https://api-v2.dexchange-sms.com/api/v1/verify/otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${dexchangeApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp,
          number: cleanPhone,
          service: 'Faciloop CRM',
        }),
      });

      const verifyData = await verifyResponse.json();
      console.log('[reset-pin] DEXCHANGE verify_otp response:', verifyResponse.status, JSON.stringify(verifyData));

      if (!verifyResponse.ok || !verifyData.success) {
        return jsonResponse({ success: false, code: 'INVALID_OTP', error: 'Code OTP invalide ou expiré' });
      }

      // Réinitialiser le PIN
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password: newPin }
      );

      if (updateError) {
        console.error('[reset-pin] Password update error:', updateError);
        return jsonResponse({ error: 'Erreur lors de la mise à jour du code' }, 500);
      }

      console.log('[reset-pin] PIN reset for user:', targetUser.id);
      return jsonResponse({ success: true, message: 'Code secret réinitialisé avec succès' });
    }

    return jsonResponse({ error: 'Action non reconnue' }, 400);

  } catch (error) {
    console.error('[reset-pin] Unexpected error:', error);
    return jsonResponse({ error: 'Erreur interne du serveur' }, 500);
  }
});
