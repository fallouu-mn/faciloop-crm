-- Migration CRM Faciloop : Tables abonnements, paiements, relances

-- ============================================
-- 1. TABLE abonnements
-- ============================================

CREATE TABLE abonnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients_faciloop(id) ON DELETE CASCADE,
  entreprise TEXT NOT NULL,
  formule_souscrite TEXT NOT NULL,
  prix INTEGER NOT NULL,
  devise devise_commercial DEFAULT 'XOF',
  periodicite periodicite_abonnement NOT NULL,
  date_debut DATE NOT NULL,
  date_echeance DATE NOT NULL,
  statut statut_abonnement_commercial NOT NULL,
  mode_paiement mode_paiement_commercial NOT NULL,
  paiement_fractionne BOOLEAN DEFAULT false,
  reduction_pourcent INTEGER,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. TRIGGER set_abonnements_updated_at
-- ============================================

CREATE TRIGGER set_abonnements_updated_at
  BEFORE UPDATE ON abonnements
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 3. TABLE paiements
-- ============================================

CREATE TABLE paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients_faciloop(id),
  entreprise TEXT NOT NULL,
  abonnement_id UUID NOT NULL REFERENCES abonnements(id),
  montant_attendu INTEGER NOT NULL,
  montant_paye INTEGER DEFAULT 0,
  montant_restant INTEGER NOT NULL,
  date_paiement DATE NOT NULL,
  mode_paiement mode_paiement_commercial NOT NULL,
  reference_transaction TEXT,
  statut statut_paiement_commercial DEFAULT 'en_attente',
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  justificatif TEXT,
  commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. TRIGGER set_paiements_updated_at
-- ============================================

CREATE TRIGGER set_paiements_updated_at
  BEFORE UPDATE ON paiements
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 5. TABLE relances
-- ============================================

CREATE TABLE relances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  prospect_nom TEXT NOT NULL,
  prospect_entreprise TEXT NOT NULL,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  date DATE NOT NULL,
  heure TIME,
  canal canal_relance NOT NULL,
  motif TEXT NOT NULL,
  commentaire TEXT,
  statut statut_relance DEFAULT 'prevue',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE relances ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. TRIGGER set_relances_updated_at
-- ============================================

CREATE TRIGGER set_relances_updated_at
  BEFORE UPDATE ON relances
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 7. RLS POLICIES sur abonnements
-- ============================================

CREATE POLICY "Super admin full access"
  ON abonnements FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON abonnements FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can manage own abonnements"
  ON abonnements FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );

-- ============================================
-- 8. RLS POLICIES sur paiements
-- ============================================

CREATE POLICY "Super admin full access"
  ON paiements FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON paiements FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can manage own paiements"
  ON paiements FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );

-- ============================================
-- 9. RLS POLICIES sur relances
-- ============================================

CREATE POLICY "Super admin full access"
  ON relances FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON relances FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can manage own relances"
  ON relances FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );
