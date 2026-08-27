-- ============================================
-- Migration 7 : Tables objectifs, commissions, journal, notifications
-- ============================================

-- 1. TABLE objectifs_commerciaux
CREATE TABLE objectifs_commerciaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  commercial_nom TEXT,
  type type_objectif NOT NULL,
  objectif NUMERIC NOT NULL,
  realise NUMERIC DEFAULT 0,
  periode periode_objectif NOT NULL,
  date_debut DATE,
  date_fin DATE,
  statut statut_objectif DEFAULT 'en_cours',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE objectifs_commerciaux ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_objectifs_commerciaux_updated_at
  BEFORE UPDATE ON objectifs_commerciaux
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 2. TABLE commissions
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  commercial_nom TEXT,
  client_nom TEXT NOT NULL,
  formule TEXT NOT NULL,
  periodicite periodicite_abonnement NOT NULL,
  montant_vente INTEGER NOT NULL,
  taux_commission NUMERIC NOT NULL,
  montant_commission INTEGER NOT NULL,
  date_vente DATE NOT NULL,
  statut statut_commission DEFAULT 'a_verser',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 3. TABLE journal_actions_commercial
CREATE TABLE journal_actions_commercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  utilisateur_id TEXT NOT NULL,
  utilisateur_nom TEXT NOT NULL,
  action_type type_action_journal NOT NULL,
  action TEXT NOT NULL,
  entite_type TEXT,
  entite_id TEXT,
  cible TEXT,
  ancienne_valeur TEXT,
  nouvelle_valeur TEXT,
  date TEXT NOT NULL,
  heure TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_actions_commercial ENABLE ROW LEVEL SECURITY;

-- 4. TABLE notifications_commercial (pour les commerciaux)
CREATE TABLE notifications_commercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  lien TEXT,
  lue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications_commercial ENABLE ROW LEVEL SECURITY;

-- 5. TABLE notifications_admin_commercial (pour l'admin org)
CREATE TABLE notifications_admin_commercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  cible TEXT,
  lien TEXT,
  lue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications_admin_commercial ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Objectifs
CREATE POLICY "Super admin full access"
  ON objectifs_commerciaux FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON objectifs_commerciaux FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can view own objectifs"
  ON objectifs_commerciaux FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );

-- Commissions
CREATE POLICY "Super admin full access"
  ON commissions FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own org"
  ON commissions FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can view own commissions"
  ON commissions FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );

-- Journal
CREATE POLICY "Super admin full access"
  ON journal_actions_commercial FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org can view own org journal"
  ON journal_actions_commercial FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Admin org can insert in own org journal"
  ON journal_actions_commercial FOR INSERT TO authenticated
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- Notifications commercial
CREATE POLICY "Super admin full access"
  ON notifications_commercial FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org can view own org notifications"
  ON notifications_commercial FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can manage own notifications"
  ON notifications_commercial FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND commercial_id = (SELECT id FROM commerciaux WHERE user_id = auth.uid())
  );

-- Notifications admin
CREATE POLICY "Super admin full access"
  ON notifications_admin_commercial FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org can manage own org notifications"
  ON notifications_admin_commercial FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );
