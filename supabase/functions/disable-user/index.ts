/**
 * Faciloop CRM V2 - Edge Function : Désactivation/Réactivation d'un commercial
 *
 * Ban ou unban un utilisateur côté Supabase Auth.
 * Met à jour is_active dans user_roles et statut dans commerciaux.
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

    const { userId, disabled } = await req.json();
    if (!userId || typeof disabled !== 'boolean') {
      return jsonResponse({ error: 'userId et disabled requis' }, 400);
    }

    if (userId === caller.id) {
      return jsonResponse({ error: 'Impossible de désactiver votre propre compte' }, 400);
    }

    // Vérifier que la cible appartient à la même org (sauf super_admin)
    if (callerRole.role === 'admin_org') {
      const { data: targetRole } = await adminClient
        .from('user_roles')
        .select('organization_id')
        .eq('user_id', userId)
        .single();

      if (!targetRole || targetRole.organization_id !== callerRole.organization_id) {
        return jsonResponse({ error: 'Utilisateur hors de votre organisation' }, 403);
      }
    }

    // Ban/unban côté Supabase Auth
    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      ban_duration: disabled ? '876000h' : 'none',
    });

    if (updateError) {
      return jsonResponse({ error: `Erreur: ${updateError.message}` }, 500);
    }

    // Mettre à jour user_roles.is_active
    await adminClient
      .from('user_roles')
      .update({ is_active: !disabled })
      .eq('user_id', userId);

    // Mettre à jour commerciaux.statut
    await adminClient
      .from('commerciaux')
      .update({ statut: disabled ? 'inactif' : 'actif' })
      .eq('user_id', userId);

    // Logger
    await adminClient.from('journal_actions_commercial').insert({
      organization_id: callerRole.organization_id,
      utilisateur_id: caller.id,
      utilisateur_nom: 'Admin',
      action_type: disabled ? 'commercial_removed' : 'commercial_added',
      action: disabled ? 'Désactivation d\'un commercial' : 'Réactivation d\'un commercial',
      entite_type: 'commercial',
      entite_id: userId,
      cible: userId,
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    });

    console.log(`[disable-user] ${disabled ? 'Désactivé' : 'Réactivé'} user ${userId}`);
    return jsonResponse({ success: true });

  } catch (error) {
    console.error('[disable-user] Error:', error);
    return jsonResponse({ error: error instanceof Error ? error.message : 'Erreur interne' }, 500);
  }
});
