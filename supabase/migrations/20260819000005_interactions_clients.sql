-- ============================================
-- Migration 5 : Tables interactions + clients_faciloop
-- ============================================

-- 1. TABLE interactions
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  commercial_id UUID REFERENCES commerciaux(id),
  type type_interaction NOT NULL,
  statut statut_interaction DEFAULT 'realisee',
  date DATE NOT NULL,
  heure TEXT,
  commentaire TEXT,
  prochaine_action TEXT,
  date_prochaine_relance DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 2. TABLE clients_faciloop
CREATE TABLE clients_faciloop (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prospect_id UUID UNIQUE REFERENCES prospects(id),
  commercial_id UUID REFERENCES commerciaux(id),
  entreprise TEXT NOT NULL,
  nom_responsable TEXT NOT NULL,
  telephone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  pays TEXT,
  ville TEXT,
  secteur_activite TEXT,
  formule_souscrite TEXT NOT NULL,
  statut_compte statut_compte DEFAULT 'actif',
  statut_abonnement statut_abonnement DEFAULT 'en_attente',
  montant_paye INTEGER DEFAULT 0,
  prochain_renouvellement DATE,
  fonctionnalites_activees TEXT[] DEFAULT '{}',
  nombre_utilisateurs INTEGER DEFAULT 1,
  derniere_connexion TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE clients_faciloop ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_clients_faciloop_updated_at
  BEFORE UPDATE ON clients_faciloop
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 3. RLS sur interactions
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

-- 4. RLS sur clients_faciloop
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
