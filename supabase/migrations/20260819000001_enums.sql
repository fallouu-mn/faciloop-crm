-- ============================================
-- Migration 1 : Enums + Fonction utilitaire
-- Faciloop CRM Multi-Tenant
-- Aligné sur les types TypeScript du front
-- ============================================

-- 1. Rôles CRM
CREATE TYPE role_crm AS ENUM ('super_admin', 'admin_org', 'commercial');

-- 2. Statut organisation
CREATE TYPE statut_organization AS ENUM ('actif', 'inactif', 'suspendu');

-- 3. Pipeline 12 étapes (aligné sur PipelineStepId du front)
CREATE TYPE etape_pipeline AS ENUM (
  'nouveau',
  'a_contacter',
  'contacte',
  'interesse',
  'rdv_programme',
  'demo_realisee',
  'essai_en_cours',
  'proposition',
  'paiement_att',
  'gagne',
  'a_relancer',
  'perdu'
);

-- 4. Source prospect (aligné sur ProspectSource du front)
CREATE TYPE source_prospect AS ENUM (
  'site_web',
  'prospection_directe',
  'recommandation',
  'reseaux_sociaux',
  'whatsapp',
  'evenement',
  'autre'
);

-- 5. Type interaction (aligné sur InteractionType du front)
CREATE TYPE type_interaction AS ENUM (
  'appel',
  'whatsapp',
  'email',
  'visite',
  'rdv',
  'demonstration',
  'autre'
);

-- 6. Motif perte (aligné sur MotifPerte du front)
CREATE TYPE motif_perte AS ENUM (
  'prix_trop_eleve',
  'concurrent',
  'pas_de_besoin_actuel',
  'injoignable',
  'mauvais_timing',
  'autre'
);

-- 7. Statut compte client
CREATE TYPE statut_compte AS ENUM ('actif', 'suspendu', 'inactif');

-- 8. Statut abonnement (aligné sur AbonnementStatut du front)
CREATE TYPE statut_abonnement AS ENUM ('actif', 'en_attente', 'expire', 'suspendu');

-- 9. Mode paiement (aligné sur ModePaiement du front)
CREATE TYPE mode_paiement AS ENUM (
  'wave',
  'orange_money',
  'paytech',
  'stripe',
  'virement',
  'espece'
);

-- 10. Statut paiement (aligné sur PaiementStatut du front)
CREATE TYPE statut_paiement AS ENUM ('valide', 'en_attente', 'echoue', 'rembourse');

-- 11. Type action journal (aligné sur ActionLogType du front)
CREATE TYPE type_action_journal AS ENUM (
  'prospect_created',
  'prospect_updated',
  'prospect_pipeline_move',
  'prospect_converted',
  'prospect_lost',
  'client_created',
  'client_updated',
  'offer_created',
  'offer_updated',
  'offer_deleted',
  'subscription_created',
  'subscription_updated',
  'objectif_created',
  'objectif_updated',
  'payment_received',
  'payment_updated',
  'org_settings_updated',
  'commercial_added',
  'commercial_removed',
  'prospect_reassigned',
  'other'
);

-- 12. Canal relance (aligné sur RelanceCanal du front)
CREATE TYPE canal_relance AS ENUM ('appel', 'whatsapp', 'email', 'visite', 'autre');

-- 13. Statut interaction (aligné sur InteractionStatut du front)
CREATE TYPE statut_interaction AS ENUM ('planifiee', 'realisee', 'annulee');

-- 14. Statut relance (aligné sur RelanceStatut du front)
CREATE TYPE statut_relance AS ENUM ('prevue', 'realisee', 'annulee', 'en_retard');

-- 15. Période objectif (aligné sur ObjectifPeriode du front)
CREATE TYPE periode_objectif AS ENUM ('mensuel', 'trimestriel', 'annuel');

-- 16. Type objectif (aligné sur ObjectifType du front)
CREATE TYPE type_objectif AS ENUM ('prospects', 'rdv', 'ventes', 'ca');

-- 17. Statut objectif
CREATE TYPE statut_objectif AS ENUM ('en_cours', 'atteint', 'non_atteint', 'depasse');

-- 18. Statut commercial
CREATE TYPE statut_commercial AS ENUM ('actif', 'inactif');

-- 19. Périodicité abonnement
CREATE TYPE periodicite_abonnement AS ENUM ('mensuel', 'trimestriel', 'annuel');

-- 20. Statut commission
CREATE TYPE statut_commission AS ENUM ('a_verser', 'verse', 'annule');

-- ============================================
-- Fonction utilitaire : set_updated_at()
-- ============================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
