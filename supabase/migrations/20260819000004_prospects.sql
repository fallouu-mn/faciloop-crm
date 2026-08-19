-- Migration CRM Faciloop : Table prospects

-- ============================================
-- 1. TABLE prospects
-- ============================================

CREATE TABLE prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  nom TEXT NOT NULL,
  prenom TEXT,
  entreprise TEXT,
  telephone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  pays TEXT NOT NULL,
  ville TEXT,
  adresse TEXT,
  secteur_activite TEXT,
  source source_prospect NOT NULL,
  statut_pipeline etape_pipeline DEFAULT 'nouveau_prospect',
  formule_envisagee TEXT,
  budget_estime INTEGER,
  commentaire TEXT,
  motif_perte motif_perte,
  date_prochaine_relance DATE,
  date_derniere_interaction TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, telephone)
);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. TRIGGER set_prospects_updated_at
-- ============================================

CREATE TRIGGER set_prospects_updated_at
  BEFORE UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 3. RLS POLICIES
-- ============================================

CREATE POLICY "Super admin full access"
  ON prospects FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON prospects FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can manage own prospects"
  ON prospects FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );
