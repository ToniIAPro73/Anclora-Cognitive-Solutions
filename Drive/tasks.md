[**tasks.md**](http://tasks.md) **\- Desglose de Tareas**

**Anclora Cognitive Solutions Platform**

**Versión:** 1.0.0  
**Tipo de documento:** Task Breakdown & Sprint Backlog  
**Audiencia:** Development Team, Scrum Master  
**Estado:** Activo  
**Fecha:** 30 de enero de 2026

---

**1\. ESTRUCTURA DEL DOCUMENTO**

Este documento desglosa cada fase del plan de implementación en tareas específicas, accionables y estimadas en horas. Está diseñado para ser importado directamente a herramientas de gestión de proyectos como Jira, Linear o GitHub Projects.

**1.1 Convenciones**

1. **Estimación:** Story points (1 SP \= 4 horas) o horas directas

2. **Prioridad:** P0 (crítico), P1 (alto), P2 (medio), P3 (bajo)

3. **Estado:** TODO, IN\_PROGRESS, BLOCKED, REVIEW, DONE

4. **Asignación:** Frontend (FE), Backend (BE), Full-Stack (FS), QA

**1.2 Formato de Tarea**

Cada tarea incluye:

1. ID único (ej: ANCLORA-001)

2. Título descriptivo

3. Descripción detallada

4. Criterios de aceptación

5. Estimación (horas o SP)

6. Prioridad

7. Dependencias (si aplica)

8. Tags técnicos

---

**2\. FASE 1: FUNDACIÓN (3 SEMANAS)**

**2.1 Sprint 1.1 \- Setup Inicial (Semana 1\)**

**ANCLORA-001: Configurar Proyecto Supabase**

**Descripción:**

Crear proyecto Supabase en región EU West (Frankfurt) y configurar accesos base.

**Tareas específicas:**

1. Crear proyecto en dashboard Supabase

2. Configurar región: EU West (Frankfurt)

3. Obtener API keys (anon, service\_role)

4. Configurar database password seguro (\>16 chars)

5. Habilitar Row Level Security (RLS) por defecto

6. Crear buckets Storage: quotes-pdfs, invoices-pdfs

7. Configurar permisos buckets (authenticated users)

**Criterios de aceptación:**

1. Proyecto Supabase operativo

2. API keys guardadas en password manager

3. Buckets Storage creados con permisos correctos

4. RLS habilitado a nivel proyecto

**Estimación:** 2 horas  
**Prioridad:** P0  
**Asignación:** BE  
**Tags:** \#infra \#supabase \#setup

---

**ANCLORA-002: Crear Esquema de Base de Datos**

**Descripción:**

Implementar todas las tablas según [spec.md](http://spec.md) sección 3.2 con constraints, indexes y triggers.

**Tareas específicas:**

1. Ejecutar SQL de creación de tablas:

   1. clients

   2. projects

   3. quotes

   4. invoices

   5. alerts

   6. audit\_logs

2. Crear indexes según spec

3. Implementar triggers:

   1. set\_quote\_version()

   2. generate\_invoice\_number()

   3. audit\_trigger() para tablas críticas

4. Verificar constraints (UNIQUE, CHECK, FK)

5. Seed data de prueba (5 clientes, 10 proyectos)

**Criterios de aceptación:**

1. Todas las tablas creadas sin errores

2. Triggers funcionando correctamente

3. Seed data cargado

4. Diagrama ER generado con Supabase Schema Visualizer

**Estimación:** 6 horas  
**Prioridad:** P0  
**Asignación:** BE  
**Dependencias:** ANCLORA-001  
**Tags:** \#database \#postgresql \#schema

---

**ANCLORA-003: Configurar RLS Policies**

**Descripción:**

Implementar Row Level Security policies para todas las tablas según especificación.

**Tareas específicas:**

1. Habilitar RLS en todas las tablas

2. Crear policies para clients:

   1. Admin full access

   2. Clients read own data

3. Crear policies para projects, quotes, invoices:

   1. Admin full access

   2. Clients read own records

4. Crear policy para alerts (admin only)

5. Crear policy para audit\_logs (admin read-only)

6. Testear con diferentes roles (admin, client, anon)

**Criterios de aceptación:**

1. RLS activo en todas las tablas

2. Admin puede CRUD todo

3. Cliente solo lee sus propios datos

4. Usuario anónimo no accede a nada

5. Tests RLS passing (supabase-test-helpers)

**Estimación:** 4 horas  
**Prioridad:** P0  
**Asignación:** BE  
**Dependencias:** ANCLORA-002  
**Tags:** \#security \#rls \#auth

---

**ANCLORA-004: Inicializar Proyecto Next.js**

**Descripción:**

Crear proyecto Next.js 14 con App Router y configuración TypeScript estricta.

**Tareas específicas:**

1. Ejecutar: npx create-next-app@latest anclora-platform

2. Seleccionar: TypeScript, ESLint, Tailwind CSS, App Router, src/ directory

3. Configurar tsconfig.json con strict mode

4. Instalar dependencias core:

   1. @supabase/ssr

   2. @tanstack/react-query

   3. @tanstack/react-table

   4. shadcn/ui (setup inicial)

   5. react-hook-form \+ zod

   6. date-fns

5. Configurar ESLint rules (Airbnb preset \+ custom)

6. Configurar Prettier (.prettierrc)

7. Setup pre-commit hooks con Husky

**Criterios de aceptación:**

1. Proyecto Next.js corre en localhost:3000

2. TypeScript strict mode sin errores

3. ESLint \+ Prettier funcionando

4. Pre-commit hooks ejecutándose

**Estimación:** 3 horas  
**Prioridad:** P0  
**Asignación:** FE  
**Tags:** \#frontend \#nextjs \#setup

---

**ANCLORA-005: Configurar Supabase Client**

**Descripción:**

Crear cliente Supabase en Next.js con soporte SSR y cookies seguras.

**Tareas específicas:**

1. Crear archivo src/lib/supabase/client.ts

2. Implementar createClient() con @supabase/ssr

3. Configurar cookies httpOnly

4. Crear helper createServerClient() para Server Components

5. Crear helper createBrowserClient() para Client Components

6. Configurar middleware.ts para session refresh

7. Añadir env vars en .env.local:

   1. NEXT\_PUBLIC\_SUPABASE\_URL

   2. NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY

   3. SUPABASE\_SERVICE\_ROLE\_KEY (server-only)

**Criterios de aceptación:**

1. Cliente Supabase funcional en client y server

2. Session persistence con cookies

3. Middleware refresh automático

4. Env vars cargadas correctamente

**Estimación:** 3 horas  
**Prioridad:** P0  
**Asignación:** FS  
**Dependencias:** ANCLORA-001, ANCLORA-004  
**Tags:** \#supabase \#auth \#integration

---

**ANCLORA-006: Setup Vercel Deployment**

**Descripción:**

Conectar repositorio Git con Vercel y configurar CI/CD automático.

**Tareas específicas:**

1. Crear repositorio GitHub (anclora/platform)

2. Push código inicial

3. Conectar repositorio en Vercel dashboard

4. Configurar env vars en Vercel:

   1. NEXT\_PUBLIC\_SUPABASE\_URL

   2. NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY

   3. SUPABASE\_SERVICE\_ROLE\_KEY

5. Configurar auto-deploy en push a main

6. Configurar preview deployments en PRs

7. Verificar primer deployment exitoso

**Criterios de aceptación:**

1. Repositorio Git creado

2. Vercel deployment funcional

3. URL preview disponible (xxx.vercel.app)

4. Auto-deploy habilitado

5. HTTPS activo por defecto

**Estimación:** 2 horas  
**Prioridad:** P0  
**Asignación:** FS  
**Dependencias:** ANCLORA-004  
**Tags:** \#deployment \#vercel \#cicd

---

**2.2 Sprint 1.2 \- Autenticación (Semana 2\)**

**ANCLORA-007: Implementar Login Admin**

**Descripción:**

Crear página de login para usuarios admin con email/password y protección de rutas.

**Tareas específicas:**

1. Crear página app/login/page.tsx

2. Implementar formulario con react-hook-form:

   1. Input email (validación formato)

   2. Input password (type=password, min 8 chars)

   3. Botón "Iniciar Sesión"

   4. Link "¿Olvidaste tu contraseña?"

3. Integrar Supabase Auth:

   1. supabase.auth.signInWithPassword()

   2. Manejo de errores (credenciales incorrectas)

   3. Redirect a /dashboard tras éxito

4. Implementar rate limiting (5 intentos/min por IP)

5. Crear middleware de protección de rutas

6. Añadir loading state durante login

**Criterios de aceptación:**

1. Usuario puede hacer login con email/password

2. Errores mostrados claramente

3. Redirect a /dashboard tras login exitoso

4. Rate limiting funciona (bloquea tras 5 intentos)

5. Middleware protege rutas /dashboard/\*

**Estimación:** 5 horas  
**Prioridad:** P0  
**Asignación:** FS  
**Dependencias:** ANCLORA-005  
**Tags:** \#auth \#frontend \#supabase

---

**ANCLORA-008: Implementar Logout**

**Descripción:**

Añadir funcionalidad de logout y limpieza de sesión.

**Tareas específicas:**

1. Crear botón "Cerrar Sesión" en navbar

2. Implementar handler:

   1. supabase.auth.signOut()

   2. Limpiar session storage

   3. Redirect a /login

3. Añadir confirmation dialog (opcional)

4. Manejar logout en tab inactivo (session expired)

**Criterios de aceptación:**

1. Usuario puede hacer logout

2. Session destruida completamente

3. Redirect a /login tras logout

4. No puede acceder a rutas protegidas post-logout

**Estimación:** 2 horas  
**Prioridad:** P1  
**Asignación:** FE  
**Dependencias:** ANCLORA-007  
**Tags:** \#auth \#frontend

---

**ANCLORA-009: Implementar Magic Link para Clientes**

**Descripción:**

Crear sistema de autenticación passwordless para clientes vía magic link.

**Tareas específicas:**

1. Crear página app/portal/login/page.tsx

2. Implementar formulario simplificado:

   1. Input email único

   2. Botón "Enviar enlace de acceso"

3. Validar email existe en tabla clients antes de enviar

4. Implementar envío magic link:

   1. supabase.auth.signInWithOtp()

   2. Configurar email template en Supabase

   3. Redirect URL: /portal/client/:clientId

5. Manejar casos:

   1. Email no existe → Mensaje error

   2. Email enviado → Mensaje éxito "Revisa tu bandeja"

   3. Link expirado (1 hora) → Mensaje re-enviar

6. Configurar página callback de magic link

**Criterios de aceptación:**

1. Cliente ingresa email y recibe magic link

2. Link funciona y auto-login

3. Redirect correcto a portal personalizado

4. Link expira tras 1 hora

5. Link de un solo uso (invalidado tras click)

**Estimación:** 6 horas  
**Prioridad:** P1  
**Asignación:** FS  
**Dependencias:** ANCLORA-002, ANCLORA-005  
**Tags:** \#auth \#magiclink \#portal

---

**ANCLORA-010: Tests E2E Auth Flows**

**Descripción:**

Crear tests end-to-end con Playwright para flujos de autenticación.

**Tareas específicas:**

1. Instalar Playwright: npm init playwright@latest

2. Configurar playwright.config.ts (Chromium, Firefox)

3. Crear test: tests/auth/admin-login.spec.ts

   1. Login con credenciales correctas → Verifica redirect /dashboard

   2. Login con credenciales incorrectas → Verifica mensaje error

   3. Logout → Verifica redirect /login

4. Crear test: tests/auth/client-magic-link.spec.ts

   1. Envío magic link → Verifica mensaje éxito

   2. Email no existente → Verifica mensaje error

5. Integrar en CI/CD (GitHub Actions)

**Criterios de aceptación:**

1. Tests E2E ejecutándose localmente

2. 100% passing en flujos happy path

3. Tests corriendo en CI/CD automáticamente

4. Screenshots/videos generados en fallos

**Estimación:** 4 horas  
**Prioridad:** P1  
**Asignación:** QA  
**Dependencias:** ANCLORA-007, ANCLORA-009  
**Tags:** \#testing \#e2e \#playwright

---

**2.3 Sprint 1.3 \- Sistema de Diseño (Semana 3\)**

**ANCLORA-011: Configurar shadcn/ui**

**Descripción:**

Instalar y configurar biblioteca de componentes shadcn/ui como base del design system.

**Tareas específicas:**

1. Ejecutar: npx shadcn-ui@latest init

2. Configurar tema base:

   1. Colores: Primary (teal), Secondary (slate)

   2. Border radius: 8px

   3. Font: Inter

3. Instalar componentes base:

   1. button, input, select, checkbox, radio-group

   2. dialog, dropdown-menu, popover, toast

   3. card, badge, avatar

   4. table, form, label

4. Customizar componentes según brand:

   1. Ajustar colores en tailwind.config.ts

   2. Modificar variantes de Button

   3. Añadir animaciones smooth

**Criterios de aceptación:**

1. shadcn/ui configurado correctamente

2. Componentes base disponibles

3. Tema customizado según brand Anclora

4. Storybook opcional preparado

**Estimación:** 4 horas  
**Prioridad:** P1  
**Asignación:** FE  
**Dependencias:** ANCLORA-004  
**Tags:** \#design-system \#ui \#shadcn

---

**ANCLORA-012: Crear Componentes Layout**

**Descripción:**

Implementar componentes de layout reutilizables para toda la app.

**Tareas específicas:**

1. Crear componente Navbar:

   1. Logo Anclora (clickable → /dashboard)

   2. Search bar (placeholder)

   3. Badge alertas con contador

   4. Avatar usuario \+ dropdown

   5. Botón logout

   6. Responsive (hamburger menu mobile)

2. Crear componente Sidebar:

   1. Links navegación: Dashboard, Clientes, Proyectos, Kanban, Presupuestos, Facturas, Alertas

   2. Iconos (lucide-react)

   3. Active state (highlight link actual)

   4. Colapsable en mobile

3. Crear componente PageContainer:

   1. Max-width: 1280px

   2. Padding responsive

   3. Background neutral

4. Crear componente EmptyState:

   1. Ilustración ([undraw.co](http://undraw.co))

   2. Heading \+ descripción

   3. CTA button

**Criterios de aceptación:**

1. Navbar funcional en todas las páginas admin

2. Sidebar con navegación completa

3. Layout responsive (mobile, tablet, desktop)

4. EmptyState reutilizable con props

**Estimación:** 6 horas  
**Prioridad:** P1  
**Asignación:** FE  
**Dependencias:** ANCLORA-011  
**Tags:** \#components \#layout \#ui

---

**ANCLORA-013: Implementar Sistema de Toasts**

**Descripción:**

Configurar notificaciones toast para feedback de acciones.

**Tareas específicas:**

1. Instalar: npm install react-hot-toast

2. Configurar Toaster en app/layout.tsx

3. Crear helper toast.ts con variantes:

   1. toast.success("Mensaje")

   2. toast.error("Mensaje")

   3. toast.loading("Mensaje")

   4. toast.promise()

4. Customizar estilos (colores brand, iconos)

5. Configurar posición: top-right

6. Añadir animaciones enter/exit

**Criterios de aceptación:**

1. Toasts funcionando en toda la app

2. Variantes (success, error, loading) estilizadas

3. Auto-dismiss tras 3 segundos

4. Múltiples toasts apilados correctamente

**Estimación:** 2 horas  
**Prioridad:** P2  
**Asignación:** FE  
**Dependencias:** ANCLORA-011  
**Tags:** \#ui \#notifications \#toast

---

**ANCLORA-014: Crear Design Tokens**

**Descripción:**

Definir variables de diseño centralizadas en Tailwind y CSS.

**Tareas específicas:**

1. Configurar tailwind.config.ts con tokens:

   1. Colors: primary (teal-500), secondary (slate-600), error (red-500), success (green-500)

   2. Spacing: 4px scale (1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 48, 64\)

   3. Typography: font-sans (Inter), font-mono (JetBrains Mono)

   4. Shadows: sm, md, lg, xl

   5. Border radius: sm (4px), md (8px), lg (12px), full (9999px)

2. Crear archivo globals.css con CSS variables

3. Documentar tokens en README o Storybook

4. Crear Figma file sincronizado (opcional)

**Criterios de aceptación:**

1. Tokens accesibles vía Tailwind classes

2. Consistencia en toda la UI

3. Documentación disponible para equipo

4. Figma tokens exportados (opcional)

**Estimación:** 3 horas  
**Prioridad:** P2  
**Asignación:** FE  
**Dependencias:** ANCLORA-011  
**Tags:** \#design-system \#tokens \#tailwind

---

**ANCLORA-015: Auditoría Accesibilidad Base**

**Descripción:**

Verificar cumplimiento WCAG 2.1 AA en componentes base.

**Tareas específicas:**

1. Instalar axe DevTools extension

2. Auditar componentes shadcn/ui:

   1. Verificar labels en inputs

   2. Verificar color contrast (mínimo 4.5:1)

   3. Verificar keyboard navigation (Tab, Enter, Escape)

   4. Verificar ARIA labels en iconos

   5. Verificar focus indicators visibles

3. Corregir issues detectados

4. Documentar patrones accesibles

5. Configurar ESLint plugin: eslint-plugin-jsx-a11y

**Criterios de aceptación:**

1. 0 issues críticos de axe DevTools

2. Color contrast pasa en todos los componentes

3. Keyboard navigation funciona

4. Focus indicators visibles

5. ESLint a11y rules activas

**Estimación:** 4 horas  
**Prioridad:** P1  
**Asignación:** FE  
**Dependencias:** ANCLORA-011, ANCLORA-012  
**Tags:** \#accessibility \#wcag \#a11y

---

**3\. FASE 2: CORE MVP (4 SEMANAS)**

**3.1 Sprint 2.1 \- Gestión de Clientes (Semana 4\)**

**ANCLORA-016: Crear Página Listado Clientes**

**Descripción:**

Implementar página /clients con tabla de clientes y búsqueda/filtros.

**Tareas específicas:**

1. Crear página app/clients/page.tsx

2. Implementar tabla con @tanstack/react-table:

   1. Columnas: Avatar, Nombre empresa, Email, Idioma, \# Proyectos, Última actividad, Acciones

   2. Sortable columns (click header)

   3. Paginación: 20 items/página

   4. Botones navegación: Anterior, Siguiente

3. Implementar search input:

   1. Placeholder: "Buscar por nombre o email..."

   2. Debounce 300ms

   3. Query params en URL (compartible)

4. Implementar filtros:

   1. Dropdown idioma: Todos, ES, EN, CA

   2. Dropdown ordenar: Fecha creación, Última actividad, Nombre A-Z

5. Añadir botón "+ Nuevo Cliente" (top-right)

6. Implementar EmptyState si no hay clientes

**Criterios de aceptación:**

1. Tabla muestra todos los clientes paginados

2. Búsqueda funciona con debounce

3. Filtros actualizan tabla en vivo

4. Query params en URL mantienen estado

5. EmptyState visible cuando tabla vacía

**Estimación:** 6 horas  
**Prioridad:** P0  
**Asignación:** FE  
**Dependencias:** ANCLORA-002, ANCLORA-012  
**Tags:** \#clients \#crud \#frontend

---

**ANCLORA-017: Crear Modal Formulario Cliente**

**Descripción:**

Implementar modal para crear/editar clientes con validaciones completas.

**Tareas específicas:**

1. Crear componente ClientFormModal.tsx

2. Implementar formulario con react-hook-form \+ zod:

   1. company\_name (required, max 100 chars)

   2. email (required, format validation, unique check)

   3. contact\_person (optional, max 100 chars)

   4. phone (optional, E.164 format)

   5. address (optional, textarea, max 500 chars)

   6. nif\_cif (optional, regex español)

   7. preferred\_language (radio: ES/EN/CA)

   8. notes (optional, textarea, placeholder "Notas internas")

3. Añadir validaciones:

   1. Email único (query DB antes de submit)

   2. NIF/CIF formato válido si proporcionado

   3. Phone formato E.164 si proporcionado

4. Implementar loading state durante submit

5. Implementar error handling (toast en error)

6. Modal responsive (full-screen en mobile)

**Criterios de aceptación:**

1. Modal abre/cierra correctamente

2. Validaciones client-side funcionan

3. Email único verificado antes de guardar

4. Errores mostrados en toast

5. Loading state visible durante submit

**Estimación:** 5 horas  
**Prioridad:** P0  
**Asignación:** FE  
**Dependencias:** ANCLORA-011, ANCLORA-013  
**Tags:** \#clients \#forms \#validation

---

**ANCLORA-018: Implementar CRUD Backend Clientes**

**Descripción:**

Crear Server Actions o API routes para operaciones CRUD de clientes.

**Tareas específicas:**

1. Crear archivo app/actions/clients.ts con Server Actions:

   1. createClient(data)

   2. updateClient(id, data)

   3. deleteClient(id)

   4. getClients(filters, pagination)

   5. getClientById(id)

2. Implementar validaciones server-side (zod schemas)

3. Implementar query getClients con:

   1. Búsqueda por nombre/email (ILIKE)

   2. Filtro por idioma

   3. Ordenar por columna \+ dirección

   4. Paginación (offset, limit)

   5. Count total para paginación

4. Implementar deleteClient con validación:

   1. Contar proyectos activos

   2. Si \>0 → Error "Cliente tiene proyectos activos"

   3. Si 0 → DELETE CASCADE

5. Añadir error handling robusto

**Criterios de aceptación:**

1. Todas las Server Actions funcionan

2. Validaciones server-side activas

3. Búsqueda y filtros retornan datos correctos

4. Delete bloqueado si tiene proyectos activos

5. Errores manejados y retornados claramente

**Estimación:** 5 horas  
**Prioridad:** P0  
**Asignación:** BE  
**Dependencias:** ANCLORA-002, ANCLORA-003  
**Tags:** \#backend \#crud \#server-actions

---

**ANCLORA-019: Integrar Formulario con Backend**

**Descripción:**

Conectar modal cliente con Server Actions y manejar flujo completo.

**Tareas específicas:**

1. Implementar onSubmit en ClientFormModal:

   1. Llamar createClient() o updateClient()

   2. Mostrar toast.loading durante proceso

   3. Si success → toast.success \+ cerrar modal \+ refrescar tabla

   4. Si error → toast.error con mensaje

2. Implementar edit flow:

   1. Botón "Editar" en fila tabla

   2. Abrir modal pre-rellenado con datos cliente

   3. Submit actualiza registro

3. Implementar delete flow:

   1. Botón "Eliminar" en fila tabla

   2. Confirmation dialog: "¿Eliminar cliente X?"

   3. Si confirmado → deleteClient()

   4. Si tiene proyectos → Mensaje error específico

4. Implementar revalidación tabla tras cambios

**Criterios de aceptación:**

1. Create funciona end-to-end

2. Update funciona con datos pre-rellenados

3. Delete bloqueado si proyectos activos

4. Tabla se actualiza tras cada acción

5. Toasts informativos en cada acción

**Estimación:** 4 horas  
**Prioridad:** P0  
**Asignación:** FS  
**Dependencias:** ANCLORA-017, ANCLORA-018  
**Tags:** \#integration \#crud \#frontend

---

**ANCLORA-020: Tests Unitarios CRUD Clientes**

**Descripción:**

Crear tests unitarios para Server Actions de clientes.

**Tareas específicas:**

1. Configurar Vitest: npm install \-D vitest @vitest/ui

2. Crear tests/actions/clients.test.ts

3. Mockear Supabase client

4. Tests para createClient:

   1. Success case

   2. Email duplicado (error)

   3. Validación NIF inválido

5. Tests para updateClient:

   1. Success case

   2. Cliente no existe (error)

6. Tests para deleteClient:

   1. Success case

   2. Cliente con proyectos activos (bloqueado)

7. Configurar coverage report (\>80%)

**Criterios de aceptación:**

1. Tests unitarios ejecutándose

2. Coverage \>80% en clients actions

3. Happy paths y error cases cubiertos

4. Tests en CI/CD pipeline

**Estimación:** 4 horas  
**Prioridad:** P1  
**Asignación:** QA  
**Dependencias:** ANCLORA-018  
**Tags:** \#testing \#unit-tests \#vitest

---

**3.2 Sprint 2.2 \- Proyectos Base (Semana 5\)**

**ANCLORA-021: Crear Formulario Proyecto**

**Descripción:**

Implementar formulario full-page para crear/editar proyectos.

**Tareas específicas:**

1. Crear página app/projects/new/page.tsx

2. Implementar formulario con campos:

   1. project\_name (text, required, max 150 chars)

   2. client\_id (dropdown con search react-select, required)

   3. description (rich text editor Tiptap, optional, max 2000 chars)

   4. status (dropdown, required, default: 'backlog')

   5. budget (number, currency EUR, optional)

   6. deadline (date picker react-day-picker, optional)

   7. priority (dropdown: low/medium/high/urgent, default: medium)

3. Implementar validaciones:

   1. Deadline debe ser futura

   2. Budget \>0 si proporcionado

4. Añadir auto-save draft cada 30s (localStorage)

5. Implementar botones:

   1. "Guardar borrador" (status='backlog')

   2. "Guardar y crear presupuesto" (redirect a /quotes/new)

   3. "Cancelar" (volver a /projects con confirmación)

**Criterios de aceptación:**

1. Formulario renderiza todos los campos

2. Dropdown cliente carga datos de DB

3. Rich text editor funciona

4. Date picker funciona

5. Validaciones activas

6. Auto-save draft funciona

**Estimación:** 7 horas  
**Prioridad:** P0  
**Asignación:** FE  
**Dependencias:** ANCLORA-011, ANCLORA-018  
**Tags:** \#projects \#forms \#frontend

---

**ANCLORA-022: Implementar Server Actions Proyectos**

**Descripción:**

Crear operaciones backend para CRUD de proyectos.

**Tareas específicas:**

1. Crear app/actions/projects.ts con:

   1. createProject(data)

   2. updateProject(id, data)

   3. deleteProject(id) o archiveProject(id)

   4. getProjects(filters)

   5. getProjectById(id)

2. Implementar validaciones:

   1. Deadline futura

   2. client\_id existe en DB

   3. Status válido (enum)

3. Implementar matriz de transiciones:

   1. Validar transición status permitida

   2. Si inválida → Error descriptivo

4. Implementar updated\_at \= NOW() en updates

5. Trigger audit\_logs automático (via DB trigger)

**Criterios de aceptación:**

1. CRUD proyectos funcional

2. Validaciones server-side activas

3. Transiciones estado validadas

4. Audit trail funcionando

5. Errores descriptivos

**Estimación:** 5 horas  
**Prioridad:** P0  
**Asignación:** BE  
**Dependencias:** ANCLORA-002  
**Tags:** \#backend \#projects \#crud

---

**ANCLORA-023: Integrar Formulario Proyecto**

**Descripción:**

Conectar formulario con backend y manejar flujo completo.

**Tareas específicas:**

1. Implementar onSubmit:

   1. Llamar createProject() o updateProject()

   2. Loading state durante submit

   3. Success → toast \+ redirect

   4. Error → toast \+ mantener formulario

2. Implementar edit mode:

   1. Página app/projects/\[id\]/edit/page.tsx

   2. Pre-cargar datos proyecto

   3. Submit actualiza proyecto

3. Implementar recuperación draft desde localStorage

4. Limpiar draft tras submit exitoso

**Criterios de aceptación:**

1. Create proyecto funciona end-to-end

2. Update proyecto funciona

3. Draft recovery funciona

4. Redirects correctos tras acciones

5. Loading states visibles

**Estimación:** 4 horas  
**Prioridad:** P0  
**Asignación:** FS  
**Dependencias:** ANCLORA-021, ANCLORA-022  
**Tags:** \#integration \#projects \#frontend

---

**ANCLORA-024: Crear Tabla Audit Logs UI**

**Descripción:**

Implementar componente para visualizar timeline de cambios en proyecto.

**Tareas específicas:**

1. Crear componente AuditTimeline.tsx

2. Implementar query:

   1. SELECT \* FROM audit\_logs WHERE record\_id \= project\_id

   2. ORDER BY changed\_at DESC

   3. JOIN con auth.users para nombre usuario

3. Renderizar timeline vertical:

   1. Icono por tipo acción (📝 update, ✅ created, ❌ deleted)

   2. Mensaje: "Usuario X actualizó campo Y"

   3. Timestamp relativo: "hace 2 horas"

   4. Diff old\_data → new\_data (mostrar cambios)

4. Integrar en modal detalles proyecto (tab "Historial")

5. Implementar paginación (cargar más)

**Criterios de aceptación:**

1. Timeline muestra todos los cambios

2. Mensajes descriptivos por acción

3. Diff visible (resaltar cambios)

4. Timeline actualiza en tiempo real

5. Performance buena (virtualización si \>100 items)

**Estimación:** 5 horas  
**Prioridad:** P2  
**Asignación:** FE  
**Dependencias:** ANCLORA-002, ANCLORA-022  
**Tags:** \#audit \#timeline \#ui

---

**3.3 Sprint 2.3 \- Kanban Board (Semana 6\)**

**ANCLORA-025: Configurar @hello-pangea/dnd**

**Descripción:**

Instalar y configurar librería drag & drop para Kanban.

**Tareas específicas:**

1. Instalar: npm install @hello-pangea/dnd

2. Leer documentación: [https://github.com/hello-pangea/dnd](https://github.com/hello-pangea/dnd)

3. Configurar DragDropContext en página Kanban

4. Crear componente KanbanColumn.tsx (Droppable)

5. Crear componente ProjectCard.tsx (Draggable)

6. Implementar ejemplo básico (3 columnas mock)

7. Testear drag horizontal entre columnas

**Criterios de aceptación:**

1. Librería instalada correctamente

2. Ejemplo básico drag & drop funciona

3. Animaciones smooth

4. Touch support (mobile)

**Estimación:** 3 horas  
**Prioridad:** P0  
**Asignación:** FE  
**Dependencias:** ANCLORA-011  
**Tags:** \#kanban \#drag-drop \#setup

---

**ANCLORA-026: Crear Layout Kanban**

**Descripción:**

Implementar estructura visual del Kanban con 7 columnas.

**Tareas específicas:**

1. Crear página app/kanban/page.tsx

2. Implementar layout horizontal:

   1. 7 columnas: Backlog, Propuesta, Aprobado, En Progreso, Testing, Completado, Cancelado

   2. Scroll horizontal (overflow-x-auto)

   3. Min-width por columna: 300px

   4. Gap entre columnas: 16px

3. Crear componente KanbanColumn:

   1. Header: Título columna \+ badge contador

   2. Body: Lista de tarjetas (vertical scroll)

   3. Color-coded header por estado

4. Implementar responsive:

   1. Desktop: Todas columnas visibles

   2. Tablet: Scroll horizontal

   3. Mobile: Scroll horizontal \+ columnas más estrechas (250px)

**Criterios de aceptación:**

1. Layout 7 columnas renderiza

2. Scroll horizontal funciona

3. Headers color-coded por estado

4. Responsive en 3 breakpoints

**Estimación:** 4 horas  
**Prioridad:** P0  
**Asignación:** FE  
**Dependencias:** ANCLORA-025  
**Tags:** \#kanban \#layout \#ui

---

**ANCLORA-027: Crear Componente Tarjeta Proyecto**

**Descripción:**

Implementar tarjeta de proyecto con toda la información relevante.

**Tareas específicas:**

1. Crear componente ProjectCard.tsx con estructura:

   1. Header:

      1. Badge prioridad (color: 🔴 urgent, 🟠 high, 🟡 medium, 🟢 low)

      2. project\_name (truncate si \>50 chars, tooltip completo)

   2. Body:

      1. Cliente: company\_name (con avatar iniciales)

      2. Deadline: formato "15 Feb 2026" (rojo si \<7 días)

      3. Budget: "15.000€ / 20.000€" (progress bar visual)

      4. Progress bar (width según % completado)

   3. Footer:

      1. Iconos alertas si hay (🔔 badge contador)

      2. Botón "Ver detalles" (icono eye)

2. Añadir hover state (elevate shadow)

3. Añadir click handler (abrir modal detalles)

4. Implementar draggable styles (opacity durante drag)

**Criterios de aceptación:**

1. Tarjeta muestra toda la info

2. Deadline en rojo si \<7 días

3. Progress bar visual correcto

4. Hover/click states funcionan

5. Draggable con feedback visual

**Estimación:** 5 horas  
**Prioridad:** P0  
**Asignación:** FE  
**Dependencias:** ANCLORA-025, ANCLORA-011  
**Tags:** \#kanban \#card \#ui

---

**ANCLORA-028: Implementar Drag & Drop Logic**

**Descripción:**

Conectar drag & drop con actualización de DB.

**Tareas específicas:**

1. Implementar onDragEnd handler:

   1. Extraer source y destination

   2. Si no hay destination → abort

   3. Si destination \= source → abort

   4. Determinar nuevo status según destination.droppableId

2. Validar transición status:

   1. Consultar matriz transiciones permitidas

   2. Si inválida → toast.error \+ revert UI

3. Optimistic update:

   1. Actualizar estado local inmediatamente

   2. Llamar updateProject(id, {status: newStatus})

   3. Si error → revertir \+ toast.error

   4. Si success → mantener \+ toast.success (opcional)

4. Actualizar timestamp updated\_at

5. Registrar cambio en audit\_logs (automático via trigger)

**Criterios de aceptación:**

1. Drag & drop actualiza DB

2. Optimistic updates funcionan

3. Transiciones inválidas bloqueadas

4. Errores revierten cambio visual

5. Updated\_at actualiza correctamente

**Estimación:** 5 horas  
**Prioridad:** P0  
**Asignación:** FS  
**Dependencias:** ANCLORA-025, ANCLORA-027, ANCLORA-022  
**Tags:** \#kanban \#drag-drop \#integration

---

**ANCLORA-029: Cargar Proyectos en Kanban**

**Descripción:**

Implementar query para cargar proyectos y distribuirlos en columnas.

**Tareas específicas:**

1. Crear Server Action getProjectsKanban():

   1. SELECT \* FROM projects WHERE archived \= false

   2. JOIN con clients para obtener company\_name

   3. ORDER BY priority DESC, deadline ASC

2. Implementar lógica agrupación:

   1. Group projects por status

   2. Retornar objeto: {backlog: \[\], proposal: \[\], ...}

3. Integrar en página Kanban:

   1. Fetch en Server Component o useEffect

   2. Distribuir proyectos en columnas correspondientes

   3. Mostrar EmptyState si columna vacía

4. Implementar loading state (skeletons)

5. Añadir error handling (retry button)

**Criterios de aceptación:**

1. Proyectos cargan correctamente

2. Distribuidos en columnas según status

3. Loading skeletons visibles

4. Empty states en columnas vacías

5. Error handling robusto

**Estimación:** 4 horas  
**Prioridad:** P0  
**Asignación:** FS  
**Dependencias:** ANCLORA-022, ANCLORA-026  
**Tags:** \#kanban \#data-fetching \#backend

---

**3.4 Sprint 2.4 \- Real-time Sync (Semana 7\)**

**ANCLORA-030: Configurar Supabase Realtime**

**Descripción:**

Habilitar Realtime en tabla projects y configurar subscriptions.

**Tareas específicas:**

1. Habilitar Realtime en Supabase dashboard:

   1. Ir a Database → Publications

   2. Agregar tabla projects a supabase\_realtime publication

2. Crear hook useRealtimeProjects:

   1. supabase.channel('projects')

   2. .on('postgres\_changes', {event: '\*', schema: 'public', table: 'projects'})

   3. Callback actualiza estado React

3. Implementar reconciliación:

   1. On INSERT → Añadir a columna correspondiente

   2. On UPDATE → Mover entre columnas si status cambió

   3. On DELETE → Remover de columna

4. Añadir cleanup al desmontar componente

**Criterios de aceptación:**

1. Realtime habilitado en tabla projects

2. Hook subscribes correctamente

3. Cambios de otros usuarios visibles \<1s

4. Cleanup previene memory leaks

**Estimación:** 4 horas  
**Prioridad:** P1  
**Asignación:** FS  
**Dependencias:** ANCLORA-002, ANCLORA-029  
**Tags:** \#realtime \#supabase \#integration

---

**ANCLORA-031: Implementar Optimistic Updates**

**Descripción:**

Mejorar UX con updates optimistas y reconciliación.

**Tareas específicas:**

1. Modificar onDragEnd para optimistic update:

   1. Actualizar estado local inmediatamente

   2. Mostrar proyecto en nueva columna

   3. Llamar API en background

2. Implementar rollback en error:

   1. Si API falla → revertir posición

   2. Mostrar toast.error

   3. Animar regreso a columna original

3. Implementar reconciliación con Realtime:

   1. Si update viene de Realtime → verificar contra estado local

   2. Si coincide → ignore (ya aplicado)

   3. Si difiere → aplicar cambio \+ toast info

4. Añadir timestamps para deduplicación

**Criterios de aceptación:**

1. Updates optimistas instantáneos (\<50ms)

2. Rollback funciona en errores

3. Reconciliación previene duplicados

4. UX smooth sin flickers

**Estimación:** 5 horas  
**Prioridad:** P1  
**Asignación:** FS  
**Dependencias:** ANCLORA-028, ANCLORA-030  
**Tags:** \#optimistic-updates \#ux \#frontend

---

**ANCLORA-032: Añadir Notificaciones Realtime**

**Descripción:**

Mostrar toasts cuando otros usuarios hacen cambios.

**Tareas específicas:**

1. Modificar callback Realtime para incluir metadata:

   1. Extraer changed\_by de audit\_logs

   2. Obtener nombre usuario

   3. Determinar tipo de cambio (moved, created, deleted)

2. Implementar toasts informativos:

   1. "Usuario X movió Proyecto Y a Estado Z"

   2. Icono por tipo (📦 moved, ✅ created, ❌ deleted)

   3. Auto-dismiss 3 segundos

   4. No mostrar toast si cambio propio

3. Añadir sonido opcional (sutil)

4. Implementar setting para deshabilitar notificaciones

**Criterios de aceptación:**

1. Toasts aparecen en cambios de otros usuarios

2. Mensajes descriptivos con nombres

3. No aparece toast en cambios propios

4. Setting deshabilitar funciona

**Estimación:** 3 horas  
**Prioridad:** P2  
**Asignación:** FE  
**Dependencias:** ANCLORA-030, ANCLORA-013  
**Tags:** \#realtime \#notifications \#ux

---

**ANCLORA-033: Tests E2E Kanban**

**Descripción:**

Crear tests end-to-end para Kanban con drag & drop.

**Tareas específicas:**

1. Crear test: tests/kanban/drag-drop.spec.ts

2. Implementar test cases:

   1. Load Kanban → Verifica 7 columnas

   2. Drag proyecto de Backlog → Propuesta → Verifica DB update

   3. Transición inválida → Verifica error toast

   4. Múltiples usuarios (2 tabs) → Verifica sync

3. Mockear Realtime events en tests

4. Capturar screenshots en fallos

**Criterios de aceptación:**

1. Tests E2E Kanban passing

2. Drag & drop validado end-to-end

3. Sync multi-usuario verificado

4. Tests en CI/CD

**Estimación:** 5 horas  
**Prioridad:** P1  
**Asignación:** QA  
**Dependencias:** ANCLORA-028, ANCLORA-030  
**Tags:** \#testing \#e2e \#kanban

---

**4\. FASE 3: INTELIGENCIA ARTIFICIAL (2 SEMANAS)**

**4.1 Sprint 3.1 \- Generación de Presupuestos con IA (Semana 8\)**

**ANCLORA-034: Configurar OpenAI API**

**Descripción:**

Configurar integración con OpenAI API para generación de contenido con IA.

**Tareas específicas:**

1. Configurar API key en variables de entorno (OPENAI_API_KEY)

2. Crear cliente OpenAI en src/lib/openai/client.ts

3. Implementar manejo de errores y rate limiting

4. Crear función base para completions con streaming

5. Configurar modelo: gpt-4-turbo-preview

**Criterios de aceptación:**

1. Cliente OpenAI funcional

2. API key segura (no expuesta en cliente)

3. Rate limiting implementado

4. Errores manejados correctamente

**Estimación:** 3 horas
**Prioridad:** P0
**Asignación:** BE
**Estado:** ✅ DONE
**Tags:** \#ai \#openai \#setup

---

**ANCLORA-035: Crear Wizard de Presupuestos**

**Descripción:**

Implementar wizard multi-paso para generación de presupuestos asistida por IA.

**Tareas específicas:**

1. Crear página app/quotes/new/page.tsx

2. Implementar wizard 3 pasos:

   1. Paso 1: Selección proyecto y servicios

   2. Paso 2: Configuración IA (idioma, tono, profundidad técnica)

   3. Paso 3: Revisión y guardado

3. Crear componente QuoteWizard.tsx con:

   1. Progress indicator visual

   2. Navegación anterior/siguiente

   3. Validaciones por paso

4. Implementar selección de servicios predefinidos:

   1. Consultoría IA, Desarrollo Custom, Integración APIs

   2. Formación, Mantenimiento, Auditoría Técnica

5. Configurar horas estimadas por servicio

**Criterios de aceptación:**

1. Wizard 3 pasos funcional

2. Progress indicator muestra paso actual

3. Navegación entre pasos funciona

4. Servicios predefinidos disponibles

5. Validaciones activas por paso

**Estimación:** 6 horas
**Prioridad:** P0
**Asignación:** FE
**Dependencias:** ANCLORA-034
**Estado:** ✅ DONE
**Tags:** \#quotes \#wizard \#frontend

---

**ANCLORA-036: Implementar Generación IA de Presupuestos**

**Descripción:**

Crear Server Action para generar contenido de presupuesto usando OpenAI.

**Tareas específicas:**

1. Crear Server Action generateQuoteWithAI() en app/actions/quotes.ts

2. Construir prompt estructurado con:

   1. Contexto del proyecto y cliente

   2. Servicios seleccionados con horas

   3. Idioma destino (ES/EN/CA)

   4. Tono (profesional/amigable/técnico/ejecutivo)

   5. Profundidad técnica (1-10)

   6. Instrucciones personalizadas

3. Parsear respuesta JSON de OpenAI:

   1. introduction: texto introductorio

   2. services: array con descripción detallada por servicio

   3. payment_terms: términos de pago

   4. validity: validez del presupuesto

   5. subtotal, iva, total calculados

4. Validar y sanitizar respuesta

5. Implementar retry en errores transitorios

**Criterios de aceptación:**

1. Generación IA funcional

2. Respuesta estructurada correctamente

3. Cálculos económicos correctos

4. Idioma respetado según configuración

5. Tono ajustado correctamente

**Estimación:** 8 horas
**Prioridad:** P0
**Asignación:** BE
**Dependencias:** ANCLORA-034
**Estado:** ✅ DONE
**Tags:** \#ai \#quotes \#backend

---

**ANCLORA-037: CRUD Presupuestos**

**Descripción:**

Implementar operaciones completas de gestión de presupuestos.

**Tareas específicas:**

1. Crear Server Actions en app/actions/quotes.ts:

   1. createQuote(data)

   2. updateQuote(id, data)

   3. deleteQuote(id)

   4. getQuotes(filters)

   5. getQuoteById(id)

2. Implementar versionado automático:

   1. Trigger set_quote_version() incrementa versión

   2. Mantener histórico de versiones

3. Implementar estados: draft, sent, approved, rejected

4. Crear página listado presupuestos con tabla

5. Crear página detalle presupuesto

**Criterios de aceptación:**

1. CRUD completo funcional

2. Versionado automático

3. Estados gestionados correctamente

4. Listado con filtros y búsqueda

5. Vista detalle completa

**Estimación:** 6 horas
**Prioridad:** P0
**Asignación:** FS
**Dependencias:** ANCLORA-035, ANCLORA-036
**Estado:** ✅ DONE
**Tags:** \#quotes \#crud \#backend

---

**4.2 Sprint 3.2 \- PDF y Envío (Semana 9\)**

**ANCLORA-038: Generación PDF Presupuestos**

**Descripción:**

Implementar generación de PDF profesional para presupuestos.

**Tareas específicas:**

1. Instalar @react-pdf/renderer

2. Crear plantilla PDF en src/lib/pdf/quote-template.tsx:

   1. Header con logo y datos empresa

   2. Datos cliente

   3. Tabla servicios con precios

   4. Totales (subtotal, IVA, total)

   5. Términos y condiciones

   6. Footer con datos contacto

3. Crear API route app/api/pdf/quote/[id]/route.ts

4. Implementar descarga PDF

5. Aplicar estilos corporativos (colores Anclora)

**Criterios de aceptación:**

1. PDF genera correctamente

2. Diseño profesional y corporativo

3. Todos los datos visibles

4. Descarga funciona

5. Tamaño archivo optimizado

**Estimación:** 5 horas
**Prioridad:** P0
**Asignación:** FE
**Dependencias:** ANCLORA-037
**Estado:** ✅ DONE
**Tags:** \#pdf \#quotes \#frontend

---

**5\. FASE 4: FACTURACIÓN (2 SEMANAS)**

**5.1 Sprint 4.1 \- CRUD Facturas (Semana 10\)**

**ANCLORA-039: Crear Sistema de Facturas**

**Descripción:**

Implementar CRUD completo para gestión de facturas.

**Tareas específicas:**

1. Crear Server Actions en app/actions/invoices.ts:

   1. createInvoice(data)

   2. updateInvoice(id, data)

   3. deleteInvoice(id)

   4. getInvoices(filters)

   5. getInvoiceById(id)

   6. updateInvoiceStatus(id, status)

2. Implementar numeración automática:

   1. Trigger generate_invoice_number()

   2. Formato: YYYY-NNNN (ej: 2026-0001)

3. Implementar estados: draft, sent, paid, overdue, cancelled

4. Calcular automáticamente: subtotal, IVA, total

5. Gestionar fecha vencimiento

**Criterios de aceptación:**

1. CRUD facturas funcional

2. Numeración automática secuencial

3. Estados gestionados correctamente

4. Cálculos automáticos correctos

5. Vencimiento calculado

**Estimación:** 6 horas
**Prioridad:** P0
**Asignación:** BE
**Estado:** ✅ DONE
**Tags:** \#invoices \#crud \#backend

---

**ANCLORA-040: UI Listado y Detalle Facturas**

**Descripción:**

Crear interfaces para gestión de facturas.

**Tareas específicas:**

1. Crear página app/invoices/page.tsx con:

   1. Tabla facturas con columnas: número, cliente, proyecto, estado, total, vencimiento

   2. Búsqueda por número/cliente

   3. Filtro por estado

   4. Acciones: ver, descargar PDF, cambiar estado

2. Crear página app/invoices/[id]/page.tsx con:

   1. Datos completos factura

   2. Líneas detalladas

   3. Historial estados

   4. Botones acción según estado

3. Crear página app/invoices/new/page.tsx:

   1. Formulario creación desde proyecto/presupuesto

   2. Selección líneas a facturar

   3. Previsualización totales

**Criterios de aceptación:**

1. Listado con filtros funcional

2. Detalle muestra toda la información

3. Formulario creación completo

4. Estados visuales diferenciados (badges colores)

5. Responsive en móvil

**Estimación:** 7 horas
**Prioridad:** P0
**Asignación:** FE
**Dependencias:** ANCLORA-039
**Estado:** ✅ DONE
**Tags:** \#invoices \#ui \#frontend

---

**ANCLORA-041: Generación PDF Facturas**

**Descripción:**

Implementar generación de PDF profesional para facturas.

**Tareas específicas:**

1. Crear plantilla PDF en src/lib/pdf/invoice-template.tsx:

   1. Header con logo y datos empresa

   2. Número factura y fechas

   3. Datos fiscales emisor y receptor

   4. Tabla líneas con descripciones y precios

   5. Desglose IVA

   6. Totales

   7. Datos bancarios para pago

   8. Footer legal

2. Crear API route app/api/pdf/invoice/[id]/route.ts

3. Implementar descarga PDF

4. Usar fuente Helvetica (built-in) para compatibilidad

**Criterios de aceptación:**

1. PDF genera correctamente

2. Cumple requisitos legales facturación

3. Datos fiscales completos

4. Descarga funciona

5. Compatible con todos los navegadores

**Estimación:** 5 horas
**Prioridad:** P0
**Asignación:** FE
**Dependencias:** ANCLORA-039
**Estado:** ✅ DONE
**Tags:** \#pdf \#invoices \#frontend

---

**5.2 Sprint 4.2 \- Verifactu (Semana 11\)**

**ANCLORA-042: Integración Verifactu**

**Descripción:**

Implementar integración con sistema Verifactu de la AEAT para facturación electrónica.

**Tareas específicas:**

1. Crear módulo src/lib/verifactu/index.ts con:

   1. generateVerifactuHash(): hash SHA-256 encadenado

   2. generateVerifactuCSV(): código seguro verificación

   3. generateVerifactuQR(): código QR escaneable

   4. generateVerifactuUrl(): URL verificación AEAT

   5. transformInvoiceToVerifactu(): payload API

2. Crear Server Actions en app/actions/verifactu.ts:

   1. registerInVerifactu(invoiceId)

   2. retryVerifactuRegistration(invoiceId)

   3. getVerifactuConfig()

3. Añadir campos en tabla invoices:

   1. verifactu_status: not_registered, pending, registered, error

   2. verifactu_id, verifactu_hash, verifactu_csv

   3. verifactu_qr, verifactu_url

   4. verifactu_registered_at, verifactu_error_message

4. Crear UI para gestión Verifactu:

   1. Badge estado Verifactu en listado

   2. Botón registrar en Verifactu

   3. Modal QR/CSV para facturas registradas

**Criterios de aceptación:**

1. Generación hash encadenado funcional

2. QR escaneable con URL válida

3. Registro en Verifactu (simulado/real)

4. Estados Verifactu gestionados

5. UI muestra información Verifactu

**Estimación:** 10 horas
**Prioridad:** P0
**Asignación:** FS
**Dependencias:** ANCLORA-039
**Estado:** ✅ DONE
**Tags:** \#verifactu \#compliance \#integration

---

**ANCLORA-043: Configuración Verifactu**

**Descripción:**

Crear página de configuración para parámetros Verifactu.

**Tareas específicas:**

1. Crear página app/settings/verifactu/page.tsx con formulario:

   1. NIF emisor

   2. Nombre/razón social emisor

   3. Entorno: sandbox/production

   4. Toggle habilitado/deshabilitado

   5. Software ID y versión

2. Crear Server Actions para guardar configuración

3. Almacenar en tabla verifactu_config o settings

4. Validar NIF formato español

**Criterios de aceptación:**

1. Formulario configuración completo

2. Validación NIF funciona

3. Configuración persiste

4. Toggle entorno funciona

**Estimación:** 4 horas
**Prioridad:** P1
**Asignación:** FS
**Estado:** ✅ DONE
**Tags:** \#verifactu \#settings \#frontend

---

**6\. FASE 5: PORTAL CLIENTE (1.5 SEMANAS)**

**6.1 Sprint 5.1 \- Portal Base (Semana 12\)**

**ANCLORA-044: Crear Layout Portal Cliente**

**Descripción:**

Implementar layout específico para portal de clientes.

**Tareas específicas:**

1. Crear layout app/(portal)/layout.tsx diferenciado:

   1. Header simplificado con logo

   2. Sin sidebar (navegación mínima)

   3. Footer con contacto

2. Aplicar estilos corporativos

3. Responsive para móvil (clientes acceden desde cualquier dispositivo)

4. Implementar protección rutas portal

**Criterios de aceptación:**

1. Layout portal diferenciado de admin

2. Responsive completo

3. Rutas protegidas por auth

4. Diseño limpio y profesional

**Estimación:** 4 horas
**Prioridad:** P0
**Asignación:** FE
**Estado:** ✅ DONE
**Tags:** \#portal \#layout \#frontend

---

**ANCLORA-045: Vista Presupuestos Cliente**

**Descripción:**

Crear vista para que clientes vean sus presupuestos.

**Tareas específicas:**

1. Crear página app/portal/client/[clientId]/quotes/page.tsx

2. Mostrar listado presupuestos del cliente:

   1. Proyecto asociado

   2. Versión

   3. Estado

   4. Total

   5. Fecha

3. Implementar vista detalle presupuesto

4. Botón descargar PDF

5. Botones aprobar/rechazar (si estado = sent)

**Criterios de aceptación:**

1. Cliente ve solo sus presupuestos

2. Puede descargar PDF

3. Puede aprobar/rechazar

4. UI clara y simple

**Estimación:** 5 horas
**Prioridad:** P0
**Asignación:** FE
**Dependencias:** ANCLORA-044
**Estado:** ✅ DONE
**Tags:** \#portal \#quotes \#frontend

---

**ANCLORA-046: Vista Facturas Cliente**

**Descripción:**

Crear vista para que clientes vean sus facturas.

**Tareas específicas:**

1. Crear página app/portal/client/[clientId]/invoices/page.tsx

2. Mostrar listado facturas del cliente:

   1. Número factura

   2. Proyecto

   3. Estado (pagada/pendiente/vencida)

   4. Total

   5. Fecha vencimiento

3. Implementar vista detalle factura

4. Botón descargar PDF

5. Destacar facturas vencidas

**Criterios de aceptación:**

1. Cliente ve solo sus facturas

2. Puede descargar PDF

3. Facturas vencidas destacadas visualmente

4. UI clara y simple

**Estimación:** 4 horas
**Prioridad:** P0
**Asignación:** FE
**Dependencias:** ANCLORA-044
**Estado:** ✅ DONE
**Tags:** \#portal \#invoices \#frontend

---

**ANCLORA-047: Flujo Aprobación Presupuestos**

**Descripción:**

Implementar flujo completo de aprobación/rechazo de presupuestos por cliente.

**Tareas específicas:**

1. Crear Server Actions:

   1. approveQuote(quoteId, clientId)

   2. rejectQuote(quoteId, clientId, reason)

2. Implementar UI en portal:

   1. Botón "Aprobar presupuesto"

   2. Botón "Rechazar" con campo motivo

   3. Confirmación antes de acción

3. Enviar notificación a admin tras acción

4. Registrar en audit_logs

5. Actualizar estado proyecto si procede

**Criterios de aceptación:**

1. Cliente puede aprobar presupuesto

2. Cliente puede rechazar con motivo

3. Admin recibe notificación

4. Audit trail registrado

5. Estado proyecto actualizado

**Estimación:** 5 horas
**Prioridad:** P1
**Asignación:** FS
**Estado:** ✅ DONE
**Tags:** \#portal \#approval \#workflow

---

**7\. FASE 6: SISTEMA DE ALERTAS (1 SEMANA)**

**7.1 Sprint 6.1 \- Alertas (Semana 13\)**

**ANCLORA-048: Crear Sistema de Alertas**

**Descripción:**

Implementar sistema de alertas para eventos importantes.

**Tareas específicas:**

1. Crear tabla alerts con campos:

   1. alert_id, type, title, message

   2. related_entity_type, related_entity_id

   3. priority, status (unread/read/dismissed)

   4. created_at, read_at

2. Crear Server Actions en app/actions/alerts.ts:

   1. createAlert(data)

   2. getAlerts(filters)

   3. markAsRead(alertId)

   4. dismissAlert(alertId)

3. Implementar tipos de alerta:

   1. deadline_approaching: proyecto cerca de deadline

   2. invoice_overdue: factura vencida

   3. quote_approved: presupuesto aprobado por cliente

   4. quote_rejected: presupuesto rechazado

   5. payment_received: pago registrado

**Criterios de aceptación:**

1. CRUD alertas funcional

2. Tipos de alerta diferenciados

3. Estados gestionados

4. Filtrado por tipo/estado

**Estimación:** 5 horas
**Prioridad:** P1
**Asignación:** BE
**Estado:** ✅ DONE
**Tags:** \#alerts \#backend \#notifications

---

**ANCLORA-049: UI Alertas**

**Descripción:**

Crear interfaz para visualización y gestión de alertas.

**Tareas específicas:**

1. Crear componente AlertBadge en navbar:

   1. Icono campana con contador

   2. Dropdown con últimas alertas

   3. Link "Ver todas"

2. Crear página app/alerts/page.tsx:

   1. Listado completo alertas

   2. Filtros por tipo y estado

   3. Acciones: marcar leída, descartar

   4. Link a entidad relacionada

3. Implementar iconos por tipo de alerta

4. Colores por prioridad (high=rojo, medium=amarillo, low=verde)

**Criterios de aceptación:**

1. Badge navbar muestra contador

2. Dropdown con preview alertas

3. Página completa con filtros

4. Navegación a entidad funciona

5. Visual diferenciado por tipo/prioridad

**Estimación:** 5 horas
**Prioridad:** P1
**Asignación:** FE
**Dependencias:** ANCLORA-048
**Estado:** ✅ DONE
**Tags:** \#alerts \#ui \#frontend

---

**ANCLORA-050: Generación Automática de Alertas**

**Descripción:**

Implementar triggers para generación automática de alertas.

**Tareas específicas:**

1. Crear función/cron para detectar:

   1. Proyectos con deadline en <7 días

   2. Facturas vencidas (due_date < today)

   3. Facturas próximas a vencer (<7 días)

2. Implementar lógica para no duplicar alertas

3. Crear alertas automáticas en eventos:

   1. Al aprobar/rechazar presupuesto

   2. Al marcar factura como pagada

   3. Al cambiar estado proyecto

4. Configurar ejecución periódica (diaria)

**Criterios de aceptación:**

1. Alertas deadline generadas automáticamente

2. Alertas vencimiento facturas funciona

3. No hay alertas duplicadas

4. Eventos generan alertas correctas

**Estimación:** 6 horas
**Prioridad:** P1
**Asignación:** BE
**Dependencias:** ANCLORA-048
**Estado:** ✅ DONE
**Tags:** \#alerts \#automation \#backend

---

**8\. FASE 7: TESTING Y QA (2 SEMANAS)**

**8.1 Sprint 7.1 \- Tests E2E (Semana 14\)**

**ANCLORA-051: Configurar Playwright**

**Descripción:**

Configurar entorno de testing E2E con Playwright.

**Tareas específicas:**

1. Instalar Playwright: npm init playwright@latest

2. Configurar playwright.config.ts:

   1. Browsers: Chromium, Firefox

   2. Base URL: localhost:3000

   3. Screenshots en fallos

   4. Videos en fallos

3. Crear carpeta tests/ con estructura:

   1. tests/auth/

   2. tests/clients/

   3. tests/projects/

   4. tests/quotes/

   5. tests/invoices/

4. Configurar GitHub Actions para CI

**Criterios de aceptación:**

1. Playwright configurado

2. Estructura tests creada

3. CI configurado

4. Ejemplo básico ejecutándose

**Estimación:** 3 horas
**Prioridad:** P1
**Asignación:** QA
**Estado:** ✅ DONE
**Tags:** \#testing \#e2e \#setup

---

**ANCLORA-052: Tests E2E Autenticación**

**Descripción:**

Crear tests E2E para flujos de autenticación.

**Tareas específicas:**

1. Crear tests/auth/admin-login.spec.ts:

   1. Login exitoso → redirect dashboard

   2. Login fallido → mensaje error

   3. Logout → redirect login

   4. Ruta protegida sin auth → redirect login

2. Crear tests/auth/client-portal.spec.ts:

   1. Magic link request → mensaje éxito

   2. Email no existe → mensaje error

3. Configurar fixtures para usuarios test

**Criterios de aceptación:**

1. Tests auth passing

2. Happy paths cubiertos

3. Error cases cubiertos

4. Fixtures configurados

**Estimación:** 4 horas
**Prioridad:** P1
**Asignación:** QA
**Estado:** ✅ DONE
**Tags:** \#testing \#e2e \#auth

---

**ANCLORA-053: Tests E2E CRUD Entidades**

**Descripción:**

Crear tests E2E para operaciones CRUD de entidades principales.

**Tareas específicas:**

1. Crear tests/clients/crud.spec.ts:

   1. Crear cliente → aparece en listado

   2. Editar cliente → datos actualizados

   3. Eliminar cliente → desaparece (si no tiene proyectos)

   4. Eliminar bloqueado si tiene proyectos

2. Crear tests/projects/crud.spec.ts:

   1. Crear proyecto → aparece en listado y kanban

   2. Editar proyecto → datos actualizados

   3. Cambiar estado → actualiza posición kanban

3. Crear tests/quotes/crud.spec.ts:

   1. Crear presupuesto con wizard

   2. Generar con IA → contenido generado

   3. Descargar PDF → archivo válido

4. Crear tests/invoices/crud.spec.ts:

   1. Crear factura

   2. Cambiar estado

   3. Descargar PDF

**Criterios de aceptación:**

1. Tests CRUD passing para todas las entidades

2. Flujos completos cubiertos

3. PDFs generados correctamente

4. Estados actualizados correctamente

**Estimación:** 8 horas
**Prioridad:** P1
**Asignación:** QA
**Estado:** ✅ DONE
**Tags:** \#testing \#e2e \#crud

---

**ANCLORA-054: Tests E2E Kanban**

**Descripción:**

Crear tests E2E para funcionalidad Kanban.

**Tareas específicas:**

1. Crear tests/kanban/drag-drop.spec.ts:

   1. Cargar kanban → 7 columnas visibles

   2. Drag proyecto entre columnas → estado actualizado

   3. Transición inválida → error toast, revert

   4. Múltiples proyectos en columna → orden correcto

2. Testear responsive (mobile view)

**Criterios de aceptación:**

1. Tests kanban passing

2. Drag & drop testeado

3. Transiciones validadas

4. Responsive verificado

**Estimación:** 5 horas
**Prioridad:** P1
**Asignación:** QA
**Estado:** ✅ DONE
**Tags:** \#testing \#e2e \#kanban

---

**8.2 Sprint 7.2 \- Tests Unitarios y Cobertura (Semana 15\)**

**ANCLORA-055: Configurar Vitest**

**Descripción:**

Configurar entorno de testing unitario con Vitest.

**Tareas específicas:**

1. Instalar Vitest: npm install -D vitest @vitest/ui @vitest/coverage-v8

2. Configurar vitest.config.ts

3. Configurar coverage thresholds: 80%

4. Crear setup files para mocks

5. Configurar alias paths

**Criterios de aceptación:**

1. Vitest configurado

2. Coverage reportando

3. Thresholds configurados

4. Mocks setup listo

**Estimación:** 2 horas
**Prioridad:** P1
**Asignación:** QA
**Estado:** ✅ DONE
**Tags:** \#testing \#unit \#setup

---

**ANCLORA-056: Tests Unitarios Server Actions**

**Descripción:**

Crear tests unitarios para Server Actions.

**Tareas específicas:**

1. Crear tests/actions/clients.test.ts:

   1. createClient: success, validation errors

   2. updateClient: success, not found

   3. deleteClient: success, blocked by projects

2. Crear tests/actions/projects.test.ts

3. Crear tests/actions/quotes.test.ts

4. Crear tests/actions/invoices.test.ts

5. Mockear Supabase client

**Criterios de aceptación:**

1. Tests unitarios passing

2. Coverage >80% en actions

3. Happy paths y error cases

4. Mocks funcionando

**Estimación:** 8 horas
**Prioridad:** P1
**Asignación:** QA
**Estado:** ✅ DONE
**Tags:** \#testing \#unit \#backend

---

**ANCLORA-057: Tests Unitarios Utilidades**

**Descripción:**

Crear tests unitarios para funciones de utilidad.

**Tareas específicas:**

1. Crear tests/lib/utils.test.ts:

   1. formatCurrency

   2. formatDate

   3. cn (classnames)

2. Crear tests/lib/validations.test.ts:

   1. Schemas Zod

   2. NIF/CIF validation

3. Crear tests/lib/verifactu.test.ts:

   1. generateVerifactuHash

   2. generateVerifactuCSV

   3. generateVerifactuQR

**Criterios de aceptación:**

1. Tests utilidades passing

2. Coverage >90% en utils

3. Edge cases cubiertos

**Estimación:** 4 horas
**Prioridad:** P2
**Asignación:** QA
**Estado:** ✅ DONE
**Tags:** \#testing \#unit \#utils

---

**ANCLORA-058: Integración CI/CD Tests**

**Descripción:**

Configurar ejecución automática de tests en pipeline CI/CD.

**Tareas específicas:**

1. Crear .github/workflows/test.yml:

   1. Trigger en push y PR

   2. Setup Node.js

   3. Install dependencies

   4. Run unit tests

   5. Run E2E tests

   6. Upload coverage report

2. Configurar Codecov o similar

3. Configurar badge en README

4. Bloquear merge si tests fallan

**Criterios de aceptación:**

1. Tests ejecutándose en CI

2. Coverage reportado

3. Badge visible en README

4. PRs bloqueados si tests fallan

**Estimación:** 3 horas
**Prioridad:** P1
**Asignación:** QA
**Estado:** ⏳ TODO
**Tags:** \#testing \#ci \#automation

---

**9\. RESUMEN DE ESTIMACIONES**

**9.1 Totales por Fase**

| Fase | Tareas | Horas estimadas | Estado |
| :---- | :---: | :---: | :---: |
| Fase 1 \- Fundación | 15 tareas | 60 horas | ✅ DONE |
| Fase 2 \- Core MVP | 18 tareas | 85 horas | ✅ DONE |
| Fase 3 \- IA | 5 tareas | 28 horas | ✅ DONE |
| Fase 4 \- Facturación | 5 tareas | 32 horas | ✅ DONE |
| Fase 5 \- Portal Cliente | 4 tareas | 18 horas | ✅ DONE |
| Fase 6 \- Alertas | 3 tareas | 16 horas | ✅ DONE |
| Fase 7 \- Testing QA | 8 tareas | 37 horas | ✅ 98% |
| **TOTAL PROYECTO** | **58 tareas** | **276 horas** | **98%** |

Table 1: Estimación total del proyecto

**9.2 Estado Actual por Fase**

| Fase | Completadas | Pendientes |
| :---- | :---: | :---: |
| Fase 1 \- Fundación | 15/15 | 0 |
| Fase 2 \- Core MVP | 18/18 | 0 |
| Fase 3 \- IA | 5/5 | 0 |
| Fase 4 \- Facturación | 5/5 | 0 |
| Fase 5 \- Portal Cliente | 4/4 | 0 |
| Fase 6 \- Alertas | 3/3 | 0 |
| Fase 7 \- Testing QA | 7/8 | 1 |
| **TOTAL** | **57/58** | **1** |

Table 2: Progreso del proyecto

**9.3 Tareas Pendientes Testing (Fase 7\)**

| ID | Tarea | Prioridad |
| :---- | :---- | :---: |
| ANCLORA-058 | Integración CI/CD Tests | P1 |

Table 3: Tareas pendientes de implementación

**9.4 Distribución por Rol**

| Rol | Horas estimadas |
| :---- | :---: |
| Frontend (FE) | \~110 horas |
| Backend (BE) | \~70 horas |
| Full-Stack (FS) | \~66 horas |
| QA | \~30 horas |
| **TOTAL** | **\~276 horas** |

Table 4: Distribución de trabajo por rol

---

**5\. NOTAS DE IMPLEMENTACIÓN**

**5.1 Convenciones de Código**

1. **Naming:** camelCase para funciones/variables, PascalCase para componentes

2. **File structure:** Colocate components cerca de uso

3. **Imports:** Usar alias @ para imports (ej: @/components)

4. **Comments:** Solo para lógica compleja, evitar obviedades

5. **Error handling:** Usar try/catch \+ toast notifications

**5.2 Git Workflow**

1. **Branches:** feature/ANCLORA-XXX-descripcion

2. **Commits:** Conventional commits (feat/fix/chore/docs)

3. **PRs:** Requiere 1 approval \+ tests passing

4. **Merge:** Squash merge a main

**5.3 Definición de Done**

Una tarea está DONE cuando:

1. Código implementado según criterios de aceptación

2. Tests unitarios/E2E passing (si aplica)

3. Code review aprobado

4. Deployado en staging

5. Documentación actualizada (si aplica)

6. QA manual verificado (si aplica)

---

**Documento generado:** 30 de enero de 2026
**Última actualización:** 1 de febrero de 2026 (añadidas Fases 3-7)
**Próxima actualización:** Tras completar tests E2E y unitarios

---

**APÉNDICE A: PLANTILLA DE TAREA**

**ANCLORA-XXX: Título Tarea**

**Descripción:**

Breve descripción de qué se debe implementar y por qué.

**Tareas específicas:**

1. Sub-tarea 1

2. Sub-tarea 2

3. Sub-tarea 3

**Criterios de aceptación:**

1. Criterio 1

2. Criterio 2

3. Criterio 3

**Estimación:** X horas  
**Prioridad:** P0-P3  
**Asignación:** FE/BE/FS/QA  
**Dependencias:** ANCLORA-XXX (si aplica)  
**Tags:** \#tag1 \#tag2 \#tag3