/**
 * Faciloopro V2 - Edge Function : Suppression définitive d'un commercial
 *
 * Supprime la fiche commerciaux, le rôle user_roles et le compte Supabase Auth.
 * Appelable par admin_org (sur sa propre org) ou super_admin.
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Non autorisé' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await userClient.auth.getUser();
    if (!caller) {
      return jsonResponse({ error: 'Non autorisé' }, 401);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Vérifier le rôle de l'appelant
    const { data: callerRole } = await adminClient
      .from('user_roles')
      .select('role, organization_id')
      .eq('user_id', caller.id)
      .eq('is_active', true)
      .single();

    if (!callerRole || (callerRole.role !== 'admin_org' && callerRole.role !== 'super_admin')) {
      return jsonResponse({ error: 'Accès réservé aux administrateurs' }, 403);
    }

    const { commercialId } = await req.json();
    if (!commercialId) {
      return jsonResponse({ error: 'commercialId requis' }, 400);
    }

    // Récupérer la fiche commercial
    const { data: commercial } = await adminClient
      .from('commerciaux')
      .select('id, user_id, nom, prenom, organization_id')
      .eq('id', commercialId)
      .single();

    if (!commercial) {
      return jsonResponse({ error: 'Commercial introuvable' }, 404);
    }

    // Vérifier que la cible appartient à la même org (sauf super_admin)
    if (callerRole.role === 'admin_org' && commercial.organization_id !== callerRole.organization_id) {
      return jsonResponse({ error: 'Utilisateur hors de votre organisation' }, 403);
    }

    if (commercial.user_id === caller.id) {
      return jsonResponse({ error: 'Impossible de supprimer votre propre compte' }, 400);
    }

    const orgId = commercial.organization_id;
    const userId = commercial.user_id;
    const commercialNom = `${commercial.prenom} ${commercial.nom}`;

    // Supprimer la fiche commerciaux
    await adminClient.from('commerciaux').delete().eq('id', commercialId);

    // Supprimer le rôle
    if (userId) {
      await adminClient.from('user_roles').delete().eq('user_id', userId);
    }

    // Supprimer le compte Auth
    if (userId) {
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        console.error(`[delete-commercial] Erreur suppression Auth: ${deleteAuthError.message}`);
      }
    }

    // Logger l'action
    await adminClient.from('journal_actions_commercial').insert({
      organization_id: orgId,
      utilisateur_id: caller.id,
      utilisateur_nom: 'Admin',
      action_type: 'commercial_removed',
      action: `Suppression définitive du commercial ${commercialNom}`,
      entite_type: 'commercial',
      entite_id: commercialId,
      cible: commercialNom,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });

    console.log(`[delete-commercial] Supprimé: ${commercialNom} (${commercialId})`);
    return jsonResponse({ success: true });

  } catch (error) {
    console.error('[delete-commercial] Error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Erreur interne' }, 500);
  }
});
