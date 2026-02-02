import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: { schema: 'anclora' }
})

// ============================================================================
// CLIENTES - Españoles e Internacionales
// ============================================================================
const clients = [
  // Empresas Españolas
  {
    company_name: 'Tecnologías Mediterráneo S.L.',
    email: 'contacto@tecnomediterraneo.es',
    contact_person: 'María García López',
    phone: '+34 961 234 567',
    address: 'Av. del Puerto 45, 46021 Valencia, España',
    nif_cif: 'B96123456',
    preferred_language: 'es' as const,
    notes: 'Cliente desde 2023. Interesado en soluciones de automatización industrial.',
  },
  {
    company_name: 'Grupo Financiero Castellana',
    email: 'innovacion@gfcastellana.com',
    contact_person: 'Carlos Rodríguez Martín',
    phone: '+34 915 678 901',
    address: 'Paseo de la Castellana 120, 28046 Madrid, España',
    nif_cif: 'A28987654',
    preferred_language: 'es' as const,
    notes: 'Banco regional. Alto presupuesto para proyectos de IA.',
  },
  {
    company_name: 'Clínica Sant Jordi',
    email: 'direccion@clinicasantjordi.cat',
    contact_person: 'Dr. Jordi Puig i Martí',
    phone: '+34 932 456 789',
    address: 'Carrer de Balmes 215, 08006 Barcelona, España',
    nif_cif: 'B08765432',
    preferred_language: 'ca' as const,
    notes: 'Centro médico privado. Buscan IA para diagnóstico por imagen.',
  },
  {
    company_name: 'Bodegas Rioja Ancestral',
    email: 'export@rioja-ancestral.es',
    contact_person: 'Elena Fernández Ruiz',
    phone: '+34 941 567 890',
    address: 'Camino de las Viñas 12, 26200 Haro, La Rioja, España',
    nif_cif: 'B26543210',
    preferred_language: 'es' as const,
    notes: 'Bodega familiar. Interesados en optimización de producción con ML.',
  },
  {
    company_name: 'Logística Express Levante',
    email: 'operaciones@logisticalevante.com',
    contact_person: 'Antonio Navarro Sánchez',
    phone: '+34 965 432 109',
    address: 'Polígono Industrial Torrellano, 03320 Alicante, España',
    nif_cif: 'B03876543',
    preferred_language: 'es' as const,
    notes: 'Empresa de transporte. Necesitan optimización de rutas.',
  },
  // Empresas Internacionales
  {
    company_name: 'TechVentures UK Ltd',
    email: 'partnerships@techventures.co.uk',
    contact_person: 'James Wilson',
    phone: '+44 20 7946 0958',
    address: '15 Finsbury Square, London EC2A 1AH, United Kingdom',
    nif_cif: 'GB123456789',
    preferred_language: 'en' as const,
    notes: 'Startup accelerator. Looking for AI solutions for portfolio companies.',
  },
  {
    company_name: 'Schmidt & Weber GmbH',
    email: 'innovation@schmidt-weber.de',
    contact_person: 'Hans Müller',
    phone: '+49 89 1234 5678',
    address: 'Maximilianstraße 35, 80539 München, Germany',
    nif_cif: 'DE987654321',
    preferred_language: 'en' as const,
    notes: 'Manufacturing company. Industry 4.0 initiatives.',
  },
  {
    company_name: 'DataFlow Analytics Inc.',
    email: 'info@dataflowanalytics.com',
    contact_person: 'Sarah Johnson',
    phone: '+1 415 555 0123',
    address: '500 Terry A Francois Blvd, San Francisco, CA 94158, USA',
    nif_cif: 'US12-3456789',
    preferred_language: 'en' as const,
    notes: 'Data consulting firm. Strategic partnership opportunity.',
  },
  {
    company_name: 'Maison Lumière SARL',
    email: 'contact@maisonlumiere.fr',
    contact_person: 'Pierre Dubois',
    phone: '+33 1 42 68 53 00',
    address: '25 Avenue des Champs-Élysées, 75008 Paris, France',
    nif_cif: 'FR12345678901',
    preferred_language: 'en' as const,
    notes: 'Luxury retail. Interested in personalization AI.',
  },
  {
    company_name: 'Retail Innovación Madrid',
    email: 'tech@retailinnovacion.es',
    contact_person: 'Laura Martínez Vega',
    phone: '+34 917 654 321',
    address: 'Gran Vía 32, 28013 Madrid, España',
    nif_cif: 'B28456789',
    preferred_language: 'es' as const,
    notes: 'Cadena de tiendas. Proyecto piloto de computer vision.',
  },
]

// ============================================================================
// PROYECTOS - Diferentes fases y servicios de IA
// ============================================================================
const getProjects = (clientIds: string[]) => [
  // BACKLOG - Ideas iniciales
  {
    client_id: clientIds[0], // Tecnologías Mediterráneo
    project_name: 'Asistente Virtual para Atención al Cliente',
    description: 'Desarrollo de un chatbot con IA generativa para automatizar la atención al cliente 24/7. Integración con WhatsApp Business y web.',
    status: 'backlog' as const,
    budget: 15000,
    deadline: '2026-06-30',
    priority: 'medium' as const,
  },
  {
    client_id: clientIds[4], // Logística Express
    project_name: 'Sistema Predictivo de Demanda',
    description: 'Modelo de machine learning para predecir volumen de envíos y optimizar recursos de flota.',
    status: 'backlog' as const,
    budget: 22000,
    deadline: '2026-07-15',
    priority: 'low' as const,
  },
  // PROPOSAL - En negociación
  {
    client_id: clientIds[1], // Grupo Financiero Castellana
    project_name: 'Detección de Fraude con ML',
    description: 'Sistema de detección de transacciones fraudulentas en tiempo real usando algoritmos de anomaly detection.',
    status: 'proposal' as const,
    budget: 45000,
    deadline: '2026-05-01',
    priority: 'high' as const,
  },
  {
    client_id: clientIds[5], // TechVentures UK
    project_name: 'AI Due Diligence Platform',
    description: 'Platform to automate startup evaluation using NLP analysis of business plans and market data.',
    status: 'proposal' as const,
    budget: 35000,
    deadline: '2026-04-30',
    priority: 'medium' as const,
  },
  // APPROVED - Listos para comenzar
  {
    client_id: clientIds[2], // Clínica Sant Jordi
    project_name: 'Diagnòstic per Imatge amb Deep Learning',
    description: 'Sistema de suport al diagnòstic radiològic utilitzant xarxes neuronals convolucionals per detectar anomalies en radiografies.',
    status: 'approved' as const,
    budget: 55000,
    deadline: '2026-04-15',
    priority: 'urgent' as const,
  },
  {
    client_id: clientIds[8], // Maison Lumière
    project_name: 'Personalization Engine for E-commerce',
    description: 'AI-powered recommendation system for luxury products based on customer behavior and preferences.',
    status: 'approved' as const,
    budget: 28000,
    deadline: '2026-05-20',
    priority: 'high' as const,
  },
  // IN_PROGRESS - En desarrollo activo
  {
    client_id: clientIds[3], // Bodegas Rioja
    project_name: 'Optimización de Vendimia con IoT e IA',
    description: 'Sistema que combina sensores IoT con modelos predictivos para determinar el momento óptimo de vendimia en cada parcela.',
    status: 'in_progress' as const,
    budget: 32000,
    deadline: '2026-03-15',
    priority: 'high' as const,
  },
  {
    client_id: clientIds[6], // Schmidt & Weber
    project_name: 'Predictive Maintenance System',
    description: 'ML-based system to predict equipment failures in manufacturing lines, reducing downtime by 40%.',
    status: 'in_progress' as const,
    budget: 48000,
    deadline: '2026-03-30',
    priority: 'urgent' as const,
  },
  {
    client_id: clientIds[9], // Retail Innovación
    project_name: 'Análisis de Tráfico en Tienda con Computer Vision',
    description: 'Sistema de visión artificial para analizar el flujo de clientes, zonas calientes y tiempo de permanencia en tienda.',
    status: 'in_progress' as const,
    budget: 25000,
    deadline: '2026-02-28',
    priority: 'medium' as const,
  },
  // TESTING - En pruebas
  {
    client_id: clientIds[7], // DataFlow Analytics
    project_name: 'Automated Report Generation',
    description: 'NLP system that automatically generates executive summaries from complex data analytics reports.',
    status: 'testing' as const,
    budget: 18000,
    deadline: '2026-02-15',
    priority: 'medium' as const,
  },
  {
    client_id: clientIds[0], // Tecnologías Mediterráneo
    project_name: 'Dashboard Analítico con IA',
    description: 'Cuadro de mando interactivo con insights automáticos generados por IA y alertas predictivas.',
    status: 'testing' as const,
    budget: 12000,
    deadline: '2026-02-10',
    priority: 'low' as const,
  },
  // COMPLETED - Finalizados
  {
    client_id: clientIds[1], // Grupo Financiero Castellana
    project_name: 'Chatbot Interno para RRHH',
    description: 'Asistente virtual para empleados que responde consultas de nóminas, vacaciones y políticas internas.',
    status: 'completed' as const,
    budget: 20000,
    deadline: '2025-12-15',
    priority: 'medium' as const,
  },
  {
    client_id: clientIds[4], // Logística Express
    project_name: 'Optimización de Rutas v1.0',
    description: 'Primera versión del sistema de optimización de rutas de reparto usando algoritmos genéticos.',
    status: 'completed' as const,
    budget: 28000,
    deadline: '2025-11-30',
    priority: 'high' as const,
  },
  {
    client_id: clientIds[2], // Clínica Sant Jordi
    project_name: 'Sistema de Triaje Automático',
    description: 'IA para clasificar urgencia de pacientes basándose en síntomas descritos en el formulario de admisión.',
    status: 'completed' as const,
    budget: 35000,
    deadline: '2025-10-15',
    priority: 'urgent' as const,
  },
  // CANCELLED - Cancelados
  {
    client_id: clientIds[5], // TechVentures UK
    project_name: 'Blockchain + AI Investment Tracker',
    description: 'Cancelled due to budget reallocation. Project scope was too ambitious for initial phase.',
    status: 'cancelled' as const,
    budget: 60000,
    deadline: '2026-01-15',
    priority: 'low' as const,
  },
]

// ============================================================================
// PRESUPUESTOS (QUOTES)
// ============================================================================
const getQuotes = (projectIds: string[]) => [
  // Draft quotes
  {
    project_id: projectIds[0], // Asistente Virtual
    version: 1,
    status: 'draft' as const,
    language: 'es' as const,
    content_json: {
      introduction: 'Nos complace presentarle nuestra propuesta para el desarrollo de un Asistente Virtual con IA generativa que revolucionará su atención al cliente.',
      services: [
        { name: 'Análisis y Diseño', description: 'Estudio de casos de uso y diseño conversacional', hours: 40, hourly_rate: 85, amount: 3400 },
        { name: 'Desarrollo del Chatbot', description: 'Implementación con GPT-4 y fine-tuning', hours: 80, hourly_rate: 95, amount: 7600 },
        { name: 'Integración WhatsApp', description: 'Conexión con WhatsApp Business API', hours: 24, hourly_rate: 85, amount: 2040 },
        { name: 'Testing y QA', description: 'Pruebas exhaustivas y ajustes', hours: 20, hourly_rate: 75, amount: 1500 },
      ],
      timeline: '8 semanas desde la aprobación',
      payment_terms: '30% inicio, 40% desarrollo, 30% entrega',
      conclusion: 'Estamos convencidos de que esta solución mejorará significativamente la experiencia de sus clientes.',
    },
    subtotal: 14540,
    iva: 3053.40,
    total: 17593.40,
  },
  // Sent quotes
  {
    project_id: projectIds[2], // Detección de Fraude
    version: 1,
    status: 'sent' as const,
    language: 'es' as const,
    sent_at: '2026-01-20T10:00:00Z',
    content_json: {
      introduction: 'Propuesta técnica para implementar un sistema de detección de fraude bancario en tiempo real.',
      services: [
        { name: 'Consultoría Especializada', description: 'Análisis de patrones de fraude históricos', hours: 60, hourly_rate: 120, amount: 7200 },
        { name: 'Desarrollo del Modelo ML', description: 'Algoritmos de anomaly detection y ensemble methods', hours: 120, hourly_rate: 100, amount: 12000 },
        { name: 'Integración Core Bancario', description: 'APIs de conexión con sistemas transaccionales', hours: 80, hourly_rate: 95, amount: 7600 },
        { name: 'Dashboard de Monitorización', description: 'Panel de control para el equipo de fraude', hours: 40, hourly_rate: 85, amount: 3400 },
        { name: 'Formación y Documentación', description: 'Capacitación del equipo interno', hours: 24, hourly_rate: 90, amount: 2160 },
      ],
      timeline: '16 semanas',
      payment_terms: '25% inicio, 25% mes 2, 25% mes 3, 25% entrega',
      conclusion: 'Nuestro sistema reducirá las pérdidas por fraude en un 60% estimado.',
    },
    subtotal: 32360,
    iva: 6795.60,
    total: 39155.60,
  },
  // Viewed quotes
  {
    project_id: projectIds[3], // AI Due Diligence
    version: 1,
    status: 'viewed' as const,
    language: 'en' as const,
    sent_at: '2026-01-15T14:30:00Z',
    viewed_at: '2026-01-16T09:15:00Z',
    content_json: {
      introduction: 'We are pleased to present our proposal for an AI-powered due diligence platform tailored for startup evaluation.',
      services: [
        { name: 'Requirements Analysis', description: 'Deep dive into evaluation criteria and workflows', hours: 32, hourly_rate: 110, amount: 3520 },
        { name: 'NLP Engine Development', description: 'Custom models for business plan analysis', hours: 100, hourly_rate: 105, amount: 10500 },
        { name: 'Market Data Integration', description: 'APIs for market intelligence sources', hours: 48, hourly_rate: 95, amount: 4560 },
        { name: 'Scoring Dashboard', description: 'Interactive evaluation interface', hours: 60, hourly_rate: 90, amount: 5400 },
        { name: 'Training & Support', description: 'Team onboarding and 3-month support', hours: 40, hourly_rate: 85, amount: 3400 },
      ],
      timeline: '12 weeks',
      payment_terms: '30% upfront, 35% mid-project, 35% on delivery',
      conclusion: 'This platform will reduce your due diligence time by 70% while improving accuracy.',
    },
    subtotal: 27380,
    iva: 0, // UK - no IVA
    total: 27380,
  },
  // Accepted quotes
  {
    project_id: projectIds[4], // Diagnòstic per Imatge
    version: 2,
    status: 'accepted' as const,
    language: 'ca' as const,
    sent_at: '2026-01-05T11:00:00Z',
    viewed_at: '2026-01-05T16:30:00Z',
    content_json: {
      introduction: 'Proposta tècnica per al desenvolupament d\'un sistema de suport al diagnòstic radiològic amb intel·ligència artificial.',
      services: [
        { name: 'Recollida i Preparació de Dades', description: 'Anonimització i etiquetatge d\'imatges mèdiques', hours: 80, hourly_rate: 95, amount: 7600 },
        { name: 'Desenvolupament Model CNN', description: 'Xarxes neuronals convolucionals per detecció', hours: 160, hourly_rate: 110, amount: 17600 },
        { name: 'Validació Clínica', description: 'Tests amb equip mèdic i ajustos', hours: 60, hourly_rate: 100, amount: 6000 },
        { name: 'Integració PACS', description: 'Connexió amb el sistema d\'imatges hospitalari', hours: 48, hourly_rate: 95, amount: 4560 },
        { name: 'Certificació i Documentació', description: 'Preparació per marcatge CE', hours: 40, hourly_rate: 120, amount: 4800 },
      ],
      timeline: '20 setmanes',
      payment_terms: '20% inici, 30% mes 2, 30% mes 4, 20% lliurament',
      conclusion: 'El sistema proporcionarà una segona opinió fiable als radiòlegs, millorant la precisió diagnòstica.',
    },
    subtotal: 40560,
    iva: 8517.60,
    total: 49077.60,
  },
  // Rejected quote
  {
    project_id: projectIds[14], // Blockchain + AI (cancelled project)
    version: 1,
    status: 'rejected' as const,
    language: 'en' as const,
    sent_at: '2025-12-01T10:00:00Z',
    viewed_at: '2025-12-02T11:00:00Z',
    content_json: {
      introduction: 'Proposal for an innovative blockchain-based AI investment tracking system.',
      services: [
        { name: 'Blockchain Architecture', description: 'Design of distributed ledger system', hours: 120, hourly_rate: 130, amount: 15600 },
        { name: 'AI Analytics Module', description: 'Predictive models for investment performance', hours: 100, hourly_rate: 110, amount: 11000 },
        { name: 'Smart Contracts', description: 'Automated investment rules and triggers', hours: 80, hourly_rate: 120, amount: 9600 },
        { name: 'User Interface', description: 'Investor dashboard and mobile app', hours: 100, hourly_rate: 90, amount: 9000 },
      ],
      timeline: '24 weeks',
      payment_terms: '25% each quarter',
      conclusion: 'Cutting-edge technology to revolutionize investment tracking.',
    },
    subtotal: 45200,
    iva: 0,
    total: 45200,
  },
]

// ============================================================================
// FACTURAS (INVOICES)
// ============================================================================
const getInvoices = (projectIds: string[]) => [
  // Paid invoices
  {
    project_id: projectIds[11], // Chatbot RRHH - completed
    invoice_number: 'ANC-2025-11-0001',
    issue_date: '2025-11-20',
    due_date: '2025-12-20',
    status: 'paid' as const,
    paid_at: '2025-12-15T14:30:00Z',
    line_items: [
      { description: 'Desarrollo Chatbot RRHH - Fase 1', quantity: 1, unit_price: 8000, amount: 8000 },
      { description: 'Desarrollo Chatbot RRHH - Fase 2', quantity: 1, unit_price: 8000, amount: 8000 },
      { description: 'Integración con sistemas internos', quantity: 1, unit_price: 3000, amount: 3000 },
      { description: 'Formación equipo RRHH', quantity: 1, unit_price: 1000, amount: 1000 },
    ],
    subtotal: 20000,
    iva: 4200,
    total: 24200,
    notes: 'Proyecto completado satisfactoriamente.',
  },
  {
    project_id: projectIds[12], // Optimización Rutas - completed
    invoice_number: 'ANC-2025-11-0002',
    issue_date: '2025-11-25',
    due_date: '2025-12-25',
    status: 'paid' as const,
    paid_at: '2025-12-22T10:00:00Z',
    line_items: [
      { description: 'Algoritmo optimización rutas', quantity: 1, unit_price: 15000, amount: 15000 },
      { description: 'Dashboard de monitorización', quantity: 1, unit_price: 8000, amount: 8000 },
      { description: 'Integración GPS flotas', quantity: 1, unit_price: 5000, amount: 5000 },
    ],
    subtotal: 28000,
    iva: 5880,
    total: 33880,
  },
  {
    project_id: projectIds[13], // Triaje - completed
    invoice_number: 'ANC-2025-10-0001',
    issue_date: '2025-10-10',
    due_date: '2025-11-10',
    status: 'paid' as const,
    paid_at: '2025-11-05T09:45:00Z',
    line_items: [
      { description: 'Sistema de Triaje IA - Desarrollo completo', quantity: 1, unit_price: 28000, amount: 28000 },
      { description: 'Validación clínica y ajustes', quantity: 1, unit_price: 5000, amount: 5000 },
      { description: 'Documentación técnica', quantity: 1, unit_price: 2000, amount: 2000 },
    ],
    subtotal: 35000,
    iva: 7350,
    total: 42350,
  },
  // Sent invoices
  {
    project_id: projectIds[6], // Vendimia IoT - in_progress
    invoice_number: 'ANC-2026-01-0001',
    issue_date: '2026-01-15',
    due_date: '2026-02-15',
    status: 'sent' as const,
    line_items: [
      { description: 'Hito 1: Instalación sensores IoT', quantity: 1, unit_price: 8000, amount: 8000 },
      { description: 'Hito 2: Modelo predictivo v1', quantity: 1, unit_price: 10000, amount: 10000 },
    ],
    subtotal: 18000,
    iva: 3780,
    total: 21780,
    notes: 'Factura parcial - 60% del proyecto completado.',
  },
  {
    project_id: projectIds[7], // Predictive Maintenance - in_progress
    invoice_number: 'ANC-2026-01-0002',
    issue_date: '2026-01-20',
    due_date: '2026-02-20',
    status: 'sent' as const,
    line_items: [
      { description: 'Phase 1: Data Collection & Analysis', quantity: 1, unit_price: 12000, amount: 12000 },
      { description: 'Phase 2: ML Model Development', quantity: 1, unit_price: 15000, amount: 15000 },
    ],
    subtotal: 27000,
    iva: 0, // Germany - reverse charge
    total: 27000,
    notes: 'VAT reverse charge applies - intra-EU B2B service.',
  },
  // Overdue invoice
  {
    project_id: projectIds[8], // Computer Vision Retail - in_progress
    invoice_number: 'ANC-2025-12-0001',
    issue_date: '2025-12-01',
    due_date: '2025-12-31',
    status: 'overdue' as const,
    line_items: [
      { description: 'Hito 1: POC Computer Vision', quantity: 1, unit_price: 10000, amount: 10000 },
    ],
    subtotal: 10000,
    iva: 2100,
    total: 12100,
    notes: 'URGENTE: Factura vencida. Contactar con cliente.',
  },
  // Draft invoices
  {
    project_id: projectIds[9], // Automated Reports - testing
    invoice_number: 'ANC-2026-01-0003',
    issue_date: '2026-01-28',
    due_date: '2026-02-28',
    status: 'draft' as const,
    line_items: [
      { description: 'NLP Report Generation System - Final Delivery', quantity: 1, unit_price: 18000, amount: 18000 },
    ],
    subtotal: 18000,
    iva: 0, // USA
    total: 18000,
    notes: 'Pendiente de aprobación del cliente para enviar.',
  },
]

// ============================================================================
// ALERTAS
// ============================================================================
const getAlerts = (projectIds: string[], clientIds: string[]) => [
  // Deadline approaching
  {
    project_id: projectIds[8], // Computer Vision - deadline Feb 28
    type: 'deadline_approaching' as const,
    priority: 'high' as const,
    message: 'El proyecto "Análisis de Tráfico en Tienda" vence en 28 días. Estado actual: En progreso.',
    is_read: false,
  },
  {
    project_id: projectIds[6], // Vendimia - deadline March 15
    type: 'deadline_approaching' as const,
    priority: 'medium' as const,
    message: 'El proyecto "Optimización de Vendimia" vence en 43 días. Revisar avance.',
    is_read: false,
  },
  // Invoice overdue
  {
    project_id: projectIds[8],
    type: 'invoice_overdue' as const,
    priority: 'critical' as const,
    message: 'URGENTE: Factura ANC-2025-12-0001 de Retail Innovación Madrid vencida hace 31 días (12.100€).',
    is_read: false,
  },
  // Budget exceeded
  {
    project_id: projectIds[7], // Predictive Maintenance
    type: 'budget_exceeded' as const,
    priority: 'high' as const,
    message: 'El proyecto "Predictive Maintenance" ha consumido el 85% del presupuesto con solo 60% completado.',
    is_read: true,
    resolved_at: '2026-01-25T10:00:00Z',
  },
  // Project stale
  {
    project_id: projectIds[0], // Asistente Virtual - backlog
    type: 'project_stale' as const,
    priority: 'low' as const,
    message: 'El proyecto "Asistente Virtual" lleva 45 días en backlog sin actividad.',
    is_read: false,
  },
  {
    project_id: projectIds[1], // Sistema Predictivo - backlog
    type: 'project_stale' as const,
    priority: 'low' as const,
    message: 'El proyecto "Sistema Predictivo de Demanda" no ha avanzado en 30 días.',
    is_read: true,
  },
  // Client inactive
  {
    client_id: clientIds[8], // Maison Lumière
    type: 'client_inactive' as const,
    priority: 'medium' as const,
    message: 'El cliente "Maison Lumière SARL" no ha tenido actividad en los últimos 60 días.',
    is_read: false,
  },
  // More deadline alerts
  {
    project_id: projectIds[9], // Automated Reports - testing
    type: 'deadline_approaching' as const,
    priority: 'high' as const,
    message: 'El proyecto "Automated Report Generation" en fase de testing vence en 15 días.',
    is_read: false,
  },
  {
    project_id: projectIds[4], // Diagnòstic - approved
    type: 'deadline_approaching' as const,
    priority: 'critical' as const,
    message: 'ATENCIÓN: Proyecto "Diagnòstic per Imatge" aprobado pero sin iniciar. Deadline en 74 días.',
    is_read: false,
  },
]

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function seed() {
  console.log('🌱 Iniciando seed de datos...\n')

  try {
    // 1. Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Limpiando datos existentes...')
    await supabase.from('alerts').delete().neq('alert_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('invoices').delete().neq('invoice_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('quotes').delete().neq('quote_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('projects').delete().neq('project_id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('clients').delete().neq('client_id', '00000000-0000-0000-0000-000000000000')
    console.log('✅ Datos limpiados\n')

    // 2. Insert clients
    console.log('👥 Insertando clientes...')
    const { data: insertedClients, error: clientsError } = await supabase
      .from('clients')
      .insert(clients)
      .select()

    if (clientsError) throw new Error(`Error insertando clientes: ${clientsError.message}`)
    console.log(`✅ ${insertedClients.length} clientes creados\n`)

    const clientIds = insertedClients.map(c => c.client_id)

    // 3. Insert projects
    console.log('📋 Insertando proyectos...')
    const projectsData = getProjects(clientIds)
    const { data: insertedProjects, error: projectsError } = await supabase
      .from('projects')
      .insert(projectsData)
      .select()

    if (projectsError) throw new Error(`Error insertando proyectos: ${projectsError.message}`)
    console.log(`✅ ${insertedProjects.length} proyectos creados\n`)

    const projectIds = insertedProjects.map(p => p.project_id)

    // 4. Insert quotes
    console.log('📝 Insertando presupuestos...')
    const quotesData = getQuotes(projectIds)
    const { data: insertedQuotes, error: quotesError } = await supabase
      .from('quotes')
      .insert(quotesData)
      .select()

    if (quotesError) throw new Error(`Error insertando presupuestos: ${quotesError.message}`)
    console.log(`✅ ${insertedQuotes.length} presupuestos creados\n`)

    // 5. Insert invoices
    console.log('🧾 Insertando facturas...')
    const invoicesData = getInvoices(projectIds)
    const { data: insertedInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .insert(invoicesData)
      .select()

    if (invoicesError) throw new Error(`Error insertando facturas: ${invoicesError.message}`)
    console.log(`✅ ${insertedInvoices.length} facturas creadas\n`)

    // 6. Insert alerts
    console.log('🔔 Insertando alertas...')
    const alertsData = getAlerts(projectIds, clientIds)
    const { data: insertedAlerts, error: alertsError } = await supabase
      .from('alerts')
      .insert(alertsData)
      .select()

    if (alertsError) throw new Error(`Error insertando alertas: ${alertsError.message}`)
    console.log(`✅ ${insertedAlerts.length} alertas creadas\n`)

    // Summary
    console.log('=' .repeat(50))
    console.log('🎉 SEED COMPLETADO EXITOSAMENTE')
    console.log('=' .repeat(50))
    console.log(`
📊 Resumen de datos creados:
   • Clientes: ${insertedClients.length}
   • Proyectos: ${insertedProjects.length}
   • Presupuestos: ${insertedQuotes.length}
   • Facturas: ${insertedInvoices.length}
   • Alertas: ${insertedAlerts.length}

📈 Distribución de proyectos por estado:
   • Backlog: 2
   • Proposal: 2
   • Approved: 2
   • In Progress: 3
   • Testing: 2
   • Completed: 3
   • Cancelled: 1
    `)

  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    process.exit(1)
  }
}

seed()
