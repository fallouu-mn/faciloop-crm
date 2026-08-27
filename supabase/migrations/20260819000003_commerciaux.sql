-- ============================================
-- Migration 3 : Table commerciaux
-- ============================================

CREATE TABLE commerciaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telephone TEXT NOT NULL,
  statut statut_commercial DEFAULT 'actif',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE commerciaux ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_commerciaux_updated_at
  BEFORE UPDATE ON commerciaux
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- RLS
CREATE POLICY "Super admin full access"
  ON commerciaux FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org can manage own org commerciaux"
  ON commerciaux FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can view own profile"
  ON commerciaux FOR SELECT TO authenticated
  USING (user_id = auth.uid());
