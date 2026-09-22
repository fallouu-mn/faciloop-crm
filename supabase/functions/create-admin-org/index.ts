/**
 * Faciloop CRM V2 - Edge Function : Création d'un admin_org
 *
 * Crée le compte Supabase Auth + le rôle user_roles pour l'admin d'une organisation.
 * Génère un PIN à 6 chiffres et envoie les identifiants par email.
 * Appelable par super_admin uniquement.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore: module Deno
import nodemailer from 'npm:nodemailer@6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateAdminOrgRequest {
  organization_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
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

    const { data: callerRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('is_active', true)
      .single();

    if (!callerRole || callerRole.role !== 'super_admin') {
      return jsonResponse({ error: 'Accès réservé au super administrateur' }, 403);
    }

    const body: CreateAdminOrgRequest = await req.json();
    const { organization_id, nom, prenom, email, telephone } = body;

    if (!organization_id || !nom || !prenom || !email || !telephone) {
      return jsonResponse({ error: 'Les champs organization_id, nom, prenom, email et telephone sont requis' }, 400);
    }

    const phoneEmail = phoneToEmail(telephone);

    // Vérifier que l'organisation existe
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, nom')
      .eq('id', organization_id)
      .single();

    if (orgError || !org) {
      return jsonResponse({ error: 'Organisation introuvable' }, 404);
    }

    // Vérifier unicité du téléphone dans auth (email dérivé)
    const { data: existingUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('organization_id', organization_id)
      .eq('role', 'admin_org')
      .eq('is_active', true);

    if (existingUsers && existingUsers.length > 0) {
      return jsonResponse({ error: 'Cette organisation a déjà un administrateur actif' }, 400);
    }

    const pin = generatePin();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: phoneEmail,
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
      return jsonResponse({ error: `Erreur création compte : ${authError.message}` }, 500);
    }

    const userId = authData.user.id;

    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      organization_id,
      role: 'admin_org',
      is_active: true,
    });

    if (roleError) {
      await supabase.auth.admin.deleteUser(userId);
      return jsonResponse({ error: `Erreur attribution rôle : ${roleError.message}` }, 500);
    }

    // Mettre à jour l'organisation avec les infos du responsable
    await supabase
      .from('organizations')
      .update({
        responsable_nom: nom,
        responsable_prenom: prenom,
        email: email,
        telephone: telephone,
      })
      .eq('id', organization_id);

    // Envoyer email identifiants (non-bloquant)
    try {
      await sendCredentialsEmail({ to: email, prenom, nom, telephone, pin, orgNom: org.nom });
    } catch (emailErr) {
      console.warn('[create-admin-org] Email non envoyé:', emailErr instanceof Error ? emailErr.message : emailErr);
    }

    console.log(`[create-admin-org] Admin org créé: ${prenom} ${nom} (${userId}) pour org ${org.nom}`);

    return jsonResponse({
      success: true,
      user_id: userId,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne';
    console.error('[create-admin-org] Erreur:', message);
    return jsonResponse({ error: message }, 500);
  }
});

async function sendCredentialsEmail(opts: {
  to: string;
  prenom: string;
  nom: string;
  telephone: string;
  pin: string;
  orgNom: string;
}): Promise<void> {
  const SMTP_HOST = Deno.env.get('SMTP_HOST');
  const SMTP_PORT = Number(Deno.env.get('SMTP_PORT') || '587');
  const SMTP_USER = Deno.env.get('SMTP_USER');
  const SMTP_PASS = Deno.env.get('SMTP_PASS');

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[create-admin-org] SMTP non configuré, email non envoyé');
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
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Faciloopro CRM</h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Espace Administrateur — ${opts.orgNom}</p>
    </div>
    <div style="padding:32px;">
      <h2 style="margin:0 0 8px;color:#111827;font-size:18px;">Bonjour ${opts.prenom} ${opts.nom},</h2>
      <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
        Votre compte administrateur a été créé pour l'organisation <strong>${opts.orgNom}</strong>.<br>
        Voici vos identifiants de connexion :
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
      <p style="margin:0 0 20px;color:#4b5563;font-size:13px;line-height:1.5;">
        Connectez-vous avec votre numéro de téléphone et ce code secret. Vous pourrez le modifier dans votre profil.
      </p>
      <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#f97316);color:#ffffff;padding:13px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">
        Se connecter
      </a>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;background:#fafafa;">
      <p style="margin:0;color:#9ca3af;font-size:12px;">Cet email a été envoyé automatiquement. Ne partagez pas votre code secret.<br>© 2026 Faciloopro — Digit'Advisor</p>
    </div>
  </div>
</body>
</html>`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { servername: 'node18-ca.n0c.com', rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"Faciloopro CRM" <${SMTP_USER}>`,
    to: opts.to,
    subject: `Vos identifiants Faciloopro CRM — ${opts.orgNom}`,
    html,
  });

  console.log(`[create-admin-org] Email envoyé à ${opts.to}`);
}
