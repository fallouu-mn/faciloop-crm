-- ============================================
-- Migration 2 : Tables organizations, user_roles + fonctions auth + RLS
-- ============================================

-- 1. TABLE organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  logo_url TEXT,
  devise_defaut TEXT DEFAULT 'XOF',
  statut statut_organization DEFAULT 'actif',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 2. TABLE user_roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role role_crm NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. FONCTION is_super_admin
CREATE OR REPLACE FUNCTION is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin' AND is_active = true
  );
$$;

-- 4. FONCTION has_role
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role role_crm)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND is_active = true
  );
$$;

-- 5. FONCTION get_user_organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT organization_id FROM public.user_roles
  WHERE user_id = _user_id AND is_active = true AND role != 'super_admin'
  LIMIT 1;
$$;

-- 6. RLS sur organizations
CREATE POLICY "Super admin full access"
  ON organizations FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org can view own org"
  ON organizations FOR SELECT TO authenticated
  USING (id = get_user_organization_id(auth.uid()));

CREATE POLICY "Admin org can update own org"
  ON organizations FOR UPDATE TO authenticated
  USING (
    id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

-- 7. RLS sur user_roles
CREATE POLICY "Super admin full access"
  ON user_roles FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin org can manage roles in own org"
  ON user_roles FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );
