-- ============================================================
-- Backfill notifications_admin_commercial
-- Reconstruit les alertes et événements importants effectués
-- avant la mise en place du système de notifications.
-- Idempotent : peut être rejoué sans créer de doublons.
-- ============================================================

-- 1. NOUVEAU CLIENT — un client créé = une notification nouveau_client
INSERT INTO notifications_admin_commercial (
  organization_id, type, titre, message, cible, lien, lue, created_at
)
SELECT
  c.organization_id,
  'nouveau_client',
  'Nouveau client : ' || c.entreprise,
  'Le prospect ' || c.entreprise || ' a été converti en client (formule ' || c.formule_souscrite || ').',
  c.entreprise,
  '/admin/clients',
  true,
  c.created_at
FROM clients_faciloop c
WHERE NOT EXISTS (
  SELECT 1 FROM notifications_admin_commercial n
  WHERE n.organization_id = c.organization_id
    AND n.type = 'nouveau_client'
    AND n.cible = c.entreprise
);

-- 2. PAIEMENT REÇU — chaque paiement validé
INSERT INTO notifications_admin_commercial (
  organization_id, type, titre, message, cible, lien, lue, created_at
)
SELECT
  p.organization_id,
  'paiement_recu',
  'Paiement reçu — ' || p.entreprise,
  'Paiement de ' || p.montant_paye || ' FCFA reçu le ' || p.date_paiement || ' (' || p.mode_paiement || ').',
  p.entreprise,
  '/admin/paiements',
  true,
  p.created_at
FROM paiements p
WHERE p.statut = 'valide'
  AND NOT EXISTS (
    SELECT 1 FROM notifications_admin_commercial n
    WHERE n.organization_id = p.organization_id
      AND n.type = 'paiement_recu'
      AND n.cible = p.entreprise
      AND n.created_at::date = p.created_at::date
  );


-- 4. ABONNEMENT EXPIRÉ — clients avec statut_abonnement = 'expire'
INSERT INTO notifications_admin_commercial (
  organization_id, type, titre, message, cible, lien, lue, created_at
)
SELECT
  c.organization_id,
  'abonnement_expire',
  'Abonnement expiré — ' || c.entreprise,
  'L''abonnement de ' || c.entreprise || ' (formule ' || c.formule_souscrite || ') a expiré.',
  c.entreprise,
  '/admin/clients',
  false,
  COALESCE(c.updated_at, c.created_at)
FROM clients_faciloop c
WHERE c.statut_abonnement = 'expire'
  AND NOT EXISTS (
    SELECT 1 FROM notifications_admin_commercial n
    WHERE n.organization_id = c.organization_id
      AND n.type = 'abonnement_expire'
      AND n.cible = c.entreprise
  );

-- 5. CLIENT INACTIF — clients suspendus
INSERT INTO notifications_admin_commercial (
  organization_id, type, titre, message, cible, lien, lue, created_at
)
SELECT
  c.organization_id,
  'client_inactif',
  'Client inactif — ' || c.entreprise,
  'Le compte de ' || c.entreprise || ' est suspendu.',
  c.entreprise,
  '/admin/clients',
  false,
  COALESCE(c.updated_at, c.created_at)
FROM clients_faciloop c
WHERE c.statut_compte = 'suspendu'
  AND NOT EXISTS (
    SELECT 1 FROM notifications_admin_commercial n
    WHERE n.organization_id = c.organization_id
      AND n.type = 'client_inactif'
      AND n.cible = c.entreprise
  );

-- 6. COMPTE SUSPENDU — clients désactivés
INSERT INTO notifications_admin_commercial (
  organization_id, type, titre, message, cible, lien, lue, created_at
)
SELECT
  c.organization_id,
  'compte_suspendu',
  'Compte désactivé — ' || c.entreprise,
  'Le compte de ' || c.entreprise || ' a été désactivé.',
  c.entreprise,
  '/admin/clients',
  false,
  COALESCE(c.updated_at, c.created_at)
FROM clients_faciloop c
WHERE c.statut_compte = 'inactif'
  AND NOT EXISTS (
    SELECT 1 FROM notifications_admin_commercial n
    WHERE n.organization_id = c.organization_id
      AND n.type = 'compte_suspendu'
      AND n.cible = c.entreprise
  );

-- 7. OBJECTIF ATTEINT — statut 'atteint' ou 'depasse', ou realise >= objectif
INSERT INTO notifications_admin_commercial (
  organization_id, type, titre, message, cible, lien, lue, created_at
)
SELECT
  o.organization_id,
  'objectif_atteint',
  'Objectif atteint — ' || COALESCE(o.commercial_nom, 'Commercial'),
  COALESCE(o.commercial_nom, 'Un commercial') || ' a atteint son objectif ' || o.type
    || ' (' || o.realise::text || '/' || o.objectif::text || ').',
  COALESCE(o.commercial_nom, 'Commercial'),
  '/admin/objectifs',
  true,
  COALESCE(o.updated_at, o.created_at)
FROM objectifs_commerciaux o
WHERE (o.statut IN ('atteint', 'depasse') OR (o.objectif > 0 AND o.realise >= o.objectif))
  AND NOT EXISTS (
    SELECT 1 FROM notifications_admin_commercial n
    WHERE n.organization_id = o.organization_id
      AND n.type = 'objectif_atteint'
      AND n.cible = COALESCE(o.commercial_nom, 'Commercial')
      AND n.created_at::date = COALESCE(o.updated_at, o.created_at)::date
  );

-- 8. OBJECTIF NON ATTEINT — statut 'non_atteint'
INSERT INTO notifications_admin_commercial (
  organization_id, type, titre, message, cible, lien, lue, created_at
)
SELECT
  o.organization_id,
  'objectif_non_atteint',
  'Objectif non atteint — ' || COALESCE(o.commercial_nom, 'Commercial'),
  COALESCE(o.commercial_nom, 'Un commercial') || ' n''a pas atteint son objectif ' || o.type
    || ' (' || o.realise::text || '/' || o.objectif::text || ').',
  COALESCE(o.commercial_nom, 'Commercial'),
  '/admin/objectifs',
  false,
  COALESCE(o.updated_at, o.created_at)
FROM objectifs_commerciaux o
WHERE o.statut = 'non_atteint'
  AND NOT EXISTS (
    SELECT 1 FROM notifications_admin_commercial n
    WHERE n.organization_id = o.organization_id
      AND n.type = 'objectif_non_atteint'
      AND n.cible = COALESCE(o.commercial_nom, 'Commercial')
      AND n.created_at::date = COALESCE(o.updated_at, o.created_at)::date
  );
