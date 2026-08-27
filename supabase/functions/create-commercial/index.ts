/**
 * Faciloop CRM V2 - Edge Function : Création d'un commercial
 *
 * Crée le compte Supabase Auth + la fiche commerciaux + le rôle user_roles.
 * Génère un PIN à 6 chiffres et envoie les identifiants par email.
 * Appelable par admin_org ou super_admin uniquement.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore: module Deno
import nodemailer from 'npm:nodemailer@6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateCommercialRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: 'actif' | 'inactif';
}

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@faciloop.app`;
}

function generatePin(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, '0');
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

  try {
    // ── Vérifier l'appelant ────────────────────────────────────────
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Non autorisé' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const callerClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();

    if (callerError || !caller) {
      return jsonResponse({ error: 'Session invalide' }, 401);
    }

    // Vérifier que l'appelant est admin_org ou super_admin
    const { data: callerRole } = await supabase
      .from('user_roles')
      .select('role, organization_id')
      .eq('user_id', caller.id)
      .eq('is_active', true)
      .single();

    if (!callerRole || (callerRole.role !== 'admin_org' && callerRole.role !== 'super_admin')) {
      return jsonResponse({ error: 'Accès réservé aux administrateurs' }, 403);
    }

    // ── Payload ────────────────────────────────────────────────────
    const body: CreateCommercialRequest = await req.json();
    const { nom, prenom, email, telephone, statut } = body;

    if (!nom || !prenom || !email || !telephone) {
      return jsonResponse({ error: 'Les champs nom, prenom, email et telephone sont requis' }, 400);
    }

    const phoneEmail = phoneToEmail(telephone);

    // ── Vérifier unicité du téléphone ──────────────────────────────
    const { data: existingComm } = await supabase
      .from('commerciaux')
      .select('id')
      .eq('telephone', telephone)
      .limit(1);

    if (existingComm && existingComm.length > 0) {
      return jsonResponse({ error: 'Ce numéro de téléphone est déjà associé à un commercial' }, 400);
    }

    // ── Générer le PIN ─────────────────────────────────────────────
    const pin = generatePin();

    // ── Créer le compte Supabase Auth ──────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: phoneEmail,
      password: pin,
      email_confirm: true,
      user_metadata: {
        first_name: prenom,
        last_name: nom,
        full_name: `${prenom} ${nom}`,
        role: 'commercial',
      },
    });

    if (authError) {
      return jsonResponse({ error: `Erreur création compte : ${authError.message}` }, 500);
    }

    const userId = authData.user.id;

    // ── Insérer dans user_roles ────────────────────────────────────
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      organization_id: callerRole.organization_id,
      role: 'commercial',
      is_active: true,
    });

    if (roleError) {
      await supabase.auth.admin.deleteUser(userId);
      return jsonResponse({ error: `Erreur attribution rôle : ${roleError.message}` }, 500);
    }

    // ── Insérer dans commerciaux ───────────────────────────────────
    const { data: commercial, error: commError } = await supabase
      .from('commerciaux')
      .insert({
        organization_id: callerRole.organization_id,
        user_id: userId,
        nom,
        prenom,
        email,
        telephone,
        statut: statut || 'actif',
      })
      .select()
      .single();

    if (commError) {
      await supabase.from('user_roles').delete().eq('user_id', userId);
      await supabase.auth.admin.deleteUser(userId);
      return jsonResponse({ error: `Erreur création fiche : ${commError.message}` }, 500);
    }

    // ── Envoyer email identifiants ─────────────────────────────────
    await sendCredentialsEmail({ to: email, prenom, nom, telephone, pin });

    // ── Logger l'action ────────────────────────────────────────────
    await supabase.from('journal_actions_commercial').insert({
      organization_id: callerRole.organization_id,
      utilisateur_id: caller.id,
      utilisateur_nom: `Admin`,
      action_type: 'commercial_added',
      action: `Création du commercial ${prenom} ${nom}`,
      entite_type: 'commercial',
      entite_id: commercial.id,
      cible: `${prenom} ${nom}`,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });

    console.log(`[create-commercial] Commercial créé: ${prenom} ${nom} (${userId})`);

    return jsonResponse({
      success: true,
      commercial: {
        id: commercial.id,
        nom: commercial.nom,
        prenom: commercial.prenom,
        email: commercial.email,
        telephone: commercial.telephone,
        statut: commercial.statut,
        user_id: userId,
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne';
    console.error('[create-commercial] Erreur:', message);
    return jsonResponse({ error: message }, 500);
  }
});

async function sendCredentialsEmail(opts: {
  to: string;
  prenom: string;
  nom: string;
  telephone: string;
  pin: string;
}): Promise<void> {
  const SMTP_HOST = Deno.env.get('SMTP_HOST');
  const SMTP_PORT = Number(Deno.env.get('SMTP_PORT') || '587');
  const SMTP_USER = Deno.env.get('SMTP_USER');
  const SMTP_PASS = Deno.env.get('SMTP_PASS');

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[create-commercial] SMTP non configuré, email non envoyé');
    return;
  }

  const appUrl = Deno.env.get('APP_URL') ?? 'https://crm.faciloop.com';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f59e0b,#f97316);padding:28px 32px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Faciloop CRM</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Espace Commercial</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">Bonjour ${opts.prenom} ${opts.nom},</h2>
      <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
        Votre compte commercial a été créé. Voici vos identifiants de connexion :
      </p>
      <div style="background:#f3f4f6;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;width:40%;">Téléphone</td>
            <td style="padding:8px 0;color:#111827;font-size:15px;font-weight:600;">${opts.telephone}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;">Code secret</td>
            <td style="padding:8px 0;border-top:1px solid #e5e7eb;">
              <span style="font-size:24px;font-weight:700;color:#f59e0b;letter-spacing:6px;">${opts.pin}</span>
            </td>
          </tr>
        </table>
      </div>
      <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#f97316);color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">
        Se connecter
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#fafafa;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Cet email a été envoyé automatiquement. Ne le partagez pas.<br>© 2026 Faciloop — Digit'Advisor</p>
    </div>
  </div>
</body>
</html>`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Faciloop CRM" <${SMTP_USER}>`,
    to: opts.to,
    subject: 'Vos identifiants Faciloop CRM',
    html,
  });

  console.log(`[create-commercial] Email envoyé à ${opts.to}`);
}
