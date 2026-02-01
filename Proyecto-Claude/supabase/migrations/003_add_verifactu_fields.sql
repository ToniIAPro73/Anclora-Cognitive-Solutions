-- =============================================
-- VERIFACTU INTEGRATION - Migration 003
-- =============================================

-- Set search path
SET search_path TO anclora;

-- =============================================
-- ALTER TABLE: invoices - Add Verifactu fields
-- =============================================

ALTER TABLE anclora.invoices
  ADD COLUMN IF NOT EXISTS verifactu_status VARCHAR(20) DEFAULT 'not_registered'
    CHECK (verifactu_status IN ('not_registered', 'pending', 'registered', 'error', 'cancelled')),
  ADD COLUMN IF NOT EXISTS verifactu_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS verifactu_qr TEXT,
  ADD COLUMN IF NOT EXISTS verifactu_csv VARCHAR(50),
  ADD COLUMN IF NOT EXISTS verifactu_url TEXT,
  ADD COLUMN IF NOT EXISTS verifactu_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS verifactu_registered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verifactu_error_message TEXT;

-- Index for Verifactu status queries
CREATE INDEX IF NOT EXISTS idx_anclora_invoices_verifactu_status
  ON anclora.invoices(verifactu_status)
  WHERE verifactu_status != 'not_registered';

-- =============================================
-- TABLE: verifactu_config - Global configuration
-- =============================================

CREATE TABLE IF NOT EXISTS anclora.verifactu_config (
  config_id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  nif_emisor VARCHAR(20) NOT NULL,
  nombre_emisor VARCHAR(150) NOT NULL,
  entorno VARCHAR(20) DEFAULT 'sandbox' CHECK (entorno IN ('sandbox', 'production')),
  api_key TEXT,
  api_secret TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  software_id VARCHAR(50) DEFAULT 'ANCLORA-COG-001',
  software_version VARCHAR(20) DEFAULT '1.0.0',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Only one configuration row allowed
  CONSTRAINT single_config CHECK (config_id IS NOT NULL)
);

-- Ensure only one config row exists
CREATE UNIQUE INDEX IF NOT EXISTS idx_anclora_verifactu_config_singleton
  ON anclora.verifactu_config ((true));

-- Insert default config row if not exists
INSERT INTO anclora.verifactu_config (nif_emisor, nombre_emisor, enabled)
VALUES ('', '', FALSE)
ON CONFLICT DO NOTHING;

-- =============================================
-- TABLE: verifactu_logs - Audit trail
-- =============================================

CREATE TABLE IF NOT EXISTS anclora.verifactu_logs (
  log_id BIGSERIAL PRIMARY KEY,
  invoice_id UUID REFERENCES anclora.invoices(invoice_id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL CHECK (
    action IN ('register', 'retry', 'cancel', 'query', 'config_update')
  ),
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('pending', 'success', 'error')
  ),
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anclora_verifactu_logs_invoice
  ON anclora.verifactu_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_anclora_verifactu_logs_action
  ON anclora.verifactu_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anclora_verifactu_logs_status
  ON anclora.verifactu_logs(status) WHERE status = 'error';

-- =============================================
-- Updated_at trigger for verifactu_config
-- =============================================

CREATE TRIGGER update_anclora_verifactu_config_updated_at
BEFORE UPDATE ON anclora.verifactu_config
FOR EACH ROW EXECUTE FUNCTION anclora.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE anclora.verifactu_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE anclora.verifactu_logs ENABLE ROW LEVEL SECURITY;

-- Verifactu config policies (admin only)
CREATE POLICY "Admins full access on anclora.verifactu_config"
ON anclora.verifactu_config FOR ALL
TO authenticated
USING (anclora.is_admin())
WITH CHECK (anclora.is_admin());

-- Verifactu logs policies (admin only)
CREATE POLICY "Admins full access on anclora.verifactu_logs"
ON anclora.verifactu_logs FOR ALL
TO authenticated
USING (anclora.is_admin())
WITH CHECK (anclora.is_admin());

-- =============================================
-- Grant permissions on new tables
-- =============================================

GRANT ALL ON anclora.verifactu_config TO postgres, anon, authenticated, service_role;
GRANT ALL ON anclora.verifactu_logs TO postgres, anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE anclora.verifactu_logs_log_id_seq TO postgres, anon, authenticated, service_role;
