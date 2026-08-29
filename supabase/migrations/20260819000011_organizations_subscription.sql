-- ============================================
-- Migration 11 : Colonnes abonnement SaaS sur organizations
-- (formule, periodicite, prix, dates, statut abonnement)
-- ============================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS formule_code TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS periodicite TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS prix_abonnement INTEGER DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS date_debut_abonnement DATE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS date_fin_abonnement DATE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS statut_abonnement TEXT DEFAULT 'inactif';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS responsable_nom TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS responsable_prenom TEXT;
