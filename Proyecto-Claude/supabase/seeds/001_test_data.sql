-- =============================================
-- SEED DATA FOR TESTING
-- Run this in Supabase SQL Editor
-- =============================================

-- Note: The admin user must be created via Supabase Auth Dashboard first
-- Authentication → Users → Add user
-- Then run this script to set up test data

-- =============================================
-- 1. SET ADMIN ROLE FOR TEST USER
-- =============================================
-- Replace 'admin@anclora.app' with your test admin email

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@anclora.app';

-- =============================================
-- 2. SAMPLE CLIENTS
-- =============================================

INSERT INTO clients (company_name, email, contact_person, phone, preferred_language, notes)
VALUES
  ('Acme Corporation', 'contacto@acme.com', 'Juan García', '+34612345678', 'es', 'Cliente desde 2024'),
  ('Tech Solutions SL', 'info@techsolutions.es', 'María López', '+34623456789', 'es', 'Especialistas en software'),
  ('Global Services Ltd', 'hello@globalservices.com', 'John Smith', '+44123456789', 'en', 'UK-based company'),
  ('Innovación Digital', 'hola@innovaciondigital.cat', 'Pere Martí', '+34634567890', 'ca', 'Barcelona startup'),
  ('Consulting Pro', 'contact@consultingpro.es', 'Ana Ruiz', '+34645678901', 'es', NULL)
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 3. SAMPLE PROJECTS
-- =============================================

-- Get client IDs for reference
DO $$
DECLARE
  acme_id UUID;
  tech_id UUID;
  global_id UUID;
  innova_id UUID;
BEGIN
  SELECT client_id INTO acme_id FROM clients WHERE email = 'contacto@acme.com';
  SELECT client_id INTO tech_id FROM clients WHERE email = 'info@techsolutions.es';
  SELECT client_id INTO global_id FROM clients WHERE email = 'hello@globalservices.com';
  SELECT client_id INTO innova_id FROM clients WHERE email = 'hola@innovaciondigital.cat';

  -- Insert projects
  INSERT INTO projects (client_id, project_name, description, status, budget, deadline, priority)
  VALUES
    (acme_id, 'Website Redesign', 'Complete redesign of corporate website', 'backlog', 15000, CURRENT_DATE + INTERVAL '30 days', 'medium'),
    (acme_id, 'CRM Integration', 'Integrate Salesforce with internal systems', 'proposal', 25000, CURRENT_DATE + INTERVAL '60 days', 'high'),
    (tech_id, 'Mobile App MVP', 'Build iOS and Android app for customer portal', 'in_progress', 45000, CURRENT_DATE + INTERVAL '14 days', 'urgent'),
    (tech_id, 'API Development', 'RESTful API for third-party integrations', 'approved', 18000, CURRENT_DATE + INTERVAL '45 days', 'medium'),
    (global_id, 'Cloud Migration', 'Migrate infrastructure to AWS', 'testing', 35000, CURRENT_DATE + INTERVAL '7 days', 'high'),
    (innova_id, 'AI Chatbot', 'Customer service chatbot with NLP', 'in_progress', 28000, CURRENT_DATE + INTERVAL '21 days', 'high'),
    (innova_id, 'Data Analytics Dashboard', 'Business intelligence dashboard', 'completed', 22000, CURRENT_DATE - INTERVAL '10 days', 'medium')
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- 4. SAMPLE QUOTES (for projects with quotes)
-- =============================================

DO $$
DECLARE
  crm_project_id UUID;
  mobile_project_id UUID;
BEGIN
  SELECT project_id INTO crm_project_id FROM projects WHERE project_name = 'CRM Integration';
  SELECT project_id INTO mobile_project_id FROM projects WHERE project_name = 'Mobile App MVP';

  -- Quote for CRM Integration
  INSERT INTO quotes (project_id, version, status, language, tone, content_json, subtotal, iva, total)
  VALUES
    (crm_project_id, 1, 'sent', 'es', 'professional',
     '{"introduction": "Propuesta para integración CRM", "services": [{"name": "Análisis", "hours": 20, "rate": 75}, {"name": "Desarrollo", "hours": 80, "rate": 85}], "timeline": "8 semanas", "payment_terms": "50% inicio, 50% entrega"}',
     8300, 1743, 10043)
  ON CONFLICT DO NOTHING;

  -- Quote for Mobile App
  INSERT INTO quotes (project_id, version, status, language, tone, content_json, subtotal, iva, total)
  VALUES
    (mobile_project_id, 1, 'accepted', 'es', 'friendly',
     '{"introduction": "Desarrollo de app móvil", "services": [{"name": "Diseño UX/UI", "hours": 40, "rate": 70}, {"name": "Desarrollo iOS", "hours": 120, "rate": 90}, {"name": "Desarrollo Android", "hours": 120, "rate": 90}], "timeline": "12 semanas", "payment_terms": "Pagos mensuales"}',
     37200, 7812, 45012)
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- 5. SAMPLE INVOICES
-- =============================================

DO $$
DECLARE
  completed_project_id UUID;
BEGIN
  SELECT project_id INTO completed_project_id FROM projects WHERE project_name = 'Data Analytics Dashboard';

  -- Invoice for completed project
  INSERT INTO invoices (project_id, issue_date, due_date, status, line_items, subtotal, iva, total)
  VALUES
    (completed_project_id, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE - INTERVAL '5 days', 'overdue',
     '[{"description": "Desarrollo Dashboard BI", "quantity": 1, "unit_price": 18181.82}]',
     18181.82, 3818.18, 22000)
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- 6. SAMPLE ALERTS (for testing alert UI)
-- =============================================

DO $$
DECLARE
  mobile_project_id UUID;
  cloud_project_id UUID;
  acme_client_id UUID;
BEGIN
  SELECT project_id INTO mobile_project_id FROM projects WHERE project_name = 'Mobile App MVP';
  SELECT project_id INTO cloud_project_id FROM projects WHERE project_name = 'Cloud Migration';
  SELECT client_id INTO acme_client_id FROM clients WHERE email = 'contacto@acme.com';

  INSERT INTO alerts (project_id, client_id, type, priority, message)
  VALUES
    (mobile_project_id, NULL, 'deadline_approaching', 'high', 'El proyecto "Mobile App MVP" tiene deadline en 14 días'),
    (cloud_project_id, NULL, 'deadline_approaching', 'critical', 'El proyecto "Cloud Migration" tiene deadline en 7 días'),
    (NULL, acme_client_id, 'client_inactive', 'low', 'El cliente "Acme Corporation" no tiene actividad reciente')
  ON CONFLICT DO NOTHING;
END $$;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check counts
SELECT 'clients' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'quotes', COUNT(*) FROM quotes
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'alerts', COUNT(*) FROM alerts;
