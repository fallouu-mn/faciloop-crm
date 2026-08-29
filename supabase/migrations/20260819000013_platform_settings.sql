CREATE TABLE IF NOT EXISTS platform_settings (
  id              INTEGER PRIMARY KEY DEFAULT 1,
  nom_plateforme  TEXT NOT NULL DEFAULT 'Faciloop SaaS',
  devise_defaut   TEXT NOT NULL DEFAULT 'XOF',
  email_support   TEXT,
  whatsapp_support TEXT,
  message_maintenance TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Singleton row
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Constraint: only one row ever allowed
CREATE UNIQUE INDEX IF NOT EXISTS platform_settings_singleton ON platform_settings ((id));

-- RLS : lecture publique (hook utilisé sur login/pending), écriture super_admin uniquement
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_settings_read_all"
  ON platform_settings FOR SELECT
  USING (true);

CREATE POLICY "platform_settings_write_super_admin"
  ON platform_settings FOR ALL
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));
