-- Migration CRM Faciloop : Tables objectifs_commerciaux, journal_actions_commercial, notifications

-- ============================================
-- 1. TABLE objectifs_commerciaux
-- ============================================

CREATE TABLE objectifs_commerciaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  periode periode_objectif NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE NOT NULL,
  type type_objectif NOT NULL,
  valeur_cible NUMERIC NOT NULL,
  valeur_actuelle NUMERIC DEFAULT 0,
  statut statut_objectif DEFAULT 'en_cours',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE objectifs_commerciaux ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. TRIGGER set_objectifs_commerciaux_updated_at
-- ============================================

CREATE TRIGGER set_objectifs_commerciaux_updated_at
  BEFORE UPDATE ON objectifs_commerciaux
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ============================================
-- 3. TABLE journal_actions_commercial
-- ============================================

CREATE TABLE journal_actions_commercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  utilisateur_id TEXT NOT NULL,
  utilisateur_nom TEXT NOT NULL,
  action type_action_journal NOT NULL,
  cible TEXT NOT NULL,
  ancienne_valeur TEXT,
  nouvelle_valeur TEXT,
  date DATE NOT NULL,
  heure TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_actions_commercial ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. TABLE notifications_admin_commercial
-- ============================================

CREATE TABLE notifications_admin_commercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type type_notification_admin_commercial NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  cible TEXT,
  lien TEXT,
  lue BOOLEAN DEFAULT false,
  date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications_admin_commercial ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. TABLE notifications_commercial
-- ============================================

CREATE TABLE notifications_commercial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  commercial_id UUID NOT NULL REFERENCES commerciaux(id),
  type type_notification_commercial NOT NULL,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  lien TEXT,
  lue BOOLEAN DEFAULT false,
  date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications_commercial ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS POLICIES sur objectifs_commerciaux
-- ============================================

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

-- ============================================
-- 7. RLS POLICIES sur journal_actions_commercial
-- ============================================

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

-- ============================================
-- 8. RLS POLICIES sur notifications_admin_commercial
-- ============================================

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

-- ============================================
-- 9. RLS POLICIES sur notifications_commercial
-- ============================================

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
