-- ============================================
-- Migration 9 : Flux inscription organisation
-- Ajout statut 'en_attente' + RPC register_organization
-- ============================================

-- 1. Ajouter 'en_attente' à l'enum statut_organization
ALTER TYPE statut_organization ADD VALUE IF NOT EXISTS 'en_attente' BEFORE 'actif';

-- 2. RPC appelée après signUp pour créer org + role + commercial en une transaction
-- SECURITY DEFINER pour bypasser RLS (l'utilisateur vient d'être créé, pas encore de rôle)
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
  -- Créer l'organisation avec statut en_attente
  INSERT INTO organizations (nom, statut, devise_defaut, telephone)
  VALUES (_nom_org, 'en_attente', 'XOF', _telephone)
  RETURNING id INTO _org_id;

  -- Créer le rôle admin_org
  INSERT INTO user_roles (user_id, organization_id, role, is_active)
  VALUES (_user_id, _org_id, 'admin_org', true);

  RETURN _org_id;
END;
$$;
