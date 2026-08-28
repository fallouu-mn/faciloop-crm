/**
 * Faciloop CRM V2 - Edge Function : Inscription d'une organisation
 *
 * Crée le compte Supabase Auth via admin.createUser() (bypass email validation)
 * puis appelle la RPC register_organization pour créer l'org en statut 'en_attente'.
 * Endpoint public (pas d'auth requise, l'utilisateur n'existe pas encore).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RegisterRequest {
  telephone: string;
  pin: string;
  nom_org: string;
  prenom: string;
  nom: string;
}

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@faciloop.app`;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Méthode non autorisée' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ── Payload ────────────────────────────────────────────────────
    const body: RegisterRequest = await req.json();
    const { telephone, pin, nom_org, prenom, nom } = body;

    if (!telephone || !pin || !nom_org || !prenom || !nom) {
      return jsonResponse({ error: 'Tous les champs sont requis (telephone, pin, nom_org, prenom, nom)' }, 400);
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      return jsonResponse({ error: 'Le code PIN doit contenir exactement 6 chiffres' }, 400);
    }

    const email = phoneToEmail(telephone);

    // ── Vérifier que le téléphone n'est pas déjà utilisé ──────────
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const alreadyExists = existingUsers?.users?.some(u => u.email === email);
    if (alreadyExists) {
      return jsonResponse({ error: 'Ce numéro de téléphone est déjà enregistré' }, 409);
    }

    // ── Créer le compte Auth (bypass email validation) ────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true,
      user_metadata: {
        first_name: prenom,
        last_name: nom,
        full_name: `${prenom} ${nom}`,
        role: 'admin_org',
      },
    });

    if (authError) {
      console.error('[register-user] Auth error:', authError.message);
      if (authError.message.includes('already been registered')) {
        return jsonResponse({ error: 'Ce numéro de téléphone est déjà enregistré' }, 409);
      }
      return jsonResponse({ error: `Erreur création compte : ${authError.message}` }, 500);
    }

    const userId = authData.user.id;

    // ── Créer l'organisation via RPC (SECURITY DEFINER) ───────────
    const { data: orgId, error: rpcError } = await supabase.rpc('register_organization', {
      _user_id: userId,
      _nom_org: nom_org.trim(),
      _prenom: prenom.trim(),
      _nom: nom.trim(),
      _telephone: telephone,
    });

    if (rpcError) {
      console.error('[register-user] RPC error:', rpcError.message);
      await supabase.auth.admin.deleteUser(userId);
      return jsonResponse({ error: `Erreur création organisation : ${rpcError.message}` }, 500);
    }

    console.log(`[register-user] Inscription réussie: ${prenom} ${nom} (${email}), org: ${orgId}`);

    return jsonResponse({
      success: true,
      user_id: userId,
      organization_id: orgId,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne';
    console.error('[register-user] Erreur:', message);
    return jsonResponse({ error: message }, 500);
  }
});
