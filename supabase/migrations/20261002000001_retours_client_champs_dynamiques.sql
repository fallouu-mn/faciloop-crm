-- =====================================================================
-- Retours client — Faciloop CRM
--   Point 4 : champs personnalisés (JSONB) + table organization_settings
--   Point 5 : nom / prénom / entreprise non obligatoires
--   Point 6 : sources de prospect personnalisables (enum → TEXT)
-- =====================================================================

-- ---------------------------------------------------------------------
-- POINT 4.1 — Colonne JSONB sur les prospects et les clients
-- ---------------------------------------------------------------------
ALTER TABLE prospects
  ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}';

ALTER TABLE clients_faciloop
  ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}';

COMMENT ON COLUMN prospects.custom_fields IS
  'Valeurs des champs dynamiques définis dans organization_settings.prospect_custom_fields_schema';
COMMENT ON COLUMN clients_faciloop.custom_fields IS
  'Valeurs des champs dynamiques définis dans organization_settings.prospect_custom_fields_schema';

-- ---------------------------------------------------------------------
-- POINT 4.2 — Table organization_settings (1 ligne par organisation)
--   * prospect_custom_fields_schema : configuration des champs dynamiques
--   * custom_sources                : mots-clés de source ajoutés (POINT 6)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_custom_fields_schema JSONB NOT NULL DEFAULT '[]',
  custom_sources JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE organization_settings IS
  'Paramètres par organisation : champs prospects dynamiques + sources personnalisées';

DROP TRIGGER IF EXISTS set_organization_settings_updated_at ON organization_settings;
CREATE TRIGGER set_organization_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin full access org settings" ON organization_settings;
CREATE POLICY "Super admin full access org settings"
  ON organization_settings FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin org full access own settings" ON organization_settings;
CREATE POLICY "Admin org full access own settings"
  ON organization_settings FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

-- Lecture seule pour les commerciaux de l'organisation (ils doivent
-- connaître le libellé des champs dynamiques et la liste des sources)
DROP POLICY IF EXISTS "Commercial can read own org settings" ON organization_settings;
CREATE POLICY "Commercial can read own org settings"
  ON organization_settings FOR SELECT TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

-- Ligne vide pour chaque organisation existante (l'upsert côté client
-- crée la ligne si elle n'existe pas, mais on part d'une base propre)
INSERT INTO organization_settings (organization_id)
SELECT id FROM organizations
ON CONFLICT (organization_id) DO NOTHING;

-- ---------------------------------------------------------------------
-- POINT 5 — nom et entreprise deviennent optionnels en base
-- (le type TypeScript passe en `nom?: string` / `entreprise?: string`)
--   `telephone` reste NOT NULL : c'est le champ de contact obligatoire
--   (contrainte UNIQUE (organization_id, telephone) exigée).
-- ---------------------------------------------------------------------
ALTER TABLE prospects ALTER COLUMN nom DROP NOT NULL;
ALTER TABLE prospects ALTER COLUMN entreprise DROP NOT NULL;

-- ---------------------------------------------------------------------
-- POINT 6 — la colonne source passe de l'ENUM `source_prospect` à TEXT
-- pour accepter les mots-clés ajoutés par l'Admin dans
-- organization_settings.custom_sources.
--   `DROP DEFAULT` est indispensable : PostgreSQL ne sait pas convertir
--   automatiquement un default d'enum en text, l'ALTER échouerait sinon.
-- ---------------------------------------------------------------------
ALTER TABLE prospects
  ALTER COLUMN source DROP DEFAULT;

ALTER TABLE prospects
  ALTER COLUMN source TYPE TEXT USING source::TEXT;

ALTER TABLE prospects
  ALTER COLUMN source SET DEFAULT 'autre';

DROP TYPE IF EXISTS source_prospect;
