 -- Seed data CRM Faciloop : données de test

  -- ============================================
  -- ÉTAPE 1 : Créer les users dans Supabase Auth (à faire MANUELLEMENT dans le dashboard)
  -- Aller dans Authentication > Users > Add user (méthode Email, cocher Auto Confirm)
  -- Créer 4 users :
  --   1. Email: 221770000000@faciloop.app | Password: 123456 (Super Admin)
  --   2. Email: 221770000001@faciloop.app | Password: 123456 (Admin Org)
  --   3. Email: 221770000002@faciloop.app | Password: 123456 (Commercial 1)
  --   4. Email: 221770000003@faciloop.app | Password: 123456 (Commercial 2)
  -- ============================================

  -- ============================================
  -- ÉTAPE 3 : Créer une organisation de test
  -- ============================================

  INSERT INTO organizations (id, nom, logo_url, devise_defaut, statut)
  VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Digit''Advisor Test',
    NULL,
    'XOF',
    'actif'
  );

  -- ============================================
  -- ÉTAPE 4 : Créer les rôles dans user_roles
  -- ============================================

  INSERT INTO user_roles (user_id, organization_id, role, is_active) VALUES
    ('4cde95a5-1d74-4bcf-8409-8c6d80344311', 'a0000000-0000-0000-0000-000000000001', 'super_admin', true),
    ('5ad70a30-3e14-41ab-95fc-250a5fd28bbf', 'a0000000-0000-0000-0000-000000000001', 'admin_org', true),
    ('d60bb15f-8d7a-4df7-a712-a08e70b4d978', 'a0000000-0000-0000-0000-000000000001', 'commercial', true),
    ('27e3d84a-5042-46e2-8cbb-adf2f3e8ae74', 'a0000000-0000-0000-0000-000000000001', 'commercial', true);

  -- ============================================
  -- ÉTAPE 5 : Créer les profils commerciaux
  -- ============================================

  INSERT INTO commerciaux (id, organization_id, user_id, nom, prenom, email, telephone, statut) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '5ad70a30-3e14-41ab-95fc-250a5fd28bbf',
  'Diallo', 'Amadou', 'adminorg@faciloop.test', '+221770000001', 'actif'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd60bb15f-8d7a-4df7-a712-a08e70b4d978',
  'Ndiaye', 'Fatou', 'commercial1@faciloop.test', '+221770000002', 'actif'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', '27e3d84a-5042-46e2-8cbb-adf2f3e8ae74', 'Sow',
  'Moussa', 'commercial2@faciloop.test', '+221770000003', 'actif');

  -- ============================================
  -- ÉTAPE 6 : Créer des prospects de test (attribués aux commerciaux)
  -- ============================================

  INSERT INTO prospects (organization_id, commercial_id, nom, prenom, entreprise, telephone, pays, ville, source, statut_pipeline)
  VALUES
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Ba', 'Ousmane', 'Sénégal Services SARL',
  '+221760000001', 'Sénégal', 'Dakar', 'prospection_terrain', 'nouveau_prospect'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Diop', 'Aissatou', 'Teranga Digital',
  '+221760000002', 'Sénégal', 'Dakar', 'whatsapp', 'contacte'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Fall', 'Ibrahima', 'Africa Tech Solutions',
  '+221760000003', 'Sénégal', 'Thiès', 'recommandation', 'rdv_programme'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Gueye', 'Mariama', 'Dakar Import-Export',
  '+221760000004', 'Sénégal', 'Dakar', 'facebook', 'interesse'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Sy', 'Abdoulaye', 'West Africa Logistics',
  '+221760000005', 'Sénégal', 'Saint-Louis', 'appel_entrant', 'demo_realisee'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'Mbaye', 'Coumba', 'Jokkoo Communication',
  '+221760000006', 'Sénégal', 'Dakar', 'instagram', 'proposition_envoyee');

  -- ============================================
  -- ÉTAPE 7 : Créer des objectifs de test
  -- ============================================

  INSERT INTO objectifs_commerciaux (organization_id, commercial_id, periode, date_debut, date_fin, type, valeur_cible,
  valeur_actuelle, statut) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'mensuel', '2026-08-01', '2026-08-31',
  'nouveaux_clients', 5, 2, 'en_cours'),
    ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'mensuel', '2026-08-01', '2026-08-31', 'rdv',
  10, 4, 'en_cours');

  -- ============================================
  -- COMPTES DE TEST (pour se connecter) :
  -- Super Admin  : tél +221 77 000 0000 | code 123456
  -- Admin Org    : tél +221 77 000 0001 | code 123456
  -- Commercial 1 : tél +221 77 000 0002 | code 123456
  -- Commercial 2 : tél +221 77 000 0003 | code 123456
  -- ============================================
