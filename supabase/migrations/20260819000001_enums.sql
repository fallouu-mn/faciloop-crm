-- ============================================
-- Migration 1 : Enums + Fonction utilitaire
-- Faciloop CRM Multi-Tenant
-- ============================================

-- 1. Rôles CRM
CREATE TYPE role_crm AS ENUM ('super_admin', 'admin_org', 'commercial');

-- 2. Statut organisation
CREATE TYPE statut_organization AS ENUM ('actif', 'inactif', 'suspendu');

-- 3. Pipeline 12 étapes
CREATE TYPE etape_pipeline AS ENUM (
  'nouveau_prospect',
  'a_contacter',
  'contacte',
  'interesse',
  'rdv_programme',
  'demo_realisee',
  'essai_en_cours',
  'proposition_envoyee',
  'paiement_en_attente',
  'client_gagne',
  'a_relancer_plus_tard',
  'prospect_perdu'
);

-- 4. Source prospect
CREATE TYPE source_prospect AS ENUM (
  'prospection_terrain',
  'appel_entrant',
  'whatsapp',
  'facebook',
  'instagram',
  'tiktok',
  'site_internet',
  'recommandation',
  'partenaire',
  'evenement',
  'programme_accompagnement',
  'campagne_marketing',
  'autre'
);

-- 5. Type action
CREATE TYPE type_action AS ENUM (
  'appel_effectue',
  'appel_sans_reponse',
  'message_whatsapp',
  'email',
  'visite_terrain',
  'rdv',
  'demonstration',
  'proposition_commerciale',
  'relance',
  'paiement_recu',
  'autre'
);

-- 6. Motif perte
CREATE TYPE motif_perte AS ENUM (
  'prix_trop_eleve',
  'absence_budget',
  'pas_interesse',
  'solution_non_adaptee',
  'projet_reporte',
  'impossible_a_joindre',
  'concurrent_choisi',
  'probleme_technique',
  'decisionnaire_non_convaincu',
  'autre'
);

-- 7. Statut compte
CREATE TYPE statut_compte AS ENUM (
  'compte_a_creer',
  'configuration_en_cours',
  'actif',
  'suspendu',
  'inactif',
  'resilie',
  'compte_test'
);

-- 8. Statut abonnement
CREATE TYPE statut_abonnement_commercial AS ENUM (
  'essai',
  'en_attente_paiement',
  'actif',
  'paiement_partiel',
  'paiement_en_retard',
  'expire',
  'suspendu',
  'resilie'
);

-- 9. Mode paiement
CREATE TYPE mode_paiement_commercial AS ENUM (
  'wave',
  'orange_money',
  'paytech',
  'stripe',
  'virement',
  'especes',
  'cheque',
  'autre'
);

-- 10. Statut paiement
CREATE TYPE statut_paiement_commercial AS ENUM (
  'en_attente',
  'paye',
  'partiellement_paye',
  'echoue',
  'rembourse',
  'annule'
);

-- 11. Type action journal
CREATE TYPE type_action_journal AS ENUM (
  'creation_utilisateur',
  'modification_role',
  'attribution_prospect',
  'changement_commercial',
  'modification_abonnement',
  'activation_compte',
  'desactivation_compte',
  'suspension_compte',
  'modification_paiement',
  'suppression_fiche',
  'archivage_fiche',
  'export_donnees',
  'conversion_client',
  'changement_statut_pipeline',
  'creation_prospect',
  'modification_objectif'
);

-- 12. Canal relance
CREATE TYPE canal_relance AS ENUM ('appel', 'whatsapp', 'email', 'visite', 'autre');

-- 13. Type notification admin
CREATE TYPE type_notification_admin_commercial AS ENUM (
  'baisse_activite',
  'prospect_non_traite',
  'paiement_en_retard',
  'abonnement_expire',
  'client_inactif',
  'compte_suspendu',
  'objectif_non_atteint',
  'prospects_perdus_anormal'
);

-- 14. Type notification commercial
CREATE TYPE type_notification_commercial AS ENUM (
  'nouveau_prospect_attribue',
  'relance_du_jour',
  'relance_en_retard',
  'rdv_a_venir',
  'prospect_sans_activite',
  'essai_bientot_termine',
  'paiement_en_attente',
  'renouvellement_a_venir'
);

-- 15. Période objectif
CREATE TYPE periode_objectif AS ENUM ('hebdomadaire', 'mensuel', 'trimestriel', 'annuel');

-- 16. Type objectif
CREATE TYPE type_objectif AS ENUM (
  'prospects_a_contacter',
  'rdv',
  'demonstrations',
  'nouveaux_clients',
  'ca_signe',
  'ca_encaisse',
  'renouvellements',
  'taux_conversion'
);

-- 17. Statut interaction
CREATE TYPE statut_interaction AS ENUM ('prevue', 'realisee', 'annulee', 'en_retard');

-- 18. Statut relance
CREATE TYPE statut_relance AS ENUM ('prevue', 'realisee', 'annulee', 'en_retard');

-- 19. Statut objectif
CREATE TYPE statut_objectif AS ENUM ('en_cours', 'atteint', 'non_atteint', 'depasse');

-- 20. Statut commercial
CREATE TYPE statut_commercial AS ENUM ('actif', 'inactif');

-- 21. Devise
CREATE TYPE devise_commercial AS ENUM ('XOF', 'EUR', 'USD');

-- 22. Périodicité abonnement
CREATE TYPE periodicite_abonnement AS ENUM ('mensuel', 'trimestriel', 'annuel');

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
