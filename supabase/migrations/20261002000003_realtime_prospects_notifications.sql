-- Temps réel : rend les mises à jour instantanées côté client.
--
-- `AuthContext` souscrit à `postgres_changes` sur `prospects`,
-- `notifications_commercial` et `notifications_admin_commercial` afin
-- d'appliquer chaque INSERT / UPDATE / DELETE à l'instant, sans attendre de
-- rechargement de page ni de polling.
--
-- Supabase ne diffuse ces événements que pour les tables présentes dans la
-- publication `supabase_realtime` : ce bloc les y ajoute si besoin.
-- Il est idempotent (une table déjà publiée est ignorée).

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'prospects',
    'notifications_commercial',
    'notifications_admin_commercial'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = tbl
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tbl);
      raise notice 'realtime: table % ajoutée à la publication supabase_realtime', tbl;
    end if;
  end loop;
end $$;
