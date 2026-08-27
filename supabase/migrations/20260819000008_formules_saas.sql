-- Table de configuration des formules d'abonnement SaaS
-- Gérée par le super_admin via la page Abonnements

CREATE TABLE formules_saas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  label text NOT NULL,
  description text DEFAULT '',
  prix_xof integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  pricing_mensuel integer NOT NULL DEFAULT 0,
  pricing_mensuel_premier_mois integer,
  pricing_trimestriel integer NOT NULL DEFAULT 0,
  pricing_trimestriel_normal integer NOT NULL DEFAULT 0,
  pricing_trimestriel_remise integer NOT NULL DEFAULT 0,
  pricing_annuel integer NOT NULL DEFAULT 0,
  pricing_annuel_normal integer NOT NULL DEFAULT 0,
  pricing_annuel_remise integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE formules_saas ENABLE ROW LEVEL SECURITY;

-- Lecture publique (landing page pricing)
CREATE POLICY "formules_saas_read_all" ON formules_saas
  FOR SELECT USING (true);

-- Écriture réservée aux utilisateurs authentifiés (super_admin vérifié côté app)
CREATE POLICY "formules_saas_write_auth" ON formules_saas
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
