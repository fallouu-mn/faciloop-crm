-- Notes / commentaires sur les fiches prospects avec @mentions
CREATE TABLE IF NOT EXISTS prospect_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id uuid NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_nom text NOT NULL,
  contenu text NOT NULL,
  mentioned_user_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE prospect_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospect_notes_org_read"
  ON prospect_notes FOR SELECT TO authenticated
  USING (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "prospect_notes_org_insert"
  ON prospect_notes FOR INSERT TO authenticated
  WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "prospect_notes_author_delete"
  ON prospect_notes FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE INDEX idx_prospect_notes_prospect ON prospect_notes(prospect_id);
CREATE INDEX idx_prospect_notes_org ON prospect_notes(organization_id);
