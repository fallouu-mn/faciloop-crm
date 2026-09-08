-- ============================================
-- Migration : Étapes pipeline personnalisables par organisation
-- Remplace l'ENUM fixe par une table dynamique
-- ============================================

-- 1. Table des étapes pipeline
CREATE TABLE etapes_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,           -- slug technique (ex: 'nouveau', 'contacte', 'mon_etape_custom')
  label TEXT NOT NULL,         -- libellé affiché (ex: 'Nouveau', 'Contacté', 'Ma étape custom')
  ordre INTEGER NOT NULL,      -- position dans le pipeline (1, 2, 3...)
  couleur TEXT NOT NULL DEFAULT 'border-gray-500',  -- classe Tailwind pour la couleur
  badge_bg TEXT DEFAULT 'bg-gray-500/10 text-gray-500',
  icone TEXT DEFAULT 'Circle',  -- nom de l'icône Lucide
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, nom)
);

ALTER TABLE etapes_pipeline ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_etapes_pipeline_updated_at
  BEFORE UPDATE ON etapes_pipeline
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- RLS
CREATE POLICY "Super admin full access etapes"
  ON etapes_pipeline FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE POLICY "Admin org full access own etapes"
  ON etapes_pipeline FOR ALL TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND has_role(auth.uid(), 'admin_org')
  );

CREATE POLICY "Commercial can read own org etapes"
  ON etapes_pipeline FOR SELECT TO authenticated
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

-- 2. Convertir prospects.statut_pipeline de ENUM vers TEXT
ALTER TABLE prospects
  ALTER COLUMN statut_pipeline TYPE TEXT USING statut_pipeline::TEXT;

ALTER TABLE prospects
  ALTER COLUMN statut_pipeline SET DEFAULT 'nouveau';

-- Supprimer l'ancien type ENUM devenu inutile
DROP TYPE IF EXISTS etape_pipeline;

-- 3. Fonction pour insérer les 12 étapes par défaut pour une organisation
CREATE OR REPLACE FUNCTION insert_default_etapes_pipeline(org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO etapes_pipeline (organization_id, nom, label, ordre, couleur, badge_bg, icone, is_default)
  VALUES
    (org_id, 'nouveau',         'Nouveau',          1,  'border-blue-500',    'bg-blue-500/10 text-blue-500',       'Inbox',         true),
    (org_id, 'a_contacter',     'À contacter',      2,  'border-sky-500',     'bg-sky-500/10 text-sky-500',         'PhoneCall',     true),
    (org_id, 'contacte',        'Contacté',         3,  'border-indigo-500',  'bg-indigo-500/10 text-indigo-500',   'PhoneCall',     true),
    (org_id, 'interesse',       'Intéressé',        4,  'border-cyan-500',    'bg-cyan-500/10 text-cyan-500',       'Sparkles',      true),
    (org_id, 'rdv_programme',   'RDV programmé',    5,  'border-purple-500',  'bg-purple-500/10 text-purple-500',   'Calendar',      true),
    (org_id, 'demo_realisee',   'Démo réalisée',    6,  'border-violet-500',  'bg-violet-500/10 text-violet-500',   'Calendar',      true),
    (org_id, 'essai_en_cours',  'Essai en cours',   7,  'border-teal-500',    'bg-teal-500/10 text-teal-500',       'Clock',         true),
    (org_id, 'proposition',     'Proposition',      8,  'border-amber-500',   'bg-amber-500/10 text-amber-500',     'FileText',      true),
    (org_id, 'paiement_att',    'Paiement att.',    9,  'border-orange-500',  'bg-orange-500/10 text-orange-500',   'CalendarClock', true),
    (org_id, 'gagne',           'Client gagné',     10, 'border-emerald-500', 'bg-emerald-500/10 text-emerald-500', 'Trophy',        true),
    (org_id, 'a_relancer',      'À relancer',       11, 'border-yellow-500',  'bg-yellow-500/10 text-yellow-500',   'CalendarClock', true),
    (org_id, 'perdu',           'Perdu',            12, 'border-rose-500',    'bg-rose-500/10 text-rose-500',       'FolderX',       true)
  ON CONFLICT (organization_id, nom) DO NOTHING;
END;
$$;

-- 4. Insérer les étapes par défaut pour toutes les organisations existantes
DO $$
DECLARE
  org RECORD;
BEGIN
  FOR org IN SELECT id FROM organizations LOOP
    PERFORM insert_default_etapes_pipeline(org.id);
  END LOOP;
END;
$$;

-- 5. Trigger : auto-insérer les étapes par défaut pour chaque nouvelle organisation
CREATE OR REPLACE FUNCTION trigger_insert_default_etapes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM insert_default_etapes_pipeline(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_new_org_default_etapes
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_insert_default_etapes();
