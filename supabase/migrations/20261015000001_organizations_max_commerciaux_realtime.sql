-- ====================================================================
-- Migration : Ajout de max_commerciaux sur organizations + activation Realtime
-- ====================================================================

-- 1. Colonne max_commerciaux (quota personnalisé défini par le superadmin)
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS max_commerciaux INTEGER DEFAULT NULL;

COMMENT ON COLUMN public.organizations.max_commerciaux IS 
  'Quota maximum de commerciaux attribué par le superadmin. Prioritaire sur la limite du forfait. NULL = utilise la limite de la formule.';

-- 2. Configuration REPLICA IDENTITY FULL pour propager toutes les colonnes lors des UPDATEs
ALTER TABLE public.organizations REPLICA IDENTITY FULL;
ALTER TABLE public.commerciaux REPLICA IDENTITY FULL;

-- 3. Ajout à la publication supabase_realtime pour les mises à jour instantanées
DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['organizations', 'commerciaux']
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
      RAISE NOTICE 'realtime: table % ajoutée à supabase_realtime', tbl;
    END IF;
  END LOOP;
END $$;
