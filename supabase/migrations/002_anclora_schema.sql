-- =============================================
-- ANCLORA SCHEMA - Separate from public schema
-- =============================================

-- Create schema
CREATE SCHEMA IF NOT EXISTS anclora;

-- Grant permissions
GRANT USAGE ON SCHEMA anclora TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA anclora TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA anclora TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA anclora GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA anclora GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Set search path for this session
SET search_path TO anclora;

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- =============================================
-- TABLE: clients
-- =============================================
CREATE TABLE anclora.clients (
  client_id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  nif_cif VARCHAR(20),
  preferred_language VARCHAR(2) DEFAULT 'es' CHECK (preferred_language IN ('es', 'en', 'ca')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anclora_clients_email ON anclora.clients(email);
CREATE INDEX idx_anclora_clients_company ON anclora.clients(company_name);

-- =============================================
-- TABLE: projects
-- =============================================
CREATE TABLE anclora.projects (
  project_id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  client_id UUID REFERENCES anclora.clients(client_id) ON DELETE CASCADE,
  project_name VARCHAR(150) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'backlog' CHECK (
    status IN ('backlog', 'proposal', 'approved', 'in_progress', 'testing', 'completed', 'cancelled')
  ),
  budget DECIMAL(10, 2),
  deadline DATE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anclora_projects_client ON anclora.projects(client_id);
CREATE INDEX idx_anclora_projects_status ON anclora.projects(status) WHERE archived = FALSE;
CREATE INDEX idx_anclora_projects_deadline ON anclora.projects(deadline) WHERE status NOT IN ('completed', 'cancelled');

-- =============================================
-- TABLE: quotes
-- =============================================
CREATE TABLE anclora.quotes (
  quote_id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  project_id UUID REFERENCES anclora.projects(project_id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected')
  ),
  language VARCHAR(2) DEFAULT 'es',
  tone VARCHAR(20),
  content_json JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  iva DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  UNIQUE(project_id, version)
);

CREATE INDEX idx_anclora_quotes_project ON anclora.quotes(project_id);
CREATE INDEX idx_anclora_quotes_status ON anclora.quotes(status);

-- Quote version trigger
CREATE OR REPLACE FUNCTION anclora.set_quote_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(
    (SELECT MAX(version) + 1 FROM anclora.quotes WHERE project_id = NEW.project_id),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_anclora_quote
BEFORE INSERT ON anclora.quotes
FOR EACH ROW
WHEN (NEW.version IS NULL)
EXECUTE FUNCTION anclora.set_quote_version();

-- =============================================
-- TABLE: invoices
-- =============================================
CREATE TABLE anclora.invoices (
  invoice_id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  project_id UUID REFERENCES anclora.projects(project_id) ON DELETE RESTRICT,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')
  ),
  line_items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  iva DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  pdf_url TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (due_date > issue_date)
);

CREATE INDEX idx_anclora_invoices_project ON anclora.invoices(project_id);
CREATE INDEX idx_anclora_invoices_status ON anclora.invoices(status);
CREATE INDEX idx_anclora_invoices_due ON anclora.invoices(due_date) WHERE status IN ('sent', 'overdue');

-- Invoice number trigger
CREATE OR REPLACE FUNCTION anclora.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'ANC-' || TO_CHAR(NOW(), 'YYYY-MM') || '-' || LPAD(
    (
      SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 4) AS INTEGER)), 0) + 1
      FROM anclora.invoices
      WHERE invoice_number LIKE 'ANC-' || TO_CHAR(NOW(), 'YYYY-MM') || '-%'
    )::TEXT, 4, '0'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_anclora_invoice
BEFORE INSERT ON anclora.invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION anclora.generate_invoice_number();

-- =============================================
-- TABLE: alerts
-- =============================================
CREATE TABLE anclora.alerts (
  alert_id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  project_id UUID REFERENCES anclora.projects(project_id) ON DELETE CASCADE,
  client_id UUID REFERENCES anclora.clients(client_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('deadline_approaching', 'budget_exceeded', 'invoice_overdue', 'project_stale', 'client_inactive')
  ),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CHECK ((project_id IS NOT NULL) OR (client_id IS NOT NULL))
);

CREATE INDEX idx_anclora_alerts_unread ON anclora.alerts(is_read, created_at) WHERE is_read = FALSE;
CREATE INDEX idx_anclora_alerts_project ON anclora.alerts(project_id) WHERE project_id IS NOT NULL;

-- =============================================
-- TABLE: audit_logs
-- =============================================
CREATE TABLE anclora.audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(10) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_anclora_audit_table_record ON anclora.audit_logs(table_name, record_id);
CREATE INDEX idx_anclora_audit_date ON anclora.audit_logs(changed_at DESC);

-- Audit trigger
CREATE OR REPLACE FUNCTION anclora.audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO anclora.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.project_id, OLD.project_id, NEW.client_id, OLD.client_id),
    TG_OP,
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_anclora_projects
AFTER INSERT OR UPDATE OR DELETE ON anclora.projects
FOR EACH ROW EXECUTE FUNCTION anclora.audit_trigger();

CREATE TRIGGER audit_anclora_quotes
AFTER INSERT OR UPDATE OR DELETE ON anclora.quotes
FOR EACH ROW EXECUTE FUNCTION anclora.audit_trigger();

CREATE TRIGGER audit_anclora_invoices
AFTER INSERT OR UPDATE OR DELETE ON anclora.invoices
FOR EACH ROW EXECUTE FUNCTION anclora.audit_trigger();

-- =============================================
-- updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION anclora.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_anclora_clients_updated_at
BEFORE UPDATE ON anclora.clients
FOR EACH ROW EXECUTE FUNCTION anclora.update_updated_at();

CREATE TRIGGER update_anclora_projects_updated_at
BEFORE UPDATE ON anclora.projects
FOR EACH ROW EXECUTE FUNCTION anclora.update_updated_at();

CREATE TRIGGER update_anclora_invoices_updated_at
BEFORE UPDATE ON anclora.invoices
FOR EACH ROW EXECUTE FUNCTION anclora.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE anclora.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE anclora.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE anclora.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE anclora.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE anclora.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE anclora.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION anclora.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'role') = 'admin' OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clients policies
CREATE POLICY "Admins full access on anclora.clients"
ON anclora.clients FOR ALL
TO authenticated
USING (anclora.is_admin())
WITH CHECK (anclora.is_admin());

CREATE POLICY "Clients read own data from anclora.clients"
ON anclora.clients FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Projects policies
CREATE POLICY "Admins full access on anclora.projects"
ON anclora.projects FOR ALL
TO authenticated
USING (anclora.is_admin())
WITH CHECK (anclora.is_admin());

CREATE POLICY "Clients read own anclora.projects"
ON anclora.projects FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Quotes policies
CREATE POLICY "Admins full access on anclora.quotes"
ON anclora.quotes FOR ALL
TO authenticated
USING (anclora.is_admin())
WITH CHECK (anclora.is_admin());

CREATE POLICY "Clients read own anclora.quotes"
ON anclora.quotes FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM anclora.projects WHERE client_id = auth.uid()
  )
);

-- Invoices policies
CREATE POLICY "Admins full access on anclora.invoices"
ON anclora.invoices FOR ALL
TO authenticated
USING (anclora.is_admin())
WITH CHECK (anclora.is_admin());

CREATE POLICY "Clients read own anclora.invoices"
ON anclora.invoices FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM anclora.projects WHERE client_id = auth.uid()
  )
);

-- Alerts policies (admin only)
CREATE POLICY "Admins full access on anclora.alerts"
ON anclora.alerts FOR ALL
TO authenticated
USING (anclora.is_admin())
WITH CHECK (anclora.is_admin());

-- Audit logs policies (admin read-only)
CREATE POLICY "Admins read anclora.audit_logs"
ON anclora.audit_logs FOR SELECT
TO authenticated
USING (anclora.is_admin());

-- =============================================
-- Enable Realtime for projects table
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE anclora.projects;
