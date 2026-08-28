/**
 * Faciloop CRM V2 - Edge Function : Notifications automatiques
 *
 * Mode CRON (appelé quotidiennement) :
 *  - Relances à échéance aujourd'hui → notifie le commercial
 *  - Relances en retard → notifie le commercial + l'admin
 *  - Objectifs atteints → notifie le commercial
 *  - Abonnements expirant bientôt → notifie l'admin
 *
 * Mode WEBHOOK (appelé par un trigger DB) :
 *  - Prospect converti en client → commission à calculer
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let requestBody: Record<string, unknown> = {};
    try {
      requestBody = await req.json();
    } catch {
      requestBody = {};
    }

    const mode = requestBody.mode as string || 'cron';
    const today = new Date().toISOString().split('T')[0];

    if (mode === 'webhook') {
      return await handleWebhook(supabase, requestBody);
    }

    // ─── MODE CRON ─────────────────────────────────────────────────
    let totalNotifications = 0;

    // 1. Relances prévues aujourd'hui → rappel au commercial
    const { data: relancesToday } = await supabase
      .from('relances')
      .select('id, organization_id, commercial_id, prospect_nom, prospect_entreprise, heure, canal')
      .eq('date', today)
      .eq('statut', 'prevue');

    if (relancesToday && relancesToday.length > 0) {
      const notifications = relancesToday.map(r => ({
        organization_id: r.organization_id,
        commercial_id: r.commercial_id,
        type: 'relance_rappel',
        titre: 'Relance prévue aujourd\'hui',
        message: `${r.prospect_nom} (${r.prospect_entreprise}) — ${r.canal}${r.heure ? ` à ${r.heure}` : ''}`,
        lien: '/app/relances',
        lue: false,
      }));

      const { error } = await supabase.from('notifications_commercial').insert(notifications);
      if (!error) totalNotifications += notifications.length;
    }

    // 2. Relances en retard (date passée + statut 'prevue') → marquer + notifier
    const { data: relancesLate } = await supabase
      .from('relances')
      .select('id, organization_id, commercial_id, prospect_nom')
      .lt('date', today)
      .eq('statut', 'prevue');

    if (relancesLate && relancesLate.length > 0) {
      // Mettre à jour le statut
      const lateIds = relancesLate.map(r => r.id);
      await supabase
        .from('relances')
        .update({ statut: 'en_retard' })
        .in('id', lateIds);

      // Notifier les commerciaux
      const notifications = relancesLate.map(r => ({
        organization_id: r.organization_id,
        commercial_id: r.commercial_id,
        type: 'relance_retard',
        titre: 'Relance en retard',
        message: `La relance pour ${r.prospect_nom} n'a pas été effectuée`,
        lien: '/app/relances',
        lue: false,
      }));

      const { error } = await supabase.from('notifications_commercial').insert(notifications);
      if (!error) totalNotifications += notifications.length;

      // Notifier l'admin de chaque org concernée
      const orgIds = [...new Set(relancesLate.map(r => r.organization_id))];
      const adminNotifs = orgIds.map(orgId => {
        const count = relancesLate.filter(r => r.organization_id === orgId).length;
        return {
          organization_id: orgId,
          type: 'relances_retard_admin',
          titre: 'Relances en retard',
          message: `${count} relance(s) non effectuée(s) par l'équipe`,
          lien: '/admin/relances',
          lue: false,
        };
      });

      await supabase.from('notifications_admin_commercial').insert(adminNotifs);
      totalNotifications += adminNotifs.length;
    }

    // 3. Objectifs atteints ce mois → féliciter
    const { data: objectifsAtteints } = await supabase
      .from('objectifs_commerciaux')
      .select('id, organization_id, commercial_id, commercial_nom, type, objectif, realise')
      .eq('statut', 'en_cours')
      .gte('realise', supabase.rpc ? 0 : 0); // workaround: filter in JS

    if (objectifsAtteints) {
      const atteints = objectifsAtteints.filter(o => o.realise >= o.objectif);

      for (const obj of atteints) {
        // Mettre à jour le statut
        const newStatut = obj.realise > obj.objectif ? 'depasse' : 'atteint';
        await supabase
          .from('objectifs_commerciaux')
          .update({ statut: newStatut })
          .eq('id', obj.id);

        // Notifier le commercial
        await supabase.from('notifications_commercial').insert({
          organization_id: obj.organization_id,
          commercial_id: obj.commercial_id,
          type: 'objectif_atteint',
          titre: 'Objectif atteint !',
          message: `Votre objectif ${obj.type} (${obj.objectif}) est ${newStatut === 'depasse' ? 'dépassé' : 'atteint'} !`,
          lien: '/app/objectifs',
          lue: false,
        });

        // Notifier l'admin
        await supabase.from('notifications_admin_commercial').insert({
          organization_id: obj.organization_id,
          type: 'objectif_atteint_admin',
          titre: 'Objectif atteint',
          message: `${obj.commercial_nom} a atteint son objectif ${obj.type}`,
          cible: obj.commercial_nom,
          lien: '/admin/objectifs',
          lue: false,
        });

        totalNotifications += 2;
      }
    }

    // 4. Abonnements expirant dans 7 jours → notifier admin
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const { data: expiringAbos } = await supabase
      .from('abonnements')
      .select('id, organization_id, entreprise, date_echeance')
      .eq('statut', 'actif')
      .eq('date_echeance', sevenDaysFromNow);

    if (expiringAbos && expiringAbos.length > 0) {
      const adminNotifs = expiringAbos.map(a => ({
        organization_id: a.organization_id,
        type: 'abonnement_expiration',
        titre: 'Abonnement expire bientôt',
        message: `L'abonnement de ${a.entreprise} expire le ${a.date_echeance}`,
        lien: '/admin/abonnements',
        lue: false,
      }));

      await supabase.from('notifications_admin_commercial').insert(adminNotifs);
      totalNotifications += adminNotifs.length;
    }

    console.log(`[auto-notifications] Cron terminé: ${totalNotifications} notification(s) créée(s)`);
    return jsonResponse({ mode: 'cron', notifications: totalNotifications });

  } catch (error) {
    console.error('[auto-notifications] Error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Erreur interne' }, 500);
  }
});

// ─── MODE WEBHOOK : calcul commission sur conversion prospect ────────
async function handleWebhook(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
) {
  const event = body.event as string;

  if (event === 'prospect_converted') {
    const prospectId = body.prospect_id as string;
    const commercialId = body.commercial_id as string;
    const organizationId = body.organization_id as string;
    const formule = body.formule as string;
    const montantVente = body.montant_vente as number;
    const periodicite = body.periodicite as string || 'mensuel';

    if (!prospectId || !commercialId || !organizationId || !formule || !montantVente) {
      return jsonResponse({ error: 'Données de conversion incomplètes' }, 400);
    }

    // Récupérer le taux de commission (configurable par org, défaut 10%)
    const tauxCommission = 10;

    const montantCommission = Math.round(montantVente * tauxCommission / 100);

    // Récupérer les noms
    const { data: commercial } = await supabase
      .from('commerciaux')
      .select('nom, prenom')
      .eq('id', commercialId)
      .single();

    const { data: prospect } = await supabase
      .from('prospects')
      .select('nom, prenom, entreprise')
      .eq('id', prospectId)
      .single();

    const commercialNom = commercial ? `${commercial.prenom} ${commercial.nom}` : '';
    const clientNom = prospect?.entreprise || `${prospect?.prenom || ''} ${prospect?.nom || ''}`.trim();

    // Créer l'entrée commission
    const { error: commError } = await supabase.from('commissions').insert({
      organization_id: organizationId,
      commercial_id: commercialId,
      commercial_nom: commercialNom,
      client_nom: clientNom,
      formule,
      periodicite,
      montant_vente: montantVente,
      taux_commission: tauxCommission,
      montant_commission: montantCommission,
      date_vente: new Date().toISOString().split('T')[0],
      statut: 'a_verser',
    });

    if (commError) {
      console.error('[auto-notifications] Commission insert error:', commError);
      return jsonResponse({ error: commError.message }, 500);
    }

    // Notifier le commercial
    await supabase.from('notifications_commercial').insert({
      organization_id: organizationId,
      commercial_id: commercialId,
      type: 'commission_gagnee',
      titre: 'Commission gagnée !',
      message: `${montantCommission.toLocaleString('fr-FR')} FCFA pour la vente ${formule} à ${clientNom}`,
      lien: '/app/gains',
      lue: false,
    });

    console.log(`[auto-notifications] Commission créée: ${montantCommission} FCFA pour ${commercialNom}`);
    return jsonResponse({ success: true, montant_commission: montantCommission });
  }

  return jsonResponse({ error: 'Event non reconnu' }, 400);
}
