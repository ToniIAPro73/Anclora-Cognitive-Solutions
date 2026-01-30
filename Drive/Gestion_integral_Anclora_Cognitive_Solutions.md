## Stack Tecnológico Open Source \& Zero-Cost

### **Frontend**

```
- React 18 + TypeScript
- Tailwind CSS (diseño)
- shadcn/ui (componentes UI open source)
- React Router v6 (navegación)
- Zustand / Jotai (state management ligero)
```


### **Backend**

```
- Supabase (BaaS open source - FREE TIER)[source:47][source:50]
  ├─ PostgreSQL (base de datos)
  ├─ Auth (autenticación)
  ├─ Storage (archivos)
  ├─ Edge Functions (serverless)
  └─ Realtime (websockets)
```


### **IA Local (Zero-Cost)**

```
- Ollama (LLMs locales)[source:48][source:51]
  ├─ Llama 3.2 3B (generación presupuestos)
  ├─ Qwen 2.5 3B (extracción datos facturas)[source:57]
  └─ Gemma 2 2B (multiidioma)
  
- Instructor (structured output)[source:51]
- LangChain (orquestación)
```


### **Facturación Open Source**

```
- InvoicePlane (PHP, completamente gratis)[source:37][source:40]
- Invoicerr (Node.js, Docker, EU compliance)[source:31]
- SolidInvoice (Laravel, open source elegante)[source:34]
```


### **Kanban Open Source**

```
- Kanboard (PHP, plugins robustos)[source:32][source:35]
- WeKan (Node.js, Trello-like)[source:38]
- Kanba (React + Supabase, MIT license)[source:41]
```


### **CRM Quotation**

```
- Twenty CRM (open source, moderno)[source:58]
- Krayin CRM (Laravel, Kanban integrado)[source:55]
- Axelor CRM (Java, quote management)[source:52]
```


***

## Arquitectura Recomendada para Budget Reducido

### **Opción 1: Todo-en-Uno con Supabase (RECOMENDADA)**

```
┌────────────────────────────────────────────────────────────┐
│                    ANCLORA COGNITIVE                        │
│                  (Single Page Application)                  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  FRONTEND (React + TypeScript + shadcn/ui)                 │
│  ├─ Generador presupuestos con IA                          │
│  ├─ Kanban board (custom con drag-drop)                    │
│  ├─ Portal cliente (vistas restringidas)                   │
│  └─ Generador facturas (templates)                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BACKEND (Supabase FREE TIER - 2 proyectos)[source:47]    │
│  ├─ PostgreSQL: 500MB storage                              │
│  ├─ Auth: 50K MAU (monthly active users)                   │
│  ├─ Storage: 1GB archivos (PDFs, docs)                     │
│  ├─ Egress: 2GB/mes bandwidth                              │
│  ├─ Edge Functions: 500K invocaciones/mes                  │
│  └─ Realtime: WebSockets ilimitados                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  IA LOCAL (Tu servidor/laptop - CPU)[source:48][source:54] │
│  ├─ Ollama (Docker container)                              │
│  ├─ Llama 3.2 3B (2GB RAM)                                 │
│  ├─ API endpoint expuesto via ngrok/Cloudflare Tunnel      │
│  └─ LangChain para prompts estructurados                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

HOSTING: Vercel (FREE) + Render.com (FREE 750h/mes)[source:59]
```

**Costos mensuales: €0 hasta ~100 usuarios**[^1]

***

### **Esquema Base de Datos (Supabase PostgreSQL)**

```sql
-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  language TEXT DEFAULT 'es', -- es/en/ca
  created_at TIMESTAMP DEFAULT NOW()
);

-- Proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  name TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'backlog', -- backlog/propuesta/en_progreso/testing/completado
  stage_order INT DEFAULT 0, -- Para Kanban
  priority TEXT DEFAULT 'medium', -- low/medium/high/urgent
  alert_config JSONB, -- Configuración alertas personalizadas
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Presupuestos (Quotes)
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  version INT DEFAULT 1,
  language TEXT DEFAULT 'es',
  tone TEXT DEFAULT 'profesional', -- técnico/sencillo/formal/profesional/consultivo/casual
  services JSONB NOT NULL, -- [{name, description, hours, rate, amount}]
  subtotal DECIMAL(10,2),
  tax_rate DECIMAL(5,2) DEFAULT 21.00, -- IVA España
  tax_amount DECIMAL(10,2),
  total DECIMAL(10,2),
  status TEXT DEFAULT 'draft', -- draft/sent/viewed/accepted/rejected
  pdf_url TEXT, -- Supabase Storage URL
  created_at TIMESTAMP DEFAULT NOW()
);

-- Facturas
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID REFERENCES quotes(id),
  invoice_number TEXT UNIQUE NOT NULL,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_status TEXT DEFAULT 'pending', -- pending/partial/paid/overdue
  payment_date DATE,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tareas Kanban
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  due_date DATE,
  labels JSONB, -- Tags personalizables
  position INT, -- Orden dentro de columna
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alertas
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  type TEXT NOT NULL, -- budget_variance/milestone_delay/approval_pending/blocker
  severity TEXT DEFAULT 'info', -- info/warning/critical
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comentarios (Portal cliente)
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Para notas internas
  created_at TIMESTAMP DEFAULT NOW()
);
```


***

## Componentes Clave de la Aplicación

### **1. Generador de Presupuestos con IA Local**

**Implementación con Ollama + Instructor**:[^2][^3]

```python
# backend/ai_service.py (Corre en tu máquina local)
from ollama import Client
from instructor import from_openai
from pydantic import BaseModel
from typing import List

class ServiceItem(BaseModel):
    name: str
    description: str
    hours: int
    hourly_rate: float
    amount: float

class QuoteGenerated(BaseModel):
    introduction: str
    services: List[ServiceItem]
    timeline: str
    payment_terms: str
    conclusion: str

client = Client(host='http://localhost:11434')
instructor_client = from_openai(client)

def generate_quote(client_name: str, project_desc: str, services: list, 
                   tone: str = 'profesional', language: str = 'es'):
    
    tone_mapping = {
        'técnico': 'Usa terminología especializada, incluye arquitecturas y KPIs.',
        'sencillo': 'Lenguaje accesible, evita jerga técnica, usa metáforas.',
        'formal': 'Estructura corporativa, referencias a estándares.',
        'profesional': 'Balance técnico-comercial, enfoque en valor.',
        'consultivo': 'Énfasis en ROI, business case, métricas de éxito.',
        'casual': 'Cercano, startups, relaciones establecidas.'
    }
    
    prompt = f"""
Genera un presupuesto profesional para consultoría de IA con:

Cliente: {client_name}
Proyecto: {project_desc}
Servicios solicitados: {', '.join(services)}
Tono deseado: {tone} - {tone_mapping.get(tone, '')}
Idioma: {language}

Estructura requerida:
1. Introducción personalizada (2-3 párrafos)
2. Desglose de servicios con horas estimadas y tarifas
3. Timeline de implementación
4. Términos de pago
5. Conclusión con call-to-action

Marca: Anclora Cognitive Solutions (división de Anclora Nexus Group)
Especialidad: IA Generativa, RAG, Fine-tuning, Agentes Autónomos
"""
    
    response = instructor_client.chat.completions.create(
        model="llama3.2:3b",  # Modelo ligero, corre en CPU
        messages=[{"role": "user", "content": prompt}],
        response_model=QuoteGenerated
    )
    
    return response
```

**Exponer API con FastAPI**:

```python
# api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class QuoteRequest(BaseModel):
    client_name: str
    project_description: str
    services: list
    tone: str = 'profesional'
    language: str = 'es'

@app.post("/api/generate-quote")
async def create_quote(request: QuoteRequest):
    try:
        result = generate_quote(
            client_name=request.client_name,
            project_desc=request.project_description,
            services=request.services,
            tone=request.tone,
            language=request.language
        )
        return result.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Hacer accesible desde internet (gratis)**:

```bash
# Opción 1: Cloudflare Tunnel (gratis permanente)
cloudflared tunnel --url http://localhost:8000

# Opción 2: ngrok (gratis 40h/mes)
ngrok http 8000
```


***

### **2. Kanban Board Custom (React + Supabase Realtime)**

**Componente principal**:[^4][^5]

```tsx
// components/KanbanBoard.tsx
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'propuesta', title: 'Propuesta' },
  { id: 'aprobado', title: 'Aprobado' },
  { id: 'en_progreso', title: 'En Progreso' },
  { id: 'testing', title: 'Testing' },
  { id: 'completado', title: 'Completado' }
];

export function KanbanBoard() {
  const [projects, setProjects] = useState<any[]>([]);
  
  useEffect(() => {
    // Suscripción realtime a cambios
    const subscription = supabase
      .channel('projects-channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'projects' },
          (payload) => {
            fetchProjects();
          }
      )
      .subscribe();
    
    fetchProjects();
    
    return () => { subscription.unsubscribe(); };
  }, []);
  
  const fetchProjects = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, clients(company_name), alerts(count)')
      .order('stage_order');
    
    setProjects(data || []);
  };
  
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    
    await supabase
      .from('projects')
      .update({ 
        status: destination.droppableId,
        stage_order: destination.index,
        updated_at: new Date().toISOString()
      })
      .eq('id', draggableId);
    
    // Trigger alert si llega a "testing" con budget variance
    checkAlerts(draggableId);
  };
  
  const checkAlerts = async (projectId: string) => {
    // Lógica de alertas inteligentes
    const { data: project } = await supabase
      .from('projects')
      .select('budget, spent, status')
      .eq('id', projectId)
      .single();
    
    if (project.spent > project.budget * 0.85) {
      await supabase.from('alerts').insert({
        project_id: projectId,
        type: 'budget_variance',
        severity: 'warning',
        message: `Presupuesto al 85%: ${project.spent}€ de ${project.budget}€`
      });
    }
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className="bg-gray-50 rounded-lg p-4 min-w-[300px]"
              >
                <h3 className="font-semibold mb-4">{column.title}</h3>
                
                {projects
                  .filter(p => p.status === column.id)
                  .map((project, index) => (
                    <Draggable 
                      key={project.id} 
                      draggableId={project.id} 
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-3"
                        >
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">{project.name}</h4>
                              {project.alerts?.count > 0 && (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 mb-2">
                              {project.clients.company_name}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant={project.priority === 'urgent' ? 'destructive' : 'secondary'}>
                                {project.priority}
                              </Badge>
                              {project.due_date && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(project.due_date).toLocaleDateString('es-ES')}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
```


***

### **3. Portal Cliente con Visibilidad Real-Time**

```tsx
// pages/ClientPortal.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { MessageSquare, FileText, Clock } from 'lucide-react';

export function ClientPortal() {
  const [project, setProject] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  
  useEffect(() => {
    const clientEmail = localStorage.getItem('client_email');
    
    // Suscripción realtime
    const subscription = supabase
      .channel(`project-${project?.id}`)
      .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${project?.id}` },
          (payload) => {
            setProject(payload.new);
          }
      )
      .subscribe();
    
    fetchProjectData(clientEmail);
    
    return () => { subscription.unsubscribe(); };
  }, []);
  
  const fetchProjectData = async (email: string) => {
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();
    
    const { data: projectData } = await supabase
      .from('projects')
      .select(`
        *,
        quotes(count, total),
        invoices(count, payment_status),
        tasks(count)
      `)
      .eq('client_id', client.id)
      .single();
    
    setProject(projectData);
    
    // Timeline de actividad
    const { data: activity } = await supabase
      .from('comments')
      .select('*')
      .eq('project_id', projectData.id)
      .eq('is_internal', false)
      .order('created_at', { ascending: false })
      .limit(10);
    
    setTimeline(activity || []);
  };
  
  const calculateProgress = () => {
    const stages = ['backlog', 'propuesta', 'aprobado', 'en_progreso', 'testing', 'completado'];
    const currentIndex = stages.indexOf(project?.status || 'backlog');
    return ((currentIndex + 1) / stages.length) * 100;
  };
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Semáforo de estado */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{project?.name}</h2>
          <div className={`h-4 w-4 rounded-full ${
            project?.status === 'completado' ? 'bg-green-500' :
            project?.status === 'en_progreso' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`} />
        </div>
        
        <Progress value={calculateProgress()} className="mb-2" />
        <p className="text-sm text-gray-600">
          Estado actual: <span className="font-semibold">{project?.status}</span>
        </p>
      </Card>
      
      {/* Próximo hito */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Próximo Hito</h3>
        </div>
        <p className="text-gray-700">Entrega MVP - Dashboard Principal</p>
        <p className="text-sm text-gray-500 mt-1">Fecha estimada: 15 Feb 2026</p>
      </Card>
      
      {/* Presupuesto */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Presupuesto del Proyecto</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Aprobado</p>
            <p className="text-2xl font-bold">{project?.budget}€</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gastado</p>
            <p className="text-2xl font-bold text-blue-600">{project?.spent || 0}€</p>
          </div>
        </div>
        <Progress value={(project?.spent / project?.budget) * 100} className="mt-4" />
      </Card>
      
      {/* Timeline de actividad */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Actividad Reciente</h3>
        </div>
        <div className="space-y-3">
          {timeline.map(item => (
            <div key={item.id} className="border-l-2 border-blue-500 pl-4 py-2">
              <p className="text-sm text-gray-700">{item.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Documentos */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Documentos</h3>
        </div>
        <div className="space-y-2">
          <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-sm">Presupuesto_v2.pdf</span>
            <span className="text-xs text-gray-500">12 Ene 2026</span>
          </a>
          <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-sm">Contrato_Firmado.pdf</span>
            <span className="text-xs text-gray-500">5 Ene 2026</span>
          </a>
        </div>
      </Card>
    </div>
  );
}
```


***

### **4. Sistema de Alertas Automatizado**

```typescript
// lib/alerts.ts
import { supabase } from './supabase';

export async function checkProjectAlerts() {
  // Ejecutar cada hora via Supabase Edge Function (cron)
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .neq('status', 'completado');
  
  for (const project of projects || []) {
    // Alert 1: Budget variance
    if (project.spent && project.spent > project.budget * 0.85) {
      await createAlert(project.id, 'budget_variance', 'warning',
        `Proyecto al 85% del presupuesto: ${project.spent}€ / ${project.budget}€`
      );
    }
    
    // Alert 2: Milestone delay
    if (project.due_date && new Date(project.due_date) < new Date()) {
      await createAlert(project.id, 'milestone_delay', 'critical',
        `Proyecto retrasado. Fecha límite: ${new Date(project.due_date).toLocaleDateString('es-ES')}`
      );
    }
    
    // Alert 3: Approval pending > 5 días
    const { data: quote } = await supabase
      .from('quotes')
      .select('created_at')
      .eq('project_id', project.id)
      .eq('status', 'sent')
      .single();
    
    if (quote) {
      const daysPending = Math.floor((Date.now() - new Date(quote.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysPending > 5) {
        await createAlert(project.id, 'approval_pending', 'info',
          `Presupuesto pendiente de aprobación hace ${daysPending} días`
        );
      }
    }
  }
}

async function createAlert(projectId: string, type: string, severity: string, message: string) {
  // Evitar duplicados
  const { data: existing } = await supabase
    .from('alerts')
    .select('id')
    .eq('project_id', projectId)
    .eq('type', type)
    .eq('is_read', false)
    .single();
  
  if (!existing) {
    await supabase.from('alerts').insert({
      project_id: projectId,
      type,
      severity,
      message
    });
    
    // Enviar email notificación (via Resend API - 100 emails/día gratis)
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'alerts@anclora.com',
        to: 'pm@anclora.com',
        subject: `[${severity.toUpperCase()}] Alerta en proyecto`,
        text: message
      })
    });
  }
}
```


***

### **5. Generación de Facturas Profesionales**

**Opción A: Integrar InvoicePlane via API**[^6][^7]

```bash
# Instalación Docker
docker run -d \
  --name invoiceplane \
  -p 8080:80 \
  -v invoiceplane_data:/var/www/html \
  invoiceninja/invoiceninja:alpine
```

**Opción B: Custom con react-pdf**

```tsx
// lib/invoiceGenerator.tsx
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { supabase } from './supabase';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#1a202c' },
  tagline: { fontSize: 10, color: '#718096', marginTop: 4 },
  invoiceNumber: { fontSize: 12, color: '#2d3748' },
  section: { marginTop: 20 },
  table: { marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8 },
  tableHeader: { backgroundColor: '#f7fafc' },
  col1: { width: '50%' },
  col2: { width: '20%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  total: { marginTop: 20, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#2d3748' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#718096' }
});

const InvoicePDF = ({ invoice, client, services }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Anclora Cognitive Solutions</Text>
          <Text style={styles.tagline}>A division of Anclora Nexus Group</Text>
          <Text style={{ fontSize: 10, marginTop: 10 }}>
            NIF: B12345678{'\n'}
            Calle Ejemplo, 123{'\n'}
            28001 Madrid, España
          </Text>
        </View>
        <View>
          <Text style={styles.invoiceNumber}>FACTURA #{invoice.invoice_number}</Text>
          <Text style={{ fontSize: 10, marginTop: 4 }}>
            Fecha: {new Date(invoice.issue_date).toLocaleDateString('es-ES')}{'\n'}
            Vencimiento: {new Date(invoice.due_date).toLocaleDateString('es-ES')}
          </Text>
        </View>
      </View>
      
      {/* Cliente */}
      <View style={styles.section}>
        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>FACTURAR A:</Text>
        <Text style={{ fontSize: 10 }}>
          {client.company_name}{'\n'}
          {client.contact_person}{'\n'}
          {client.email}
        </Text>
      </View>
      
      {/* Tabla de servicios */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.col1, { fontWeight: 'bold' }]}>Concepto</Text>
          <Text style={[styles.col2, { fontWeight: 'bold' }]}>Cantidad</Text>
          <Text style={[styles.col3, { fontWeight: 'bold' }]}>Precio</Text>
          <Text style={[styles.col4, { fontWeight: 'bold' }]}>Total</Text>
        </View>
        
        {services.map((service: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.col1}>
              <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{service.name}</Text>
              <Text style={{ fontSize: 8, color: '#718096', marginTop: 2 }}>{service.description}</Text>
            </View>
            <Text style={[styles.col2, { fontSize: 10 }]}>{service.hours}h</Text>
            <Text style={[styles.col3, { fontSize: 10 }]}>{service.hourly_rate}€</Text>
            <Text style={[styles.col4, { fontSize: 10 }]}>{service.amount}€</Text>
          </View>
        ))}
      </View>
      
      {/* Totales */}
      <View style={[styles.section, { alignItems: 'flex-end' }]}>
        <View style={{ width: 200 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 10 }}>Subtotal:</Text>
            <Text style={{ fontSize: 10 }}>{invoice.subtotal}€</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 10 }}>IVA (21%):</Text>
            <Text style={{ fontSize: 10 }}>{invoice.tax_amount}€</Text>
          </View>
          <View style={[styles.total, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>TOTAL:</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{invoice.total}€</Text>
          </View>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Banco: Banco Santander | IBAN: ES12 1234 5678 9012 3456 7890 | BIC: BSCHESMM{'\n'}
          Forma de pago: Transferencia bancaria | Plazo: {invoice.payment_terms || '30 días'}
        </Text>
      </View>
    </Page>
  </Document>
);

export async function generateInvoicePDF(invoiceId: string) {
  // Fetch data
  const { data: invoice } = await supabase
    .from('invoices')
    .select(`
      *,
      quotes(services, subtotal, tax_rate, tax_amount, total),
      projects(client_id, clients(company_name, contact_person, email))
    `)
    .eq('id', invoiceId)
    .single();
  
  // Generate PDF
  const blob = await pdf(<InvoicePDF invoice={invoice} client={invoice.projects.clients} services={invoice.quotes.services} />).toBlob();
  
  // Upload to Supabase Storage
  const fileName = `invoice_${invoice.invoice_number}.pdf`;
  const { data: uploadData, error } = await supabase
    .storage
    .from('invoices')
    .upload(fileName, blob, { contentType: 'application/pdf', upsert: true });
  
  if (!error) {
    const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName);
    
    await supabase
      .from('invoices')
      .update({ pdf_url: publicUrl })
      .eq('id', invoiceId);
    
    return publicUrl;
  }
}
```


***

## Límites del Free Tier y Escalabilidad

### **Supabase Free Tier (Suficiente para MVP)**[^8][^9][^1]

| Recurso | Límite | Capacidad Real |
| :-- | :-- | :-- |
| **Proyectos** | 2 | 1 para producción + 1 para staging |
| **DB Storage** | 500 MB | ~50K-100K usuarios con perfiles básicos |
| **DB Egress** | 2 GB/mes | ~2K-5K requests API/mes |
| **MAU Auth** | 50K | Hasta 50 mil usuarios activos/mes |
| **File Storage** | 1 GB | ~500-1000 PDFs de facturas/presupuestos |
| **Edge Functions** | 500K invocaciones | Suficiente para alertas + webhooks |
| **Realtime** | Ilimitado | Perfecto para Kanban + portal cliente |

**Regla de inactividad**: Proyectos pausan tras 7 días sin actividad → Solución: cronjob ping cada 6 días[^1]

**Cuándo upgradar a Pro (\$25/mes)**:

- >100 clientes activos
- >5K requests diarios
- >500 MB datos (añade 8 GB más)[^1]

***

## Costos Reales de Operación

### **Año 1 (0-50 clientes)**

| Servicio | Plan | Costo Mensual |
| :-- | :-- | :-- |
| **Supabase** | Free | €0 |
| **Vercel** (frontend) | Hobby | €0 |
| **Render.com** (API IA) | Free 750h | €0 |
| **Cloudflare Tunnel** (túnel) | Free | €0 |
| **Resend** (emails) | Free 100/día | €0 |
| **Dominio** (.com) | - | €12/año |
| **Total** | - | **~€1/mes** |

### **Año 2 (50-200 clientes)**

| Servicio | Plan | Costo Mensual |
| :-- | :-- | :-- |
| **Supabase** | Pro | \$25 (~€23) |
| **Vercel** | Pro | \$20 (~€18) |
| **Render.com** | Starter | \$7 (~€6) |
| **Resend** | Pro 50K/mes | \$20 (~€18) |
| **Total** | - | **~€65/mes** |


***

## Roadmap de Implementación (Budget Reducido)

### **Semana 1-2: Setup Base**

- ✅ Crear cuenta Supabase (2 proyectos free)
- ✅ Setup schema PostgreSQL
- ✅ Configurar Supabase Auth
- ✅ Deploy Vite React en Vercel


### **Semana 3-4: Módulo Presupuestos**

- ✅ UI formulario captura datos cliente/proyecto
- ✅ Instalación Ollama local + Llama 3.2 3B
- ✅ API FastAPI para generación con IA
- ✅ Cloudflare Tunnel para exponer API
- ✅ Vista previa presupuestos (HTML)


### **Semana 5-6: Kanban + Alertas**

- ✅ Kanban board con drag-drop
- ✅ Supabase Realtime subscriptions
- ✅ Sistema alertas (Edge Function cron)
- ✅ Notificaciones email (Resend)


### **Semana 7-8: Portal Cliente**

- ✅ Dashboard cliente con RLS (Row Level Security)
- ✅ Timeline actividad en tiempo real
- ✅ Sistema comentarios asíncronos
- ✅ Subida documentos a Supabase Storage


### **Semana 9-10: Facturación**

- ✅ Generador PDF con react-pdf
- ✅ Templates profesionales multiidioma
- ✅ Fórmulas visibles + transparencia
- ✅ Integración Stripe (futuro: pagos online)


### **Semana 11-12: Polish + Launch**

- ✅ Testing E2E
- ✅ Docs usuario
- ✅ Optimización rendimiento
- ✅ Deploy producción

***

## Alternativas Open Source a Considerar

### **Si quieres solución TODO-EN-UNO**:[^10][^11][^6]

1. **Invoice Ninja** (PHP/Laravel) - CRM + Quotes + Invoices + Client Portal
2. **Twenty CRM** (TypeScript/React) - CRM moderno open source[^11]
3. **Crater** (Laravel) - Invoice + Expenses + Estimates

**Ventaja**: Todo integrado, menos código custom
**Desventaja**: Menos flexible, debes adaptar flujos de IA

### **Stack Alternativo (Self-Hosted Total)**

```
Frontend: React + Vite
Backend: Supabase Self-Hosted (Docker)
IA: Ollama + Llama 3.2
Kanban: Kanboard (Docker)
Invoicing: InvoicePlane (Docker)
Hosting: Hetzner VPS (~€5/mes)
```

**Trade-off**: Más control, pero requiere DevOps expertise

***

¿Te parece bien esta arquitectura open source? ¿Prefieres que profundice en algún módulo específico o que te genere el código inicial para el setup con Supabase?
<span style="display:none">[^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^30]</span>

<div align="center">⁂</div>

[^1]: https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance

[^2]: https://www.youtube.com/watch?v=-q_NUOIzDXc

[^3]: https://www.youtube.com/watch?v=bm6-2u3E59M

[^4]: https://www.reddit.com/r/selfhosted/comments/on735p/i_recently_discovered_kanboard_a_free_open_source/

[^5]: https://www.reddit.com/r/selfhosted/comments/1lpasaq/i_bulit_kanba_open_source_alternative_to_trello/

[^6]: https://www.invoiceplane.com

[^7]: https://invoiceplane.com

[^8]: https://supabase.com/docs/guides/troubleshooting/keeping-free-projects-after-pro-upgrade-Kf9Xm2

[^9]: https://www.reddit.com/r/Supabase/comments/1hjcc5e/will_free_tier_be_enough_for_my_project/

[^10]: https://solidinvoice.co

[^11]: https://twenty.com

[^12]: https://www.reddit.com/r/selfhosted/comments/1lpqbfj/invoicerr_v101_open_source_invoices_and_quotes/

[^13]: https://suitedash.com

[^14]: https://www.reddit.com/r/selfhosted/comments/m0ev9i/is_there_any_self_hosted_open_source_kanban/

[^15]: https://www.appsmith.com/use-case/portals

[^16]: https://wekan.fi

[^17]: https://client-portal.co

[^18]: https://client-portal.io

[^19]: https://zapier.com/blog/best-free-invoice-software/

[^20]: https://kan.bn

[^21]: https://www.reddit.com/r/nocode/comments/1o5ojee/best_way_to_make_a_simple_client_portal_without/

[^22]: https://www.phpcrm.com/quote-management-system/

[^23]: https://www.goodfirms.co/quoting-software/blog/best-free-open-source-quoting-software

[^24]: https://axelor.com/crm/

[^25]: https://www.youtube.com/watch?v=mONpftuo02M

[^26]: https://webkul.com/blog/best-open-source-crm-software/

[^27]: https://supabase.com/docs/guides/platform/billing-on-supabase

[^28]: https://www.reddit.com/r/LocalLLaMA/comments/1jcm5p2/ocr_llm_for_invoice_extraction/

[^29]: https://codehooks.io/docs/alternatives/supabase-pricing-comparison

[^30]: https://github.com/katanaml/llm-ollama-invoice-cpu

