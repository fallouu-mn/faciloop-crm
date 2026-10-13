-- Table sources personnalisées par organisation
CREATE TABLE IF NOT EXISTS sources_custom (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  value text NOT NULL,
  label text NOT NULL,
  actif boolean NOT NULL DEFAULT true,
  ordre integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, value)
);

ALTER TABLE sources_custom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sources_custom_org_read" ON sources_custom;
CREATE POLICY "sources_custom_org_read"
  ON sources_custom FOR SELECT TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

DROP POLICY IF EXISTS "sources_custom_admin_insert" ON sources_custom;
CREATE POLICY "sources_custom_admin_insert"
  ON sources_custom FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'admin_org') OR is_super_admin(auth.uid()))
  );

DROP POLICY IF EXISTS "sources_custom_admin_update" ON sources_custom;
CREATE POLICY "sources_custom_admin_update"
  ON sources_custom FOR UPDATE TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'admin_org') OR is_super_admin(auth.uid()))
  );

DROP POLICY IF EXISTS "sources_custom_admin_delete" ON sources_custom;
CREATE POLICY "sources_custom_admin_delete"
  ON sources_custom FOR DELETE TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND (has_role(auth.uid(), 'admin_org') OR is_super_admin(auth.uid()))
  );
