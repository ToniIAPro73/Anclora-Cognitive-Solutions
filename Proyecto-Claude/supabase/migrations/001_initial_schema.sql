-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: clients
-- =============================================
CREATE TABLE clients (
  client_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Indexes for clients
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_company ON clients(company_name);

-- =============================================
-- TABLE: projects
-- =============================================
CREATE TABLE projects (
  project_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
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

-- Indexes for projects
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status) WHERE archived = FALSE;
CREATE INDEX idx_projects_deadline ON projects(deadline) WHERE status NOT IN ('completed', 'cancelled');

-- =============================================
-- TABLE: quotes
-- =============================================
CREATE TABLE quotes (
  quote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
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

-- Trigger to auto-increment version
CREATE OR REPLACE FUNCTION set_quote_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(
    (SELECT MAX(version) + 1 FROM quotes WHERE project_id = NEW.project_id),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_quote
BEFORE INSERT ON quotes
FOR EACH ROW
WHEN (NEW.version IS NULL)
EXECUTE FUNCTION set_quote_version();

-- Indexes for quotes
CREATE INDEX idx_quotes_project ON quotes(project_id);
CREATE INDEX idx_quotes_status ON quotes(status);

-- =============================================
-- TABLE: invoices
-- =============================================
CREATE TABLE invoices (
  invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(project_id) ON DELETE RESTRICT,
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

-- Trigger to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := TO_CHAR(NOW(), 'YYYY-MM') || '-' || LPAD(
    (
      SELECT COALESCE(MAX(CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)), 0) + 1
      FROM invoices
      WHERE invoice_number LIKE TO_CHAR(NOW(), 'YYYY-MM') || '-%'
    )::TEXT, 4, '0'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_invoice
BEFORE INSERT ON invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION generate_invoice_number();

-- Indexes for invoices
CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date) WHERE status IN ('sent', 'overdue');

-- =============================================
-- TABLE: alerts
-- =============================================
CREATE TABLE alerts (
  alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(client_id) ON DELETE CASCADE,
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

-- Indexes for alerts
CREATE INDEX idx_alerts_unread ON alerts(is_read, created_at) WHERE is_read = FALSE;
CREATE INDEX idx_alerts_project ON alerts(project_id) WHERE project_id IS NOT NULL;

-- =============================================
-- TABLE: audit_logs
-- =============================================
CREATE TABLE audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(10) CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_date ON audit_logs(changed_at DESC);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
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

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_projects
AFTER INSERT OR UPDATE OR DELETE ON projects
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_quotes
AFTER INSERT OR UPDATE OR DELETE ON quotes
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- =============================================
-- Function: Update updated_at timestamp
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables with updated_at column
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
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
CREATE POLICY "Admins full access on clients"
ON clients FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Clients read own data"
ON clients FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Projects policies
CREATE POLICY "Admins full access on projects"
ON projects FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Clients read own projects"
ON projects FOR SELECT
TO authenticated
USING (client_id = auth.uid());

-- Quotes policies
CREATE POLICY "Admins full access on quotes"
ON quotes FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Clients read own quotes"
ON quotes FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM projects WHERE client_id = auth.uid()
  )
);

-- Invoices policies
CREATE POLICY "Admins full access on invoices"
ON invoices FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Clients read own invoices"
ON invoices FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT project_id FROM projects WHERE client_id = auth.uid()
  )
);

-- Alerts policies (admin only)
CREATE POLICY "Admins full access on alerts"
ON alerts FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Audit logs policies (admin read-only)
CREATE POLICY "Admins read audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());

-- =============================================
-- STORAGE BUCKETS SETUP (run in Supabase dashboard)
-- =============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES
--   ('quotes-pdfs', 'quotes-pdfs', true),
--   ('invoices-pdfs', 'invoices-pdfs', true);
