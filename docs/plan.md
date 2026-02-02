[**plan.md**](http://plan.md) **\- Plan de Implementación**

**Anclora Cognitive Solutions Platform**

**Versión:** 1.0.0  
**Tipo de documento:** Implementation Roadmap  
**Audiencia:** Development Team, Project Manager  
**Estado:** Activo  
**Fecha:** 30 de enero de 2026

---

**1\. RESUMEN EJECUTIVO**

**1.1 Objetivo del Plan**

Documento que establece la estrategia de implementación en fases para la plataforma Anclora, priorizando funcionalidad core MVP y escalabilidad progresiva.

**1.2 Metodología**

1. **Framework:** Agile/Scrum con sprints de 2 semanas

2. **Stack técnico:** Next.js 14, Supabase, FastAPI, Ollama

3. **Deployment:** Vercel (frontend), Render/Railway (backend IA)

4. **Control de versiones:** Git con GitFlow

5. **Testing:** Jest \+ Playwright \+ Vitest

**1.3 Duración Estimada**

| Fase | Duración | Hitos clave |
| :---- | :---: | :---: |
| Fase 1 \- Fundación | 3 semanas | Auth \+ DB \+ UI base |
| Fase 2 \- Core MVP | 4 semanas | Clientes \+ Proyectos \+ Kanban |
| Fase 3 \- IA | 3 semanas | Generación presupuestos con Llama |
| Fase 4 \- Facturación | 2 semanas | PDFs \+ Email automation |
| Fase 5 \- Portal Cliente | 2 semanas | Dashboard read-only |
| Fase 6 \- Alertas | 1 semana | Sistema notificaciones |
| Fase 7 \- Testing QA | 2 semanas | Tests E2E \+ Performance |
| **TOTAL** | **17 semanas** | **\~4 meses** |

Table 1: Cronograma de implementación por fases

---

**2\. FASE 1: FUNDACIÓN (3 SEMANAS)**

**2.1 Objetivos**

1. Configurar infraestructura base del proyecto

2. Implementar autenticación robusta

3. Establecer modelo de datos en Supabase

4. Crear sistema de diseño y componentes UI reutilizables

**2.2 Tareas Detalladas**

**Sprint 1.1 \- Setup Inicial (Semana 1\)**

**Backend:**

1. Crear proyecto Supabase (región EU West \- Frankfurt)

2. Configurar tablas según [spec.md](http://spec.md) sección 3.2

3. Implementar RLS policies para todas las tablas

4. Configurar Storage buckets: quotes-pdfs, invoices-pdfs

5. Setup Edge Functions base (estructura de carpetas)

**Frontend:**

1. Inicializar proyecto Next.js 14 con App Router

2. Configurar TypeScript strict mode

3. Instalar dependencias core:

   1. @supabase/ssr (autenticación)

   2. @tanstack/react-query (state management)

   3. tailwindcss (estilos)

   4. shadcn/ui (componentes base)

4. Configurar ESLint \+ Prettier

5. Setup Vercel deployment (CI/CD automático)

**Entregables:**

1. Repositorio Git inicializado

2. Supabase project operational

3. Next.js app deployada en Vercel (landing page "Coming Soon")

**Sprint 1.2 \- Autenticación (Semana 2\)**

**Admin Auth:**

1. Implementar formulario login (/login)

2. Integrar Supabase Auth con email/password

3. Middleware de protección de rutas

4. Session management con cookies httpOnly

5. Página /dashboard protegida (placeholder)

**Cliente Auth (Magic Link):**

1. Formulario login simplificado (/portal/login)

2. Envío de magic links vía Supabase Auth

3. Validación de email contra tabla clients

4. Redirect a /portal/client/:clientId tras auth

**Testing:**

1. Unit tests: Supabase client helpers

2. E2E test: Login flow completo con Playwright

**Entregables:**

1. Autenticación dual funcional (admin \+ cliente)

2. Rate limiting configurado (5 intentos/min)

3. Tests coverage \>80% en auth module

**Sprint 1.3 \- Sistema de Diseño (Semana 3\)**

**Componentes UI Base:**

1. Button (variantes: primary, secondary, outline, ghost)

2. Input (text, email, password, number, date)

3. Select (single, multi-select con react-select)

4. Modal (confirmation, form, full-screen)

5. Card (con header, body, footer)

6. Badge (status, priority, language)

7. Toast notifications (react-hot-toast)

8. Dropdown menu (acciones contextuales)

**Layout Components:**

1. Navbar (con avatar, alerts badge, logout)

2. Sidebar navigation (colapsable en mobile)

3. Page container (padding, max-width)

4. Empty states (ilustraciones \+ CTA)

**Design Tokens:**

1. Paleta de colores (primary: teal, secondary: slate, error: red)

2. Tipografía (Inter para UI, JetBrains Mono para código)

3. Espaciado (escala 4px: 4, 8, 12, 16, 24, 32, 48, 64\)

4. Shadows (4 niveles: sm, md, lg, xl)

5. Border radius (sm: 4px, md: 8px, lg: 12px, full: 9999px)

**Entregables:**

1. Storybook con 20+ componentes documentados

2. Figma file con design system sincronizado

3. Componentes accesibles (WCAG 2.1 AA)

**2.3 Criterios de Aceptación Fase 1**

1. ✅ Usuario admin puede hacer login y logout

2. ✅ Cliente puede recibir magic link y acceder al portal

3. ✅ Base de datos con todas las tablas y RLS activo

4. ✅ Sistema de diseño funcional y documentado

5. ✅ Proyecto deployado en Vercel con HTTPS

6. ✅ Tests E2E passing en CI/CD

---

**3\. FASE 2: CORE MVP (4 SEMANAS)**

**3.1 Objetivos**

1. Implementar gestión completa de clientes

2. Desarrollar sistema de proyectos con Kanban

3. Habilitar drag & drop con sincronización real-time

4. Crear sistema de auditoría automática

**3.2 Tareas Detalladas**

**Sprint 2.1 \- Gestión de Clientes (Semana 4\)**

**CRUD Clientes:**

1. Página /clients con tabla paginada (20 items/página)

2. Modal "Crear Cliente" con validación completa

3. Formulario con campos: company\_name, email, contact\_person, phone, address, nif\_cif, language, notes

4. Validación NIF/CIF con regex español

5. Validación phone formato E.164

6. Botón "Editar" abre mismo modal pre-rellenado

7. Confirmation dialog para eliminación

8. Validación: Bloquear delete si tiene proyectos activos

**Búsqueda y Filtros:**

1. Search input con debounce 300ms (nombre/email)

2. Filtro dropdown por idioma (Todos/ES/EN/CA)

3. Ordenar por: Fecha creación, Última actividad, Nombre A-Z

4. Query params en URL para compartir filtros

**Testing:**

1. Unit tests: Validaciones de formulario

2. Integration tests: CRUD operations con DB

3. E2E test: Crear cliente → Editar → Eliminar flow

**Entregables:**

1. CRUD clientes 100% funcional

2. Validaciones client-side y server-side

3. Tests coverage \>85%

**Sprint 2.2 \- Proyectos Base (Semana 5\)**

**Crear/Editar Proyecto:**

1. Formulario full-page /projects/new

2. Campos obligatorios: project\_name, client\_id, status

3. Campos opcionales: description (rich text), budget, deadline, priority

4. Dropdown client\_id con search (react-select)

5. Date picker deadline con calendario (react-day-picker)

6. Validación: deadline debe ser futura

7. Auto-save draft cada 30 segundos (opcional)

**Estados de Proyecto:**

1. Enum: backlog, proposal, approved, in\_progress, testing, completed, cancelled

2. Color-coding por estado (badges)

3. Matriz de transiciones (validación backend)

**Auditoría:**

1. Trigger automático en INSERT/UPDATE/DELETE

2. Tabla audit\_logs registra: table\_name, record\_id, action, old\_data, new\_data, changed\_by, changed\_at

3. Timeline visual en modal detalles proyecto

**Entregables:**

1. Formulario proyectos funcional

2. Sistema auditoría operativo

3. Validaciones de transiciones implementadas

**Sprint 2.3 \- Kanban Board (Semana 6\)**

**Implementación Kanban:**

1. Página /kanban con layout horizontal (7 columnas)

2. Integrar @hello-pangea/dnd para drag & drop

3. Columnas: Backlog, Propuesta, Aprobado, En Progreso, Testing, Completado, Cancelado

4. Scroll horizontal en mobile (\<768px)

5. Tarjetas de proyecto con:

   1. Badge prioridad (color-coded)

   2. project\_name (heading)

   3. Cliente (company\_name)

   4. Deadline (rojo si \<7 días)

   5. Budget progress bar

**Drag & Drop Logic:**

1. onDragEnd handler actualiza DB

2. UPDATE projects SET status \= nuevo\_status, updated\_at \= NOW()

3. Validar transiciones permitidas (mostrar error toast si inválida)

4. Optimistic UI update (revertir si falla)

**Testing:**

1. E2E test: Drag proyecto de Backlog → Propuesta

2. Validar que UPDATE se ejecuta en DB

3. Test transiciones inválidas (ej: completed → backlog)

**Entregables:**

1. Kanban funcional con 7 columnas

2. Drag & drop con validaciones

3. UI responsive (mobile \+ desktop)

**Sprint 2.4 \- Real-time Sync (Semana 7\)**

**Supabase Realtime:**

1. Configurar Realtime en tabla projects

2. Frontend subscribe a cambios: supabase.channel('projects').on('postgres\_changes')

3. Actualizar estado React cuando otro usuario mueve tarjeta

4. Mostrar toast: "Usuario X movió Proyecto Y a Estado Z"

5. Optimistic updates \+ reconciliación con server state

**Presence (opcional):**

1. Mostrar avatares de usuarios conectados (top-right Kanban)

2. Broadcast cursor position al hover tarjeta

3. Timeout 30s para detectar usuarios inactivos

**Testing:**

1. Test con 2 pestañas simultáneas (manual)

2. Validar sincronización \<1 segundo

3. Test reconexión tras pérdida de red

**Entregables:**

1. Kanban sincronizado en real-time

2. Latencia \<1s en updates

3. Manejo de conflictos (last-write-wins)

**3.3 Criterios de Aceptación Fase 2**

1. ✅ Admin puede crear, editar, eliminar clientes

2. ✅ Admin puede crear proyectos y asignar a clientes

3. ✅ Kanban muestra todos los proyectos en columnas correctas

4. ✅ Drag & drop funciona y actualiza DB

5. ✅ Cambios se sincronizan entre usuarios en \<1s

6. ✅ Sistema de auditoría registra todos los cambios

7. ✅ Tests E2E cubren happy paths principales

---

**4\. FASE 3: IA \- GENERACIÓN DE PRESUPUESTOS (3 SEMANAS)**

**4.1 Objetivos**

1. Implementar servicio FastAPI local con Ollama

2. Integrar Llama 3.2 3B para generación de presupuestos

3. Crear interfaz wizard multi-step

4. Habilitar edición post-generación y exportación PDF

**4.2 Tareas Detalladas**

**Sprint 3.1 \- Backend IA (Semana 8\)**

**Setup Ollama Local:**

1. Instalar Ollama en máquina dev: curl [https://ollama.ai/install.sh](https://ollama.ai/install.sh) | sh

2. Descargar modelo: ollama pull llama3.2:3b

3. Verificar: ollama run llama3.2:3b "Test prompt"

4. Configurar puerto 11434 (default)

**FastAPI Service:**

1. Proyecto Python: ai-service/ con estructura:

   1. [main.py](http://main.py) (FastAPI app)

   2. [models.py](http://models.py) (Pydantic schemas)

   3. [prompts.py](http://prompts.py) (System prompt templates)

   4. [utils.py](http://utils.py) (JSON extraction, validation)

   5. requirements.txt

2. Endpoint POST /api/generate-quote

3. Request schema: QuoteRequest (client\_name, project\_name, services, language, tone, technical\_depth)

4. Llamada a Ollama con requests.post("[http://localhost:11434/api/generate](http://localhost:11434/api/generate)")

5. Timeout 30s, retry 1 vez si falla

6. Extraer JSON de respuesta LLM (regex para encontrar {...})

7. Validar estructura JSON obligatoria

8. Response: QuoteResponse con content\_json validado

**CORS Configuration:**

1. Permitir origen: [https://anclora-platform.vercel.app](https://anclora-platform.vercel.app)

2. Methods: POST solamente

3. Headers: Content-Type, Authorization

**Testing:**

1. Unit tests: Prompt generation con diferentes tones

2. Integration test: Llamada a Ollama mock

3. E2E test manual: Generar presupuesto real con Llama

**Entregables:**

1. FastAPI service funcional en localhost:8000

2. Ollama respondiendo con Llama 3.2 3B

3. Endpoint /api/generate-quote operativo

**Sprint 3.2 \- Frontend Wizard (Semana 9\)**

**Wizard Multi-Step:**

1. Página /quotes/new con stepper (1/3, 2/3, 3/3)

2. Paso 1: Información Básica

   1. Dropdown proyecto existente (react-select con search)

   2. Radio buttons idioma (ES, EN, CA)

   3. Botón "Siguiente"

3. Paso 2: Servicios Solicitados

   1. Checkboxes múltiples con servicios pre-definidos

   2. Por cada servicio: textarea description\_detail \+ input custom\_hours

   3. Estimaciones default: Consultoría 20-40h, Desarrollo MVP 80-120h, etc.

   4. Botón "Anterior" \+ "Siguiente"

4. Paso 3: Tono y Configuración

   1. Dropdown tone con 6 opciones \+ descripciones

   2. Slider technical\_depth (1-10) con labels

   3. Checkboxes: include\_timeline, include\_payment\_terms

   4. Textarea custom\_instructions (max 300 chars)

   5. Botón "Generar Presupuesto"

**Estado del Wizard:**

1. Usar zustand o React Context para mantener estado entre pasos

2. Validación en cada paso antes de avanzar

3. Guardar en localStorage (auto-restore si sale y vuelve)

**Loading State:**

1. Al enviar: Mostrar spinner "Generando con IA... (puede tardar 10-20s)"

2. Progress bar simulada (0% → 100% en 15s)

3. Deshabilitar botones durante generación

**Entregables:**

1. Wizard 3 pasos funcional

2. Validaciones en cada paso

3. UX fluida con loading states

**Sprint 3.3 \- Edición y PDF (Semana 10\)**

**Vista Previa Split-View:**

1. Layout 50/50: Editor (izq) \+ Preview (der)

2. Editor con campos editables:

   1. Textarea introduction (rich text con react-quill)

   2. Tabla editable servicios (tanstack/react-table con inline edit)

   3. Textarea timeline

   4. Textarea payment\_terms

   5. Textarea conclusion

3. Botones: \[+ Añadir servicio\] \[❌ Eliminar fila\]

4. Cálculos auto: subtotal, IVA 21%, total (actualización en vivo)

**Preview Panel:**

1. Render HTML profesional del presupuesto

2. CSS: Logo Anclora, tipografías brand, colores corporativos

3. Secciones colapsables (accordions)

4. Auto-refresh al editar (debounce 500ms)

**Guardar en DB:**

1. Botón \[💾 Guardar borrador\]

2. INSERT en tabla quotes con status='draft'

3. Auto-generar version (trigger incrementa)

4. Almacenar content\_json completo

5. Toast confirmación: "Presupuesto v2 guardado"

**Generar PDF:**

1. Botón \[📄 Generar PDF\]

2. Usar @react-pdf/renderer

3. Componente PDFDocument con estructura profesional

4. Generar blob → Subir a Supabase Storage (bucket: quotes-pdfs)

5. Path: {client\_id}/{project\_id}/quote-v{version}.pdf

6. UPDATE quotes SET pdf\_url \= public\_url

7. Botones: \[👁️ Vista previa\] \[💾 Descargar\]

**Enviar Email:**

1. Botón \[📧 Enviar por email\]

2. Modal con:

   1. Email destinatario (pre-rellenado de clients.email)

   2. Textarea mensaje personalizado

   3. Checkbox "Adjuntar PDF"

3. Llamar Edge Function: send-quote-email

4. Edge Function usa Resend API para envío

5. UPDATE quotes SET status='sent', sent\_at=NOW()

6. Toast: "Presupuesto enviado a [cliente@example.com](mailto:cliente@example.com)"

**Entregables:**

1. Editor funcional con preview en vivo

2. PDFs generados con calidad profesional

3. Sistema envío email operativo

**4.3 Criterios de Aceptación Fase 3**

1. ✅ IA genera presupuestos en \<30s con Llama 3.2

2. ✅ Wizard guía al usuario en 3 pasos claros

3. ✅ Editor permite modificar 100% del contenido generado

4. ✅ PDFs se generan con logo, estructura profesional, cálculos correctos

5. ✅ Emails con PDF adjunto llegan correctamente

6. ✅ Sistema de versiones funciona (v1, v2, v3...)

---

**5\. FASE 4: FACTURACIÓN (2 SEMANAS)**

**5.1 Objetivos**

1. Implementar generación de facturas con numeración automática

2. Crear PDFs profesionales de facturas

3. Habilitar envío por email y tracking de pagos

**5.2 Tareas Detalladas**

**Sprint 4.1 \- CRUD Facturas (Semana 11\)**

**Crear Factura:**

1. Botón \[💰 Generar Factura\] en proyecto (visible si status \>= 'in\_progress')

2. Modal formulario con campos:

   1. Proyecto (pre-seleccionado, readonly)

   2. Número factura (auto-generado YYYY-MM-NNNN, readonly)

   3. Fecha emisión (date picker, default: hoy)

   4. Fecha vencimiento (date picker, default: \+30 días)

   5. Opción 1: \[Importar desde presupuesto\] → Carga líneas de última quote aprobada

   6. Opción 2: Líneas manuales (tabla editable: Descripción, Cantidad, Precio unitario, Importe)

3. Botones: \[+ Añadir línea\] \[❌ Eliminar\]

4. Cálculos auto: Subtotal, IVA 21%, Total

5. Validación: Fecha vencimiento \> fecha emisión

6. Warning (no bloqueante): Si total \> budget del proyecto

**Trigger Numeración:**

1. Implementar función generate\_invoice\_number() en Supabase

2. Formato: YYYY-MM-NNNN (ej: 2026-01-0001)

3. Auto-incrementa por mes

4. Constraint UNIQUE en invoice\_number

**Listado Facturas:**

1. Página /invoices con tabla

2. Columnas: Número, Cliente, Proyecto, Fecha emisión, Fecha vencimiento, Total, Estado, Acciones

3. Filtros: Por estado (Draft/Sent/Paid/Overdue), por cliente, por fecha

4. Badge estado color-coded (rojo overdue, verde paid)

**Entregables:**

1. CRUD facturas funcional

2. Numeración automática sin colisiones

3. Importación desde presupuesto operativa

**Sprint 4.2 \- PDF y Email (Semana 12\)**

**PDF Factura:**

1. Botón \[📄 Generar PDF\]

2. Componente @react-pdf/renderer con estructura:

   1. Header: Logo \+ "FACTURA" \+ número (grande, destacado)

   2. Datos empresa Anclora (NIF, dirección)

   3. Datos cliente (company\_name, NIF, dirección)

   4. Fechas: Emisión y Vencimiento

   5. Tabla conceptos: Descripción, Cantidad, Precio, Importe

   6. Subtotal, IVA, TOTAL (destacado)

   7. Forma de pago: IBAN \+ concepto

   8. Texto legal footer (IRPF, validez sin firma)

3. Subir a Storage bucket: invoices-pdfs

4. Path: {client\_id}/{project\_id}/invoice-{number}.pdf

5. UPDATE invoices SET pdf\_url

**Enviar Factura:**

1. Botón \[📧 Enviar Factura\]

2. Modal con email pre-rellenado \+ mensaje editable

3. Edge Function: send-invoice-email con template HTML

4. PDF adjunto desde Storage

5. UPDATE invoices SET status='sent', sent\_at=NOW()

6. Toast confirmación

**Marcar como Pagada:**

1. Botón \[✅ Marcar como Pagada\] (visible si status='sent')

2. Confirmation dialog: "¿Confirmar pago recibido?"

3. UPDATE invoices SET status='paid', paid\_at=NOW()

4. Badge en proyecto cambia a "Pagado" (verde)

5. Opcional: Notificación Slack/Email admin

**Estado Overdue:**

1. Cron job diario (Edge Function scheduled)

2. Detecta facturas: due\_date \< CURRENT\_DATE y status='sent'

3. UPDATE invoices SET status='overdue'

4. Opcional: Email automático recordatorio cliente

**Entregables:**

1. PDFs factura con calidad profesional

2. Envío email con adjunto funcional

3. Sistema tracking pagos operativo

4. Cron overdue implementado

**5.3 Criterios de Aceptación Fase 4**

1. ✅ Facturas se generan con numeración única automática

2. ✅ PDFs incluyen toda la información legal requerida

3. ✅ Emails con PDF adjunto se envían correctamente

4. ✅ Admin puede marcar facturas como pagadas

5. ✅ Estado overdue se actualiza automáticamente

---

**6\. FASE 5: PORTAL CLIENTE (2 SEMANAS)**

**6.1 Objetivos**

1. Crear dashboard cliente con vista de proyectos propios

2. Implementar Kanban read-only

3. Habilitar descarga de presupuestos y facturas

**6.2 Tareas Detalladas**

**Sprint 5.1 \- Dashboard Cliente (Semana 13\)**

**Layout Portal:**

1. Ruta: /portal/client/:clientId

2. RLS automático: WHERE client\_id \= auth.uid()

3. Header: Logo Anclora \+ Nombre cliente (company\_name) \+ Logout

4. Sin sidebar (UI simplificada)

**Dashboard Cards:**

1. Card 1: Total proyectos activos (count WHERE status IN ('proposal', 'approved', 'in\_progress', 'testing'))

2. Card 2: Total completados (count WHERE status \= 'completed')

3. Card 3: Pendientes aprobación (count WHERE status \= 'proposal')

**Sección Proyectos en Curso:**

1. Lista de cards (grid 2 columnas desktop, 1 mobile)

2. Por cada proyecto:

   1. project\_name (heading)

   2. Badge estado (color-coded)

   3. Progress bar (visual)

   4. Deadline (formato "15 Feb 2026", rojo si \<7 días)

   5. Botones: \[Ver Kanban\] \[Ver Presupuesto\]

**Sección Última Actividad:**

1. Timeline vertical (últimos 10 eventos)

2. Query: SELECT \* FROM audit\_logs WHERE record\_id IN (proyectos del cliente) ORDER BY changed\_at DESC LIMIT 10

3. Formato: "30 Ene: Tarea X completada", "29 Ene: Proyecto A → Testing"

4. Iconos por tipo de evento (📝 update, ✅ completed, etc.)

**Entregables:**

1. Dashboard funcional con métricas en vivo

2. RLS validado (cliente solo ve sus proyectos)

3. Timeline actividad operativa

**Sprint 5.2 \- Kanban y Descargas (Semana 14\)**

**Kanban Read-Only:**

1. Ruta: /portal/client/:clientId/kanban

2. Mismo componente que admin pero:

   1. draggable=false en tarjetas

   2. Sin botones de edición

   3. Tooltip al hover: "Solo lectura"

   4. Filtrado automático por client\_id (RLS)

3. Real-time updates funciona (cliente ve cambios de admin en vivo)

**Descargar Presupuestos:**

1. Página /portal/client/:clientId/quotes

2. Lista de presupuestos del cliente

3. Columnas: Proyecto, Versión, Fecha, Estado, Total, Acciones

4. Filtro: Solo mostrar status IN ('sent', 'viewed', 'accepted')

5. Botón \[📄 Descargar PDF\] → Link directo a Storage URL

6. Click en PDF incrementa view counter (UPDATE quotes SET viewed\_at \= NOW() si es primera vez)

**Descargar Facturas:**

1. Página /portal/client/:clientId/invoices

2. Lista de facturas del cliente

3. Columnas: Número, Fecha, Total, Estado, Acciones

4. Filtro: Solo mostrar status IN ('sent', 'paid', 'overdue')

5. Botón \[📄 Descargar PDF\]

6. Badge destacado si overdue

**Entregables:**

1. Kanban read-only funcional

2. Cliente puede descargar todos sus documentos

3. View tracking presupuestos operativo

**6.3 Criterios de Aceptación Fase 5**

1. ✅ Cliente accede vía magic link a su portal personalizado

2. ✅ Dashboard muestra métricas correctas de sus proyectos

3. ✅ Kanban se sincroniza en real-time (read-only)

4. ✅ Cliente descarga presupuestos y facturas en PDF

5. ✅ RLS impide ver datos de otros clientes (validado con tests)

---

**7\. FASE 6: SISTEMA DE ALERTAS (1 SEMANA)**

**7.1 Objetivos**

1. Implementar generación automática de alertas

2. Crear panel de alertas en UI

3. Configurar notificaciones por email

**7.2 Tareas Detalladas**

**Sprint 6.1 \- Alertas (Semana 15\)**

**Edge Function: generate-alerts**

1. Crear función Supabase Deno

2. Trigger: Cron job diario 09:00 CET

3. Lógica SQL (ver [spec.md](http://spec.md) sección 2.7.3):

   1. Deadline approaching (\<7 días)

   2. Invoice overdue (\>7 días vencida)

   3. Project stale (sin cambios 14 días)

   4. Client inactive (sin proyectos 90 días)

4. INSERT en tabla alerts con deduplicación (NOT EXISTS)

5. Priority asignada según tipo

**Panel Alertas UI:**

1. Badge en navbar (top-right) con contador unread

2. Dropdown al click:

   1. Últimas 10 alertas no leídas

   2. Iconos por priority (🔴 critical, 🟠 high, 🟡 medium, 🔵 low)

   3. Mensaje \+ tiempo relativo ("hace 2 horas")

   4. Click alerta → Navega a proyecto/cliente relacionado

3. Footer dropdown: \[Marcar todas leídas\] \[Ver todas\]

**Página /alerts:**

1. Tabla completa con paginación 50/página

2. Columnas: Tipo, Mensaje, Prioridad, Fecha, Estado, Acciones

3. Filtros:

   1. Multi-select tipo (deadline, budget, invoice, stale, inactive)

   2. Multi-select priority (low, medium, high, critical)

   3. Radio estado (Activas / Resueltas)

   4. Date range picker

4. Acciones bulk: \[Marcar como leídas\] \[Resolver\] \[Descartar\]

5. Botón \[📥 Exportar CSV\]

**Email Notificaciones:**

1. Edge Function: send-alert-emails

2. Trigger: Tras generar alertas (priority \>= 'high')

3. Template HTML con lista de alertas

4. Envío a admin email (configurado en env vars)

5. Agrupar alertas por tipo en email (evitar spam)

**Entregables:**

1. Sistema alertas 100% automatizado

2. Panel UI funcional con filtros

3. Emails notificación high/critical priority

**7.3 Criterios de Aceptación Fase 6**

1. ✅ Alertas se generan automáticamente cada día

2. ✅ Badge navbar muestra contador correcto

3. ✅ Admin recibe email con alertas críticas

4. ✅ Panel /alerts permite filtrar y exportar

5. ✅ Click en alerta navega al recurso correcto

---

**8\. FASE 7: TESTING Y QA (2 SEMANAS)**

**8.1 Objetivos**

1. Alcanzar 80%+ test coverage

2. Implementar tests E2E críticos con Playwright

3. Realizar auditoría de performance y accesibilidad

4. Corregir bugs encontrados

**8.2 Tareas Detalladas**

**Sprint 7.1 \- Tests Automatizados (Semana 16\)**

**Unit Tests (Vitest \+ React Testing Library):**

1. Componentes UI: Button, Input, Modal, Card (\>90% coverage)

2. Utilities: Validation helpers, formatters, date utils

3. Hooks custom: useAuth, useRealtime, useDebounce

4. Target: 80% coverage total

**Integration Tests:**

1. CRUD operations con DB (Supabase local instance)

2. RLS policies validation

3. Edge Functions (local execution con Deno)

4. FastAPI endpoints (pytest con mock Ollama)

**E2E Tests (Playwright):**

Casos críticos a automatizar:

1. Login admin → Crear cliente → Crear proyecto → Mover Kanban → Logout

2. Login cliente → Ver dashboard → Descargar presupuesto → Logout

3. Generar presupuesto con IA → Editar → Guardar → Generar PDF → Enviar email

4. Crear factura → Generar PDF → Enviar → Marcar como pagada

5. Sistema alertas: Trigger manual → Verificar aparece badge → Marcar leída

**CI/CD:**

1. GitHub Actions workflow:

   1. Lint \+ Type check

   2. Unit tests

   3. Build Next.js

   4. E2E tests en Chromium \+ Firefox

   5. Deploy a Vercel (solo si todos pasan)

2. Ejecutar en cada push a main y PRs

**Entregables:**

1. 80%+ code coverage

2. 15+ tests E2E críticos passing

3. CI/CD pipeline funcional

**Sprint 7.2 \- QA y Performance (Semana 17\)**

**Lighthouse Audit:**

Target scores:

1. Performance: \>90

2. Accessibility: \>95 (WCAG 2.1 AA)

3. Best Practices: \>95

4. SEO: \>90

Optimizaciones:

1. Image optimization (Next.js Image component)

2. Code splitting (dynamic imports para modales)

3. Font loading strategy (font-display: swap)

4. Lazy load Kanban columns fuera de viewport

5. Preload critical CSS

**Accessibility Audit:**

1. Instalar axe DevTools

2. Verificar:

   1. Todos los inputs con labels

   2. Imágenes con alt text

   3. Color contrast ratio (mínimo 4.5:1 texto normal, 3:1 texto grande)

   4. Keyboard navigation (Tab, Enter, Escape)

   5. ARIA labels en iconos (sr-only text)

   6. Focus indicators visibles

3. Corregir issues detectados (prioridad: crítico \> serio \> moderado)

**Manual QA:**

Checklist de pruebas manuales:

1. ✅ Responsive en: iPhone SE (375px), iPad (768px), Desktop (1920px)

2. ✅ Cross-browser: Chrome, Firefox, Safari, Edge

3. ✅ Login/Logout flujos (admin \+ cliente)

4. ✅ CRUD completo: Clientes, Proyectos, Presupuestos, Facturas

5. ✅ Kanban drag & drop en touch devices (iPad)

6. ✅ IA generación presupuestos con diferentes tones

7. ✅ PDF generation (verificar contenido completo)

8. ✅ Email delivery (revisar inbox real)

9. ✅ Real-time sync (2 pestañas simultáneas)

10. ✅ Sistema alertas (forzar condiciones)

11. ✅ Portal cliente (verificar RLS)

**Bug Tracking:**

1. Crear issues en GitHub por cada bug encontrado

2. Labels: bug, priority (P0-P3), module (auth, kanban, ai, etc.)

3. Asignar a sprint según priority

4. Target: 0 bugs P0/P1 antes de launch

**Entregables:**

1. Lighthouse scores \>90 en todas las categorías

2. 0 issues críticos de accesibilidad

3. Checklist manual QA 100% completado

4. Lista bugs documentada con prioridades

**8.3 Criterios de Aceptación Fase 7**

1. ✅ Test coverage \>80% en frontend y backend

2. ✅ 15+ tests E2E passing en CI/CD

3. ✅ Lighthouse performance \>90

4. ✅ WCAG 2.1 AA compliance verificado

5. ✅ 0 bugs críticos pendientes

6. ✅ App funciona en 4+ navegadores y 3+ tamaños pantalla

---

**9\. DEPLOYMENT Y LANZAMIENTO**

**9.1 Arquitectura de Producción**

1. **Frontend:** Vercel (CDN global, SSL automático)

2. **Database:** Supabase (región EU West, backups automáticos)

3. **Storage:** Supabase Storage (PDFs, documentos)

4. **Backend IA:** Railway/Render (expone FastAPI públicamente)

5. **Tunnel (dev only):** Cloudflare Tunnel para desarrollo local

6. **Email:** Resend API (deliverability \>99%)

7. **Monitoring:** Vercel Analytics \+ Sentry (error tracking)

**9.2 Variables de Entorno**

**Frontend (.env.local):**

NEXT\_PUBLIC\_SUPABASE\_URL=https://xxx.supabase.co  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJxxx...  
SUPABASE\_SERVICE\_ROLE\_KEY=eyJxxx... (server-side only)  
AI\_SERVICE\_URL=https://anclora-ai.railway.app  
RESEND\_API\_KEY=re\_xxx

**Backend IA (.env):**

OLLAMA\_URL=http://localhost:11434  
ALLOWED\_ORIGINS=https://anclora-platform.vercel.app  
LOG\_LEVEL=INFO

**9.3 Checklist Pre-Lanzamiento**

1. ☐ Todos los tests passing en CI/CD

2. ☐ Lighthouse scores \>90

3. ☐ Variables de entorno configuradas en Vercel

4. ☐ Custom domain configurado (anclora.app)

5. ☐ SSL certificado válido

6. ☐ Backups automáticos DB habilitados (Supabase)

7. ☐ Monitoring activo (Sentry, Vercel Analytics)

8. ☐ Emails de notificación funcionando

9. ☐ Documentation actualizada (README, API docs)

10. ☐ Demo data cargada para onboarding

11. ☐ Términos y condiciones \+ Privacy policy (páginas estáticas)

**9.4 Plan de Rollout**

**Fase Soft Launch (Beta):**

1. Invitar 3-5 clientes beta

2. Recoger feedback durante 2 semanas

3. Iterar sobre issues reportados

4. Monitorear performance y errores

**Fase Public Launch:**

1. Announcement email a lista de espera

2. Post en LinkedIn/Twitter

3. Landing page optimizada para SEO

4. Soporte vía email (hola@anclora.app)

---

**10\. POST-LANZAMIENTO Y ROADMAP FUTURO**

**10.1 Monitoring Continuo**

**Métricas a trackear:**

1. Usuarios activos (DAU, MAU)

2. Proyectos creados por mes

3. Presupuestos generados con IA

4. Facturas emitidas

5. Tiempo promedio generación presupuesto

6. Tasa conversión presupuesto → proyecto aprobado

7. Errores 5xx (target: \<0.1%)

8. Response time API (target: p95 \<500ms)

**Herramientas:**

1. Vercel Analytics (performance)

2. Sentry (error tracking)

3. PostHog (product analytics, opcional)

4. Supabase Dashboard (DB metrics)

**10.2 Features Post-MVP (Roadmap Q2-Q3 2026\)**

**Fase 8: Integraciones (4 semanas)**

1. Integración Stripe para pagos online

2. Integración Google Calendar (sync deadlines)

3. Integración Slack (notificaciones tiempo real)

4. Webhooks para sistemas externos

**Fase 9: Colaboración (3 semanas)**

1. Chat admin-cliente (WebSockets)

2. Comentarios en proyectos (threading)

3. File upload en proyectos (Storage)

4. Multi-user admin (roles: owner, editor, viewer)

**Fase 10: Analytics (2 semanas)**

1. Dashboard analytics para admin

2. Gráficas: Ingresos por mes, proyectos por estado, tiempo promedio completar

3. Exportar reports en CSV/Excel

4. Forecasting con historical data

**Fase 11: PWA (2 semanas)**

1. Service Workers para offline-first

2. Push notifications (Web Push API)

3. Install prompt (Add to Home Screen)

4. Sync en background

**Fase 12: IA Avanzada (4 semanas)**

1. Fine-tuning Llama con presupuestos históricos

2. Generación automática facturas desde tiempo trackeado

3. Sugerencias IA para pricing óptimo

4. Detección automática scope creep

**10.3 Mantenimiento y Soporte**

**Ciclo de releases:**

1. Minor releases: Cada 2 semanas (bug fixes, pequeñas mejoras)

2. Major releases: Cada 2-3 meses (nuevas features)

3. Hotfixes: Según necesidad (bugs críticos)

**Soporte cliente:**

1. Email: hola@anclora.app (SLA: \<24h respuesta)

2. Documentación: docs.anclora.app (auto-servicio)

3. Video tutorials: YouTube channel

4. Opcional: Chat in-app (Intercom/Crisp)

---

**11\. RIESGOS Y MITIGACIONES**

**11.1 Riesgos Técnicos**

| Riesgo | Probabilidad | Mitigación |
| :---- | :---- | :---- |
| Ollama/Llama lento (\>30s) | Media | Timeout 30s \+ fallback template. Considerar GPU local o API externa (OpenRouter) |
| Supabase RLS bypass | Baja | Tests automatizados RLS en CI. Audit regular con supabase-test-helpers |
| Real-time desync | Media | Optimistic updates \+ reconciliación. Retry logic \+ exponential backoff |
| PDF generación falla | Baja | Catch errors \+ retry. Fallback HTML view descargable |
| Email delivery falla | Baja | Queue system con Supabase \+ Edge Function. Retry 3 veces con backoff |
| Storage límites | Baja | Monitoring uso. Cleanup PDFs antiguos (\>1 año) automático |

Table 2: Matriz de riesgos técnicos

**11.2 Riesgos de Proyecto**

| Riesgo | Probabilidad | Mitigación |
| :---- | :---- | :---- |
| Scope creep | Alta | Freeze features post-spec approval. Nuevas ideas → Roadmap futuro |
| Delays en desarrollo | Media | Buffer 20% en estimaciones. Daily standups para detectar blockers early |
| Dependencia única dev | Media | Documentación exhaustiva. Pair programming en features críticas |
| Cambios en APIs externas | Baja | Pin versions de librerías. Monitoring breaking changes (Dependabot) |

Table 3: Riesgos de gestión del proyecto

---

**12\. CONCLUSIÓN**

**12.1 Resumen del Plan**

Este plan establece una ruta clara para implementar la plataforma Anclora en **17 semanas (\~4 meses)** mediante 7 fases iterativas:

1. Fundación (3 semanas): Auth \+ DB \+ Design System

2. Core MVP (4 semanas): Clientes \+ Proyectos \+ Kanban

3. IA (3 semanas): Generación presupuestos con Llama

4. Facturación (2 semanas): Invoicing \+ PDFs

5. Portal Cliente (2 semanas): Dashboard read-only

6. Alertas (1 semana): Notificaciones automáticas

7. Testing QA (2 semanas): Coverage \+ Performance

**12.2 Éxito del Proyecto**

El proyecto se considerará exitoso si cumple:

1. ✅ Lighthouse score \>90 en todas las categorías

2. ✅ WCAG 2.1 AA compliance

3. ✅ Test coverage \>80%

4. ✅ 0 bugs críticos en producción

5. ✅ IA genera presupuestos \<30s en 95% de casos

6. ✅ Real-time sync latencia \<1s

7. ✅ Uptime \>99.5% (medido con UptimeRobot)

8. ✅ Feedback beta users \>4/5 stars

**12.3 Próximos Pasos Inmediatos**

1. Aprobar este plan (requiere sign-off del cliente)

2. Setup repositorio Git \+ project board (GitHub Projects)

3. Crear proyecto Supabase (EU West)

4. Inicializar Next.js app \+ primer commit

5. Configurar CI/CD pipeline

6. Kickoff Sprint 1.1 (día 1 de desarrollo)

---

**Documento preparado por:** Equipo Anclora  
**Fecha de aprobación:** Pendiente  
**Última actualización:** 30 de enero de 2026