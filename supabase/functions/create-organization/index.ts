/**
 * Faciloop CRM V2 - Edge Function : Création d'une entreprise par le Super Admin
 *
 * 1. Crée l'organisation dans la table `organizations` avec formule, période, dates et tarif.
 * 2. Génère un code PIN / mot de passe par défaut à 6 chiffres.
 * 3. Crée le compte Supabase Auth pour l'Admin Org.
 * 4. Associe le rôle `admin_org` dans `user_roles`.
 * 5. Envoye un email structuré et professionnel avec les identifiants et détails de l'abonnement.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore: module Deno
import nodemailer from 'npm:nodemailer@6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateOrgRequest {
  nom: string;
  email: string;
  telephone: string;
  formule_code: string;
  periodicite: string;
  prix_abonnement: number;
}

function phoneToEmail(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits}@faciloop.app`;
}

function generatePin(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

function formatDateFr(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

    // Vérifier que l'appelant est super_admin
    const { data: callerRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .eq('is_active', true)
      .single();

    if (!callerRole || callerRole.role !== 'super_admin') {
      return jsonResponse({ error: 'Accès réservé aux super administrateurs' }, 403);
    }

    // Payload
    const body: CreateOrgRequest = await req.json();
    const { nom, email, telephone, formule_code, periodicite, prix_abonnement } = body;

    if (!nom || !email || !telephone) {
      return jsonResponse({ error: 'Les champs Nom, Email et Téléphone sont obligatoires' }, 400);
    }

    // Dates et durée
    const durationDays = periodicite === 'annuel' ? 365 : periodicite === 'trimestriel' ? 90 : 30;
    const dateDebut = new Date().toISOString().split('T')[0];
    const dateFin = new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0];

    // 1. Créer l'organisation
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        nom,
        email,
        telephone,
        devise_defaut: 'XOF',
        statut: 'actif',
        formule_code: formule_code || null,
        periodicite: periodicite || null,
        prix_abonnement: prix_abonnement || 0,
        date_debut_abonnement: dateDebut,
        date_fin_abonnement: dateFin,
        statut_abonnement: 'actif',
      })
      .select()
      .single();

    if (orgError || !orgData) {
      return jsonResponse({ error: `Erreur création entreprise : ${orgError?.message}` }, 500);
    }

    // 2. Générer le mot de passe par défaut / PIN
    const pin = generatePin();
    const authEmail = phoneToEmail(telephone);

    // 3. Créer le compte Auth Supabase
    let userId: string | null = null;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: authEmail,
      password: pin,
      email_confirm: true,
      user_metadata: {
        full_name: `Admin ${nom}`,
        role: 'admin_org',
        contact_email: email,
        phone: telephone,
      },
    });

    if (!authError && authData?.user) {
      userId = authData.user.id;
      // 4. Attribuer le rôle admin_org
      await supabase.from('user_roles').insert({
        user_id: userId,
        organization_id: orgData.id,
        role: 'admin_org',
        is_active: true,
      });
    }

    // 5. Envoyer l'email professionnel de bienvenue avec identifiants
    let emailSent = false;
    try {
      await sendWelcomeCompanyEmail({
        to: email,
        nomEntreprise: nom,
        telephone,
        emailAdmin: email,
        pin,
        formule: formule_code,
        periodicite,
        prix: prix_abonnement,
        dateDebut,
        dateFin,
      });
      emailSent = true;
    } catch (emailErr) {
      console.warn('[create-organization] Erreur envoi email:', emailErr);
    }

    return jsonResponse({
      success: true,
      organization: orgData,
      credentials: {
        email,
        telephone,
        pin,
      },
      emailSent,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur interne';
    return jsonResponse({ error: message }, 500);
  }
});

async function sendWelcomeCompanyEmail(opts: {
  to: string;
  nomEntreprise: string;
  telephone: string;
  emailAdmin: string;
  pin: string;
  formule: string;
  periodicite: string;
  prix: number;
  dateDebut: string;
  dateFin: string;
}): Promise<void> {
  const SMTP_HOST = Deno.env.get('SMTP_HOST');
  const SMTP_PORT = Number(Deno.env.get('SMTP_PORT') || '587');
  const SMTP_USER = Deno.env.get('SMTP_USER');
  const SMTP_PASS = Deno.env.get('SMTP_PASS');

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('[create-organization] Config SMTP manquante');
    return;
  }

  const appUrl = Deno.env.get('APP_URL') ?? 'https://crm.faciloop.com';

  const formuleLabel = opts.formule ? opts.formule.toUpperCase() : 'STANDARD';
  const periodiciteLabel = opts.periodicite === 'annuel' ? 'Annuel (365 jours)' : opts.periodicite === 'trimestriel' ? 'Trimestriel (90 jours)' : 'Mensuel (30 jours)';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e5e7eb;">
          
          <!-- Header Dégradé Pro -->
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%);padding:36px 32px;text-align:left;">
              <table role="presentation" width="100%">
                <tr>
                  <td>
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Faciloop CRM</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;font-weight:500;">Activation de votre compte Entreprise</p>
                  </td>
                  <td align="right">
                    <span style="display:inline-block;background:rgba(255,255,255,0.2);color:#ffffff;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;text-transform:uppercase;">
                      ${formuleLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corps du message -->
          <tr>
            <td style="padding:36px 32px;">
              <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:700;">
                Bienvenue, ${opts.nomEntreprise} !
              </h2>
              <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
                Votre espace entreprise Faciloop CRM a été créé et activé par l'administration. Voici le récapitulatif complet de votre souscription ainsi que vos identifiants d'accès administrateur.
              </p>

              <!-- Carte Récapitulative Souscription -->
              <div style="background-color:#fafafa;border:1px solid #f3f4f6;border-radius:12px;padding:24px;margin-bottom:28px;">
                <h3 style="margin:0 0 16px;color:#374151;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                  📋 Détails de l'Abonnement
                </h3>
                <table role="presentation" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;font-size:14px;width:45%;">Entreprise</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${opts.nomEntreprise}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;font-size:14px;border-top:1px solid #f3f4f6;">Formule Choisie</td>
                    <td style="padding:8px 0;color:#f59e0b;font-size:14px;font-weight:700;text-align:right;border-top:1px solid #f3f4f6;">Formule ${formuleLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;font-size:14px;border-top:1px solid #f3f4f6;">Période</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;border-top:1px solid #f3f4f6;">${periodiciteLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;font-size:14px;border-top:1px solid #f3f4f6;">Tarif Appliqué</td>
                    <td style="padding:8px 0;color:#111827;font-size:15px;font-weight:800;text-align:right;border-top:1px solid #f3f4f6;">${formatAmount(opts.prix)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;font-size:14px;border-top:1px solid #f3f4f6;">Période de Validité</td>
                    <td style="padding:8px 0;color:#374151;font-size:13px;font-weight:600;text-align:right;border-top:1px solid #f3f4f6;">${formatDateFr(opts.dateDebut)} au ${formatDateFr(opts.dateFin)}</td>
                  </tr>
                </table>
              </div>

              <!-- Carte Identifiants de Connexion (Secured Box) -->
              <div style="background-color:#fffbe6;border:1px solid #ffe58f;border-radius:12px;padding:24px;margin-bottom:28px;">
                <h3 style="margin:0 0 16px;color:#d48806;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                  🔐 Vos Identifiants Administrateur
                </h3>
                <table role="presentation" width="100%" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:8px 0;color:#8c6b00;font-size:14px;width:45%;">Email Admin</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${opts.emailAdmin}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#8c6b00;font-size:14px;border-top:1px solid #ffe58f;">Téléphone de Connexion</td>
                    <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${opts.telephone}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0 8px;color:#8c6b00;font-size:14px;border-top:1px solid #ffe58f;">Mot de Passe / Code Secret</td>
                    <td style="padding:12px 0 8px;text-align:right;border-top:1px solid #ffe58f;">
                      <span style="font-size:24px;font-weight:800;color:#d97706;letter-spacing:6px;background:#ffffff;padding:4px 12px;border-radius:6px;border:1px solid #fef08a;">${opts.pin}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Bouton Connexion -->
              <div style="text-align:center;margin:32px 0 16px;">
                <a href="${appUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#f59e0b 0%,#f97316 100%);color:#ffffff;padding:16px 36px;border-radius:30px;text-decoration:none;font-size:16px;font-weight:700;box-shadow:0 4px 14px rgba(245,158,11,0.35);">
                  Accéder à mon espace Faciloop CRM →
                </a>
              </div>

              <p style="margin:20px 0 0;color:#6b7280;font-size:13px;text-align:center;line-height:1.5;">
                Vous pourrez personnaliser votre mot de passe à tout moment depuis votre profil Administrateur.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:#fafafa;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0 0 6px;color:#9ca3af;font-size:12px;font-weight:500;">
                Faciloop CRM — Gestion Commerciale Multi-Entreprises
              </p>
              <p style="margin:0;color:#d1d5db;font-size:11px;">
                © 2026 Digit'Advisor. Tous droits réservés.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    tls: { servername: 'node18-ca.n0c.com', rejectUnauthorized: false },
  });

  await transporter.sendMail({
    from: `"Faciloop CRM" <${SMTP_USER}>`,
    to: opts.to,
    subject: `Bienvenue sur Faciloop CRM - Accès Administrateur (${opts.nomEntreprise})`,
    html,
  });

  console.log(`[create-organization] Email d'activation envoyé à ${opts.to}`);
}
