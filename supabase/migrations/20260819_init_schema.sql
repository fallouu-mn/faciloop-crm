-- ============================================================================
-- FACILOOP CRM B2B SAAS MULTI-TENANT - SUPABASE MIGRATION SCHEMA (V1 -> V2)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE tenant_statut AS ENUM ('actif', 'inactif', 'suspendu');
CREATE TYPE user_role_enum AS ENUM ('super_admin', 'admin_org', 'commercial');
CREATE TYPE commercial_statut AS ENUM ('actif', 'inactif');
CREATE TYPE prospect_source_enum AS ENUM ('site_web', 'prospection_directe', 'recommandation', 'reseaux_sociaux', 'whatsapp', 'evenement', 'autre');
CREATE TYPE motif_perte_enum AS ENUM ('prix_trop_eleve', 'concurrent', 'pas_de_besoin_actuel', 'injoignable', 'mauvais_timing', 'autre');
CREATE TYPE interaction_type_enum AS ENUM ('appel', 'whatsapp', 'email', 'visite', 'rdv', 'demonstration', 'autre');
CREATE TYPE interaction_statut_enum AS ENUM ('planifiee', 'realisee', 'annulee');
CREATE TYPE relance_canal_enum AS ENUM ('appel', 'whatsapp', 'email', 'visite', 'autre');
CREATE TYPE relance_statut_enum AS ENUM ('prevue', 'realisee', 'annulee', 'en_retard');
CREATE TYPE mode_paiement_enum AS ENUM ('wave', 'orange_money', 'paytech', 'stripe', 'virement', 'espece');
CREATE TYPE abonnement_statut_enum AS ENUM ('actif', 'en_attente', 'expire', 'suspendu');
CREATE TYPE paiement_statut_enum AS ENUM ('valide', 'en_attente', 'echoue', 'rembourse');
CREATE TYPE objectif_periode_enum AS ENUM ('mensuel', 'trimestriel', 'annuel');
CREATE TYPE objectif_type_enum AS ENUM ('nombre_prospects', 'nombre_rdv', 'ventes_conclues', 'ca_genere');
CREATE TYPE objectif_statut_enum AS ENUM ('en_cours', 'atteint', 'depasse', 'non_atteint');

-- 3. TABLES DEFINITION

-- 3.1 Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    logo_url TEXT,
    devise_defaut TEXT NOT NULL DEFAULT 'XOF',
    statut tenant_statut NOT NULL DEFAULT 'actif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 User Roles
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- references auth.users(id)
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'commercial',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Commerciaux
CREATE TABLE IF NOT EXISTS commerciaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID, -- Optional linkage to auth.users
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telephone TEXT NOT NULL,
    avatar TEXT,
    statut commercial_statut NOT NULL DEFAULT 'actif',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Prospects
CREATE TABLE IF NOT EXISTS prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    commercial_id UUID REFERENCES commerciaux(id) ON DELETE SET NULL,
    nom TEXT NOT NULL,
    prenom TEXT,
    entreprise TEXT NOT NULL,
    telephone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    pays TEXT DEFAULT 'Sénégal',
    ville TEXT,
    adresse TEXT,
    secteur_activite TEXT,
    source prospect_source_enum DEFAULT 'prospection_directe',
    formule_envisagee TEXT,
    budget_estime NUMERIC,
    commentaire TEXT,
    motif_perte motif_perte_enum,
    date_prochaine_relance DATE,
    date_derniere_interaction TIMESTAMPTZ,
    statut_pipeline TEXT NOT NULL DEFAULT 'nouveau',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour détection rapide des doublons par téléphone et tenant
CREATE INDEX IF NOT EXISTS idx_prospects_org_phone ON prospects(organization_id, telephone);

-- 3.5 Clients Faciloop
CREATE TABLE IF NOT EXISTS clients_faciloop (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prospect_id UUID UNIQUE REFERENCES prospects(id) ON DELETE SET NULL,
    commercial_id UUID REFERENCES commerciaux(id) ON DELETE SET NULL,
    entreprise TEXT NOT NULL,
    nom_responsable TEXT NOT NULL,
    telephone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    pays TEXT DEFAULT 'Sénégal',
    ville TEXT,
    secteur_activite TEXT,
    formule_souscrite TEXT NOT NULL,
    statut_compte TEXT DEFAULT 'actif',
    statut_abonnement abonnement_statut_enum DEFAULT 'actif',
    montant_paye NUMERIC DEFAULT 0,
    prochain_renouvellement DATE,
    fonctionnalites_activees TEXT[],
    nombre_utilisateurs INTEGER DEFAULT 1,
    derniere_connexion TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 Interactions
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    commercial_id UUID REFERENCES commerciaux(id) ON DELETE SET NULL,
    type interaction_type_enum NOT NULL DEFAULT 'appel',
    statut interaction_statut_enum DEFAULT 'realisee',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    heure TIME DEFAULT CURRENT_TIME,
    commentaire TEXT,
    prochaine_action TEXT,
    date_prochaine_relance DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Relances
CREATE TABLE IF NOT EXISTS relances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
    commercial_id UUID REFERENCES commerciaux(id) ON DELETE SET NULL,
    prospect_nom TEXT NOT NULL,
    prospect_entreprise TEXT NOT NULL,
    date DATE NOT NULL,
    heure TIME DEFAULT '09:00',
    canal relance_canal_enum NOT NULL DEFAULT 'appel',
    motif TEXT,
    commentaire TEXT,
    statut relance_statut_enum NOT NULL DEFAULT 'prevue',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.8 Abonnements
CREATE TABLE IF NOT EXISTS abonnements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients_faciloop(id) ON DELETE CASCADE,
    commercial_id UUID REFERENCES commerciaux(id) ON DELETE SET NULL,
    entreprise TEXT NOT NULL,
    formule_souscrite TEXT NOT NULL,
    prix NUMERIC NOT NULL,
    devise TEXT DEFAULT 'XOF',
    periodicite TEXT DEFAULT 'mensuel',
    date_debut DATE NOT NULL,
    date_echeance DATE NOT NULL,
    statut abonnement_statut_enum NOT NULL DEFAULT 'actif',
    mode_paiement mode_paiement_enum DEFAULT 'wave',
    paiement_fractionne BOOLEAN DEFAULT FALSE,
    reduction_pourcent INTEGER DEFAULT 0,
    justificatif_commentaire TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.9 Paiements
CREATE TABLE IF NOT EXISTS paiements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients_faciloop(id) ON DELETE CASCADE,
    abonnement_id UUID REFERENCES abonnements(id) ON DELETE SET NULL,
    commercial_id UUID REFERENCES commerciaux(id) ON DELETE SET NULL,
    entreprise TEXT NOT NULL,
    montant_attendu NUMERIC NOT NULL,
    montant_paye NUMERIC NOT NULL,
    montant_restant NUMERIC DEFAULT 0,
    date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
    mode_paiement mode_paiement_enum NOT NULL DEFAULT 'wave',
    reference_transaction TEXT,
    statut paiement_statut_enum NOT NULL DEFAULT 'valide',
    justificatif_commentaire TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.10 Objectifs Commerciaux
CREATE TABLE IF NOT EXISTS objectifs_commerciaux (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    commercial_id UUID NOT NULL REFERENCES commerciaux(id) ON DELETE CASCADE,
    periode objectif_periode_enum NOT NULL DEFAULT 'mensuel',
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    type objectif_type_enum NOT NULL DEFAULT 'prospects',
    valeur_cible NUMERIC NOT NULL,
    valeur_actuelle NUMERIC DEFAULT 0,
    statut objectif_statut_enum NOT NULL DEFAULT 'en_cours',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.11 Notifications Commercial
CREATE TABLE IF NOT EXISTS notifications_commercial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    commercial_id UUID NOT NULL REFERENCES commerciaux(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    titre TEXT NOT NULL,
    message TEXT NOT NULL,
    lien TEXT,
    lue BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.12 Notifications Admin
CREATE TABLE IF NOT EXISTS notifications_admin_commercial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    titre TEXT NOT NULL,
    message TEXT NOT NULL,
    lien TEXT,
    lue BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.13 Journal Actions (Audit Log)
CREATE TABLE IF NOT EXISTS journal_actions_commercial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    utilisateur_id TEXT NOT NULL,
    utilisateur_nom TEXT NOT NULL,
    action TEXT NOT NULL,
    cible TEXT,
    ancienne_valeur TEXT,
    nouvelle_valeur TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    heure TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerciaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_faciloop ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE relances ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonnements ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectifs_commerciaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_commercial ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_admin_commercial ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_actions_commercial ENABLE ROW LEVEL SECURITY;
