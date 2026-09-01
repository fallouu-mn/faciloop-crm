-- ============================================================
-- Backfill journal_actions_commercial
-- Reconstruit l'historique des actions effectuées avant la
-- mise en place du système de journalisation automatique.
-- Idempotent : peut être rejoué sans créer de doublons.
-- ============================================================

-- 1. CONVERSIONS PROSPECT → CLIENT
INSERT INTO journal_actions_commercial (
  organization_id, utilisateur_id, utilisateur_nom,
  action_type, action, entite_type, entite_id, cible,
  ancienne_valeur, nouvelle_valeur, date, heure, created_at
)
SELECT
  p.organization_id,
  COALESCE(p.commercial_id, p.organization_id)  AS utilisateur_id,
  COALESCE(p.commercial_nom, 'Système')          AS utilisateur_nom,
  'prospect_converted',
  'Conversion prospect en client',
  'prospect',
  p.id::text,
  p.entreprise,
  'Prospect',
  'Client actif',
  p.created_at::date::text,
  TO_CHAR(p.created_at AT TIME ZONE 'UTC', 'HH24:MI'),
  p.created_at
FROM prospects p
WHERE p.statut_pipeline = 'gagne'
  AND NOT EXISTS (
    SELECT 1 FROM journal_actions_commercial j
    WHERE j.entite_id = p.id::text
      AND j.action_type = 'prospect_converted'
  );

-- 2. CLIENTS CRÉÉS
INSERT INTO journal_actions_commercial (
  organization_id, utilisateur_id, utilisateur_nom,
  action_type, action, entite_type, entite_id, cible,
  nouvelle_valeur, date, heure, created_at
)
SELECT
  c.organization_id,
  COALESCE(c.commercial_id, c.organization_id)  AS utilisateur_id,
  'Système'                                      AS utilisateur_nom,
  'client_created',
  'Création d''un compte client',
  'client',
  c.id::text,
  c.entreprise,
  'Formule: ' || c.formule_souscrite,
  c.created_at::date::text,
  TO_CHAR(c.created_at AT TIME ZONE 'UTC', 'HH24:MI'),
  c.created_at
FROM clients_faciloop c
WHERE NOT EXISTS (
  SELECT 1 FROM journal_actions_commercial j
  WHERE j.entite_id = c.id::text
    AND j.action_type = 'client_created'
);

-- 3. PAIEMENTS REÇUS
INSERT INTO journal_actions_commercial (
  organization_id, utilisateur_id, utilisateur_nom,
  action_type, action, entite_type, entite_id, cible,
  nouvelle_valeur, date, heure, created_at
)
SELECT
  p.organization_id,
  COALESCE(p.commercial_id, p.organization_id)              AS utilisateur_id,
  'Système'                                                  AS utilisateur_nom,
  'payment_received',
  'Paiement reçu',
  'paiement',
  p.id::text,
  p.entreprise,
  p.montant_paye::text || ' FCFA — ' || p.mode_paiement,
  p.date_paiement,
  TO_CHAR(p.created_at AT TIME ZONE 'UTC', 'HH24:MI'),
  p.created_at
FROM paiements p
WHERE p.statut = 'valide'
  AND NOT EXISTS (
    SELECT 1 FROM journal_actions_commercial j
    WHERE j.entite_id = p.id::text
      AND j.action_type = 'payment_received'
  );

-- 4. ABONNEMENTS CRÉÉS
INSERT INTO journal_actions_commercial (
  organization_id, utilisateur_id, utilisateur_nom,
  action_type, action, entite_type, entite_id, cible,
  nouvelle_valeur, date, heure, created_at
)
SELECT
  c.organization_id,
  COALESCE(c.commercial_id, c.organization_id)                         AS utilisateur_id,
  'Système'                                                             AS utilisateur_nom,
  'subscription_created',
  'Création d''un abonnement',
  'abonnement',
  c.id::text,
  c.entreprise,
  c.formule_souscrite || ' — ' || c.montant_paye::text || ' FCFA',
  c.created_at::date::text,
  TO_CHAR(c.created_at AT TIME ZONE 'UTC', 'HH24:MI'),
  c.created_at
FROM clients_faciloop c
WHERE NOT EXISTS (
  SELECT 1 FROM journal_actions_commercial j
  WHERE j.entite_id = c.id::text
    AND j.action_type = 'subscription_created'
);

-- 5. OBJECTIFS CRÉÉS
INSERT INTO journal_actions_commercial (
  organization_id, utilisateur_id, utilisateur_nom,
  action_type, action, entite_type, entite_id, cible,
  nouvelle_valeur, date, heure, created_at
)
SELECT
  o.organization_id,
  o.organization_id                                                     AS utilisateur_id,
  'Système'                                                             AS utilisateur_nom,
  'objectif_created',
  'Définition d''un objectif',
  'objectif',
  o.id::text,
  COALESCE(o.commercial_nom, 'Commercial'),
  o.type || ' — objectif: ' || o.objectif::text,
  o.created_at::date::text,
  TO_CHAR(o.created_at AT TIME ZONE 'UTC', 'HH24:MI'),
  o.created_at
FROM objectifs_commerciaux o
WHERE NOT EXISTS (
  SELECT 1 FROM journal_actions_commercial j
  WHERE j.entite_id = o.id::text
    AND j.action_type = 'objectif_created'
);
