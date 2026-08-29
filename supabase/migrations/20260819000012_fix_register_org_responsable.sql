-- ============================================
-- Migration 12 : Stocker le prenom/nom du responsable lors de l'inscription
-- Met à jour la RPC register_organization pour remplir responsable_prenom / responsable_nom
-- + RPC get_org_admin_name pour récupérer le nom de l'admin côté client
-- + Backfill des orgs existantes
-- ============================================

-- 1. Mettre à jour la RPC register_organization
CREATE OR REPLACE FUNCTION register_organization(
  _user_id UUID,
  _nom_org TEXT,
  _prenom TEXT,
  _nom TEXT,
  _telephone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _org_id UUID;
BEGIN
  INSERT INTO organizations (nom, statut, devise_defaut, telephone, responsable_prenom, responsable_nom)
  VALUES (_nom_org, 'en_attente', 'XOF', _telephone, _prenom, _nom)
  RETURNING id INTO _org_id;

  INSERT INTO user_roles (user_id, organization_id, role, is_active)
  VALUES (_user_id, _org_id, 'admin_org', true);

  RETURN _org_id;
END;
$$;

-- 2. RPC pour récupérer le prénom/nom de l'admin_org d'une organisation
CREATE OR REPLACE FUNCTION get_org_admin_name(_org_id UUID)
RETURNS TABLE(first_name TEXT, last_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(u.raw_user_meta_data->>'first_name', '')::TEXT AS first_name,
    COALESCE(u.raw_user_meta_data->>'last_name', '')::TEXT AS last_name
  FROM user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.organization_id = _org_id
    AND ur.role = 'admin_org'
  LIMIT 1;
END;
$$;

-- 3. Backfill : remplir responsable_prenom/nom pour les orgs existantes qui n'en ont pas
UPDATE organizations o
SET
  responsable_prenom = COALESCE(u.raw_user_meta_data->>'first_name', ''),
  responsable_nom    = COALESCE(u.raw_user_meta_data->>'last_name', '')
FROM user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.organization_id = o.id
  AND ur.role = 'admin_org'
  AND (o.responsable_prenom IS NULL OR o.responsable_prenom = '')
  AND (o.responsable_nom IS NULL OR o.responsable_nom = '');

-- 4. Fonction pour expirer automatiquement les abonnements dépassés
CREATE OR REPLACE FUNCTION expire_overdue_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _count INTEGER;
BEGIN
  UPDATE organizations
  SET statut_abonnement = 'expire'
  WHERE statut_abonnement = 'actif'
    AND date_fin_abonnement IS NOT NULL
    AND date_fin_abonnement < CURRENT_DATE;
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

-- Exécuter immédiatement pour les abonnements déjà expirés
SELECT expire_overdue_subscriptions();
