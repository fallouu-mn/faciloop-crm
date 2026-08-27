-- ============================================
-- Migration 6 : Tables offres_organisation, abonnements, paiements, relances
-- ============================================

-- 1. TABLE offres_organisation (les offres propres à chaque org pour ses clients)
CREATE TABLE offres_organisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  description TEXT,
  tarif_mensuel INTEGER NOT NULL DEFAULT 0,
  tarif_trimestriel INTEGER NOT NULL DEFAULT 0,
  tarif_annuel INTEGER NOT NULL DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE offres_organisation ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_offres_organisation_updated_at
  BEFORE UPDATE ON offres_organisation
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 2. TABLE abonnements
CREATE TABLE abonnements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients_faciloop(id) ON DELETE CASCADE,
  commercial_id UUID REFERENCES commerciaux(id),
  entreprise TEXT NOT NULL,
  formule_souscrite TEXT NOT NULL,
  prix INTEGER NOT NULL,
  devise TEXT DEFAULT 'XOF',
  periodicite periodicite_abonnement NOT NULL,
  date_debut DATE NOT NULL,
  date_echeance DATE NOT NULL,
  statut statut_abonnement DEFAULT 'en_attente',
  mode_paiement mode_paiement NOT NULL,
  paiement_fractionne BOOLEAN DEFAULT false,
  reduction_pourcent INTEGER DEFAULT 0,
  justificatif_commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_abonnements_updated_at
  BEFORE UPDATE ON abonnements
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 3. TABLE paiements
CREATE TABLE paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients_faciloop(id),
  abonnement_id UUID REFERENCES abonnements(id),
  commercial_id UUID REFERENCES commerciaux(id),
  entreprise TEXT NOT NULL,
  montant_attendu INTEGER NOT NULL,
  montant_paye INTEGER DEFAULT 0,
  montant_restant INTEGER NOT NULL,
  date_paiement DATE NOT NULL,
  mode_paiement mode_paiement NOT NULL,
  reference_transaction TEXT,
  statut statut_paiement DEFAULT 'en_attente',
  justificatif_commentaire TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_paiements_updated_at
  BEFORE UPDATE ON paiements
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 4. TABLE relances
CREATE TABLE relances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  prospect_nom TEXT NOT NULL,
  prospect_entreprise TEXT NOT NULL,
  date DATE NOT NULL,
  heure TEXT,
  canal canal_relance NOT NULL,
  motif TEXT,
  commentaire TEXT,
  statut statut_relance DEFAULT 'prevue',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE relances ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_relances_updated_at
  BEFORE UPDATE ON relances
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 5. RLS sur offres_organisation
CREATE POLICY "Super admin full access"
  ON offres_organisation FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org can manage own org offers"
  ON offres_organisation FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can view own org offers"
  ON offres_organisation FOR SELECT TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

-- 6. RLS sur abonnements
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

-- 7. RLS sur paiements
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

-- 8. RLS sur relances
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
