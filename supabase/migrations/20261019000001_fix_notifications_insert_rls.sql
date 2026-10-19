-- ============================================================================
-- Fix : impossible de créer une notification commerciale (mentions @, attributions)
-- ============================================================================
--
-- La table `notifications_commercial` ne possédait aucune politique INSERT
-- réellement utilisable (20260819000007) :
--
--   • "Super admin full access"                     -> FOR ALL
--   • "Admin org can view own org notifications"    -> FOR SELECT seulement
--   • "Commercial can manage own notifications"     -> FOR ALL, mais
--        WITH CHECK (commercial_id = soi-même)
--
-- Conséquence : `createNotification()` échouait systématiquement (RLS 42501)
--   - quand un admin taguait un collègue depuis une note de prospect,
--   - quand un admin attribuait / réattribuait un prospect à un commercial,
--   - quand un commercial taguait un autre commercial.
-- L'appel étant enveloppé dans `.catch(() => {})`, l'échec était totalement
-- silencieux : la note s'enregistrait, mais aucune notification n'existait.
--
-- Les politiques permissives de PostgreSQL se combinent avec OR : on ajoute
-- donc une politique INSERT sans toucher aux politiques SELECT existantes.
-- Chacun continue de ne lire que ses propres notifications.

-- Les commerciaux ne peuvent pas lire le profil de leurs collègues
-- ("Commercial can view own profile" : user_id = auth.uid()), donc une
-- sous-requête directe sur `commerciaux` échouerait. Ce helper SECURITY DEFINER
-- contourne la RLS, comme has_role / get_user_organization_id.
CREATE OR REPLACE FUNCTION public.is_commercial_in_org(_commercial_id UUID, _organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.commerciaux
    WHERE id = _commercial_id AND organization_id = _organization_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_commercial_in_org(UUID, UUID) TO authenticated;

-- Un membre de l'organisation peut notifier un commercial de la même
-- organisation (couvre admin_org -> commercial et commercial -> collègue).
DROP POLICY IF EXISTS "Org members can notify own org commercials" ON notifications_commercial;
CREATE POLICY "Org members can notify own org commercials"
  ON notifications_commercial FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND is_commercial_in_org(commercial_id, organization_id)
  );
