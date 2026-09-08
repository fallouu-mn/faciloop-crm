-- Fix: ajouter SECURITY DEFINER aux fonctions etapes_pipeline
-- Fix: supprimer l'ancien type ENUM orphelin

-- 1. Supprimer l'ancien type ENUM devenu inutile
DROP TYPE IF EXISTS etape_pipeline;

-- 2. Recréer insert_default_etapes_pipeline avec SECURITY DEFINER
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

-- 3. Recréer trigger_insert_default_etapes avec SECURITY DEFINER
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
