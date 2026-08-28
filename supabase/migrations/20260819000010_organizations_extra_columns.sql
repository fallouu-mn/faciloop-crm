-- ============================================
-- Migration 10 : Colonnes complémentaires pour organizations
-- (paramètres entreprise : coordonnées, secteur, etc.)
-- ============================================

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS pays TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS ville TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS adresse TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS telephone TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS site_web TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS secteur TEXT;
