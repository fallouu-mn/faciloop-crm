-- Migration CRM Faciloop : Tables interactions + clients_faciloop

-- ============================================
-- 1. TABLE interactions
-- ============================================

CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  type type_action NOT NULL,
  statut statut_interaction DEFAULT 'prevue',
  date DATE NOT NULL,
  heure TIME NOT NULL,
  commentaire TEXT,
  prochaine_action TEXT,
  date_prochaine_relance DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. TRIGGER set_interactions_updated_at
-- ============================================

CREATE TRIGGER set_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 3. TABLE clients_faciloop
-- ============================================

CREATE TABLE clients_faciloop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id UUID UNIQUE REFERENCES prospects(id),
  entreprise TEXT NOT NULL,
  nom_responsable TEXT NOT NULL,
  telephone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  pays TEXT NOT NULL,
  ville TEXT,
  secteur_activite TEXT,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  formule_souscrite TEXT NOT NULL,
  statut_compte statut_compte DEFAULT 'compte_a_creer',
  statut_abonnement statut_abonnement_commercial DEFAULT 'en_attente_paiement',
  montant_paye INTEGER DEFAULT 0,
  prochain_renouvellement DATE,
  fonctionnalites_activees TEXT[] DEFAULT '{}',
  nombre_utilisateurs INTEGER DEFAULT 1,
  derniere_connexion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clients_faciloop ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. TRIGGER set_clients_faciloop_updated_at
-- ============================================

CREATE TRIGGER set_clients_faciloop_updated_at
  BEFORE UPDATE ON clients_faciloop
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 5. RLS POLICIES sur interactions
-- ============================================

CREATE POLICY "Super admin full access"
  ON interactions FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON interactions FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can manage own interactions"
  ON interactions FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );

-- ============================================
-- 6. RLS POLICIES sur clients_faciloop
-- ============================================

CREATE POLICY "Super admin full access"
  ON clients_faciloop FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON clients_faciloop FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can manage own clients"
  ON clients_faciloop FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );
