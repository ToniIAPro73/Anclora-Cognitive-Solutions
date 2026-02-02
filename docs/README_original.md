**Anclora Cognitive Solutions Platform**

**Plataforma SaaS para consultorías de IA** que permite generar presupuestos con IA local, gestionar proyectos mediante Kanban visual y ofrecer transparencia total a clientes.

![Version][image1]

Next.js

TypeScript

![License][image2]

---

**Tabla de Contenidos**

1. Características Principales

2. Stack Tecnológico

3. Requisitos Previos

4. Instalación y Configuración

5. Estructura del Proyecto

6. Scripts Disponibles

7. Variables de Entorno

8. Desarrollo Local

9. Testing

10. Deployment

11. Roadmap

12. Contribución

13. Licencia

---

**Características Principales**

**Para Consultores (Admin)**

1. **Generación de Presupuestos con IA**: Utiliza Llama 3.2 3B local para crear presupuestos profesionales adaptados al tono y profundidad técnica deseados

2. **Kanban Visual**: Gestión de proyectos con drag & drop y sincronización en tiempo real entre usuarios

3. **Facturación Automatizada**: Generación de facturas PDF profesionales con numeración automática

4. **Sistema de Alertas**: Notificaciones automáticas sobre deadlines, presupuestos excedidos y facturas vencidas

5. **Auditoría Completa**: Timeline de cambios con historial detallado de modificaciones

**Para Clientes (Portal)**

1. **Acceso sin Password**: Autenticación mediante magic link seguro

2. **Dashboard Personalizado**: Vista de proyectos propios con métricas en tiempo real

3. **Kanban Read-Only**: Seguimiento visual del estado de proyectos

4. **Descarga de Documentos**: Acceso a presupuestos y facturas en PDF

---

**Stack Tecnológico**

**Frontend**

| Tecnología | Versión | Propósito |
| :---- | :---- | :---- |
| Next.js | 14.x | Framework React con App Router |
| TypeScript | 5.3.x | Type safety |
| Tailwind CSS | 3.4.x | Utility-first CSS |
| shadcn/ui | Latest | Componentes UI base |
| @tanstack/react-query | 5.x | Server state management |
| @tanstack/react-table | 8.x | Tablas avanzadas |
| @hello-pangea/dnd | Latest | Drag & drop Kanban |
| react-hook-form | 7.x | Gestión de formularios |
| zod | 3.x | Validación de schemas |

Table 1: Stack frontend principal

**Backend**

| Tecnología | Versión | Propósito |
| :---- | :---- | :---- |
| Supabase | Latest | BaaS (Database, Auth, Storage, Realtime) |
| PostgreSQL | 15.x | Base de datos relacional |
| FastAPI | 0.109.x | API Python para IA |
| Ollama | Latest | Runtime para LLMs locales |
| Llama 3.2 | 3B | Modelo de lenguaje |

Table 2: Stack backend principal

**Herramientas**

1. **Testing**: Vitest, Playwright, React Testing Library

2. **Linting**: ESLint, Prettier

3. **CI/CD**: GitHub Actions, Vercel

4. **Monitoring**: Sentry, Vercel Analytics

---

**Requisitos Previos**

**Software Requerido**

1. **Node.js**: \>= 18.17.0 (recomendado 20.x LTS)

2. **pnpm**: \>= 8.0.0 (package manager preferido)

3. **Python**: \>= 3.10 (para FastAPI service)

4. **Ollama**: Latest (para IA local)

5. **Git**: \>= 2.30

**Cuentas de Servicios**

1. Cuenta Supabase (plan gratuito suficiente para desarrollo)

2. Cuenta Vercel (deployment frontend)

3. Cuenta GitHub (repositorio y CI/CD)

4. Cuenta Resend (envío de emails, plan gratuito 100 emails/día)

**Verificar Instalación**

Ejecuta los siguientes comandos para verificar versiones:

node \--version \# Debe ser \>= 18.17.0  
pnpm \--version \# Debe ser \>= 8.0.0  
python \--version \# Debe ser \>= 3.10  
ollama \--version \# Debe estar instalado  
git \--version \# Debe ser \>= 2.30

---

**Instalación y Configuración**

**1\. Clonar Repositorio**

git clone [https://github.com/anclora/platform.git](https://github.com/anclora/platform.git)  
cd platform

**2\. Instalar Dependencias Frontend**

pnpm install

**Nota**: Si no tienes pnpm instalado, ejecuta:

npm install \-g pnpm

**3\. Configurar Supabase**

**3.1 Crear Proyecto**

1. Accede a [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. Click en "New Project"

3. Configuración:

   1. Name: anclora-platform-dev

   2. Database Password: Genera uno seguro (\>16 chars)

   3. Region: Europe West (Frankfurt)

   4. Pricing plan: Free (para desarrollo)

4. Espera 2-3 minutos mientras se aprovisiona

**3.2 Ejecutar Migraciones**

Copia el contenido de supabase/migrations/001\_initial\_schema.sql y ejecútalo en el SQL Editor de Supabase:

1. Supabase Dashboard → SQL Editor

2. New Query

3. Pega el contenido completo del archivo de migración

4. Click "Run"

5. Verifica que todas las tablas se crearon: Database → Tables

**3.3 Configurar Storage Buckets**

\-- Ejecutar en SQL Editor  
INSERT INTO storage.buckets (id, name, public)  
VALUES  
('quotes-pdfs', 'quotes-pdfs', true),  
('invoices-pdfs', 'invoices-pdfs', true);

\-- Configurar políticas de acceso  
CREATE POLICY "Authenticated users can upload"  
ON storage.objects FOR INSERT  
TO authenticated  
WITH CHECK (bucket\_id IN ('quotes-pdfs', 'invoices-pdfs'));

CREATE POLICY "Public read access"  
ON storage.objects FOR SELECT  
TO public  
USING (bucket\_id IN ('quotes-pdfs', 'invoices-pdfs'));

**3.4 Obtener API Keys**

1. Supabase Dashboard → Settings → API

2. Copia los valores:

   1. Project URL (ej: [https://xxx.supabase.co](https://xxx.supabase.co))

   2. anon public key

   3. service\_role key (¡MANTENER SECRETO\!)

**4\. Configurar Variables de Entorno**

Crea archivo .env.local en la raíz del proyecto:

cp .env.example .env.local

Edita .env.local con tus valores:

**Supabase**

NEXT\_PUBLIC\_SUPABASE\_URL=https://xxx.supabase.co  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=eyJxxx...  
SUPABASE\_SERVICE\_ROLE\_KEY=eyJxxx...

**AI Service (local development)**

AI\_SERVICE\_URL=http://localhost:8000

**Email (Resend)**

RESEND\_API\_KEY=re\_xxx

**App**

NEXT\_PUBLIC\_APP\_URL=http://localhost:3000

**⚠️ IMPORTANTE**: Nunca commitees .env.local al repositorio.

**5\. Configurar Servicio de IA (FastAPI \+ Ollama)**

**5.1 Instalar Ollama**

**macOS / Linux**:

curl [https://ollama.ai/install.sh](https://ollama.ai/install.sh) | sh

**Windows**: Descarga el instalador desde [https://ollama.ai/download](https://ollama.ai/download)

**5.2 Descargar Modelo Llama**

ollama pull llama3.2:3b

Esto descargará \~2GB. Verifica la instalación:

ollama run llama3.2:3b "Hello, world\!"

Debes ver una respuesta del modelo.

**5.3 Configurar FastAPI Service**

Navega al directorio del servicio:

cd ai-service

Crea entorno virtual Python:

python \-m venv venv  
source venv/bin/activate \# En Windows: venv\\Scripts\\activate

Instala dependencias:

pip install \-r requirements.txt

Crea archivo .env:

OLLAMA\_URL=http://localhost:11434  
ALLOWED\_ORIGINS=http://localhost:3000  
LOG\_LEVEL=INFO

Inicia el servicio:

uvicorn main:app \--reload \--port 8000

Verifica en [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI).

**6\. Seed Data (Opcional)**

Carga datos de prueba para desarrollo:

pnpm db:seed

Esto creará:

1. 5 clientes de ejemplo

2. 10 proyectos en diferentes estados

3. 3 presupuestos de muestra

4. 2 facturas

---

**Estructura del Proyecto**

anclora-platform/  
├── src/  
│ ├── app/ \# Next.js App Router  
│ │ ├── (auth)/ \# Rutas autenticación  
│ │ │ ├── login/  
│ │ │ └── portal/  
│ │ ├── (dashboard)/ \# Rutas admin protegidas  
│ │ │ ├── clients/  
│ │ │ ├── projects/  
│ │ │ ├── kanban/  
│ │ │ ├── quotes/  
│ │ │ ├── invoices/  
│ │ │ └── alerts/  
│ │ ├── actions/ \# Server Actions  
│ │ ├── api/ \# API Routes (si necesario)  
│ │ └── layout.tsx \# Root layout  
│ ├── components/ \# Componentes React  
│ │ ├── ui/ \# shadcn/ui components  
│ │ ├── layout/ \# Navbar, Sidebar, etc.  
│ │ ├── clients/ \# Componentes específicos clientes  
│ │ ├── projects/ \# Componentes específicos proyectos  
│ │ └── kanban/ \# Componentes Kanban  
│ ├── lib/ \# Utilidades  
│ │ ├── supabase/ \# Cliente Supabase  
│ │ ├── validations/ \# Schemas Zod  
│ │ └── utils.ts \# Helpers generales  
│ └── types/ \# TypeScript types  
├── ai-service/ \# FastAPI backend IA  
│ ├── [main.py](http://main.py)  \# App FastAPI  
│ ├── [models.py](http://models.py)  \# Pydantic schemas  
│ ├── [prompts.py](http://prompts.py)  \# Templates prompts  
│ └── requirements.txt  
├── supabase/  
│ ├── migrations/ \# SQL migrations  
│ └── seed.sql \# Seed data  
├── tests/ \# Tests  
│ ├── unit/ \# Tests unitarios (Vitest)  
│ ├── integration/ \# Tests integración  
│ └── e2e/ \# Tests E2E (Playwright)  
├── public/ \# Assets estáticos  
├── docs/ \# Documentación  
│ ├── [spec.md](http://spec.md)  \# Especificación funcional  
│ ├── [plan.md](http://plan.md)  \# Plan de implementación  
│ └── [tasks.md](http://tasks.md)  \# Desglose de tareas  
├── .github/  
│ └── workflows/ \# GitHub Actions  
├── package.json  
├── tsconfig.json  
├── tailwind.config.ts  
├── next.config.js  
└── [README.md](http://README.md)

---

**Scripts Disponibles**

**Desarrollo**

pnpm dev \# Inicia Next.js en modo desarrollo (localhost:3000)  
pnpm dev:ai \# Inicia FastAPI service (localhost:8000)  
pnpm dev:all \# Inicia ambos servicios simultáneamente

**Build**

pnpm build \# Build producción Next.js  
pnpm start \# Inicia servidor producción

**Testing**

pnpm test \# Ejecuta tests unitarios (Vitest)  
pnpm test:watch \# Tests en modo watch  
pnpm test:e2e \# Ejecuta tests E2E (Playwright)  
pnpm test:e2e:ui \# Tests E2E con UI interactiva  
pnpm test:coverage \# Genera reporte de coverage

**Linting y Formateo**

pnpm lint \# ESLint check  
pnpm lint:fix \# ESLint fix automático  
pnpm format \# Prettier format  
pnpm type-check \# TypeScript check sin build

**Database**

pnpm db:types \# Genera tipos TypeScript desde Supabase  
pnpm db:seed \# Carga seed data  
pnpm db:reset \# Reset DB (⚠️ borra todos los datos)

**Utilidades**

pnpm analyze \# Analiza bundle size  
pnpm clean \# Limpia cache y builds

---

**Variables de Entorno**

**Frontend (Next.js)**

**Obligatorias**

**Supabase Configuration**

NEXT\_PUBLIC\_SUPABASE\_URL= \# URL del proyecto Supabase  
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY= \# Anon public key  
SUPABASE\_SERVICE\_ROLE\_KEY= \# Service role key (server-only)

**AI Service**

AI\_SERVICE\_URL= \# URL FastAPI (local: [http://localhost:8000](http://localhost:8000))

**Email Service**

RESEND\_API\_KEY= \# API key de Resend

**Opcionales**

**App Configuration**

NEXT\_PUBLIC\_APP\_URL=http://localhost:3000 \# URL base de la app

**Monitoring**

NEXT\_PUBLIC\_SENTRY\_DSN= \# Sentry DSN (producción)  
SENTRY\_AUTH\_TOKEN= \# Token para uploads source maps

**Analytics**

NEXT\_PUBLIC\_POSTHOG\_KEY= \# PostHog key (opcional)

**Backend IA (FastAPI)**

**Ollama Configuration**

OLLAMA\_URL=http://localhost:11434 \# URL de Ollama

**CORS**

ALLOWED\_ORIGINS=http://localhost:3000,[https://anclora.vercel.app](https://anclora.vercel.app)

**Logging**

LOG\_LEVEL=INFO \# DEBUG | INFO | WARNING | ERROR

**Producción (Vercel)**

Configura estas variables en Vercel Dashboard → Settings → Environment Variables:

1. Todas las variables de frontend

2. Marca como "secret" las que contienen keys/tokens

3. Configura por entorno: Production, Preview, Development

---

**Desarrollo Local**

**Workflow Recomendado**

**1\. Iniciar Servicios**

Terminal 1 (Frontend):

pnpm dev

Terminal 2 (Backend IA):

cd ai-service  
source venv/bin/activate  
uvicorn main:app \--reload

O ambos con un solo comando:

pnpm dev:all

**2\. Verificar Servicios**

1. Frontend: [http://localhost:3000](http://localhost:3000)

2. Backend IA: [http://localhost:8000/docs](http://localhost:8000/docs)

3. Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)

**Hot Reloading**

1. **Frontend**: Next.js recarga automáticamente al editar archivos

2. **Backend**: FastAPI con \--reload recarga al guardar .py

3. **Database**: Cambios en Supabase requieren nueva migración

**Debugging**

**Frontend (Next.js)**

Usa VS Code debugger con configuración .vscode/launch.json:

{  
"version": "0.2.0",  
"configurations": \[  
{  
"name": "Next.js: debug server-side",  
"type": "node-terminal",  
"request": "launch",  
"command": "pnpm dev"  
},  
{  
"name": "Next.js: debug client-side",  
"type": "chrome",  
"request": "launch",  
"url": "[http://localhost:3000](http://localhost:3000)"  
}  
\]  
}

**Backend (FastAPI)**

Añade breakpoints en código y ejecuta con debugger de VS Code o usa:

import pdb; pdb.set\_trace()

**Logs**

1. **Frontend**: Console del navegador \+ Terminal

2. **Backend**: Terminal con uvicorn

3. **Supabase**: Dashboard → Logs → API/Database

---

**Testing**

**Estrategia de Testing**

| Tipo | Herramienta | Objetivo Coverage |
| :---- | :---- | :---- |
| Unit Tests | Vitest | \>80% |
| Integration Tests | Vitest \+ MSW | \>70% |
| E2E Tests | Playwright | Happy paths críticos |

Table 3: Niveles de testing

**Tests Unitarios**

Ejecutar todos los tests:

pnpm test

Ejecutar tests específicos:

pnpm test clients.test.ts

Con cobertura:

pnpm test:coverage

Ver reporte HTML:

open coverage/index.html

**Tests E2E**

Instalar navegadores (primera vez):

pnpm exec playwright install

Ejecutar tests:

pnpm test:e2e

Ejecutar con UI interactiva:

pnpm test:e2e:ui

Ejecutar en navegador específico:

pnpm test:e2e \--project=chromium

Generar reporte:

pnpm exec playwright show-report

**Tests Críticos**

Lista de flujos E2E que deben pasar siempre:

1. Login admin → Crear cliente → Verificar en tabla

2. Login admin → Crear proyecto → Mover en Kanban → Verificar DB

3. Generar presupuesto con IA → Editar → Guardar → Generar PDF

4. Crear factura → Generar PDF → Enviar email

5. Login cliente (magic link) → Ver dashboard → Descargar presupuesto

---

**Deployment**

**Vercel (Frontend)**

**Setup Inicial**

1. Conecta repositorio GitHub a Vercel

2. Configuración automática detecta Next.js

3. Añade variables de entorno en Settings

4. Deploy automático en push a main

**Variables de Entorno en Vercel**

Vercel Dashboard → Project → Settings → Environment Variables:

1. NEXT\_PUBLIC\_SUPABASE\_URL

2. NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY

3. SUPABASE\_SERVICE\_ROLE\_KEY (marca como secret)

4. AI\_SERVICE\_URL (URL pública del servicio IA)

5. RESEND\_API\_KEY (marca como secret)

**Dominios Personalizados**

1. Vercel Dashboard → Project → Settings → Domains

2. Añade tu dominio (ej: anclora.app)

3. Configura DNS según instrucciones Vercel

4. SSL automático con Let's Encrypt

**Railway/Render (Backend IA)**

**Opción 1: Railway**

1. Conecta repositorio en Railway

2. Configura build:

   1. Root Directory: ai-service

   2. Start Command: uvicorn main:app \--host 0.0.0.0 \--port $PORT

3. Variables de entorno:

   1. OLLAMA\_URL (si usas Ollama cloud)

   2. ALLOWED\_ORIGINS

4. Deploy automático

**Opción 2: Render**

1. New Web Service en Render

2. Conecta repositorio

3. Build Command: cd ai-service && pip install \-r requirements.txt

4. Start Command: uvicorn main:app \--host 0.0.0.0 \--port $PORT

5. Añade variables de entorno

**Nota**: Llama 3.2 3B requiere \~4GB RAM. Usa plan adecuado.

**Supabase (Producción)**

El proyecto de desarrollo puede usarse para producción en el plan Free, o crear proyecto separado:

1. Nuevo proyecto Supabase para producción

2. Ejecutar migraciones

3. Configurar RLS policies

4. Actualizar variables de entorno en Vercel

5. Habilitar backups automáticos (Settings → Database → Backups)

**CI/CD Pipeline**

GitHub Actions configurado en .github/workflows/main.yml:

1. On push a main o PR:

   1. Lint \+ Type check

   2. Unit tests

   3. Build Next.js

   4. E2E tests (Playwright)

2. Si todos pasan → Auto-deploy a Vercel

3. Si fallan → Bloquea merge (si PR)

---

**Roadmap**

**MVP (Fase 1-7) \- Completado Q2 2026**

1. ✅ Autenticación dual (admin \+ cliente)

2. ✅ CRUD clientes y proyectos

3. ✅ Kanban con drag & drop y realtime

4. ✅ Generación presupuestos con IA local

5. ✅ Sistema facturación con PDFs

6. ✅ Portal cliente read-only

7. ✅ Sistema de alertas automatizado

**Post-MVP (Q3-Q4 2026\)**

**Fase 8: Integraciones**

1. Integración Stripe para pagos online

2. Google Calendar sync (deadlines)

3. Slack notifications

4. Webhooks para sistemas externos

**Fase 9: Colaboración**

1. Chat admin-cliente en tiempo real

2. Comentarios en proyectos con threading

3. File upload en proyectos

4. Multi-user admin con roles (owner, editor, viewer)

**Fase 10: Analytics**

1. Dashboard analytics para admin

2. Gráficas de ingresos, proyectos, tiempos

3. Exportar reports CSV/Excel

4. Forecasting con datos históricos

**Fase 11: PWA**

1. Service Workers para offline-first

2. Push notifications (Web Push API)

3. Install prompt

4. Background sync

**Fase 12: IA Avanzada**

1. Fine-tuning Llama con presupuestos históricos

2. Generación automática facturas desde tiempo trackeado

3. Sugerencias IA para pricing óptimo

4. Detección automática scope creep

---

**Contribución**

**Proceso de Contribución**

1. Fork del repositorio

2. Crea branch desde main: git checkout \-b feature/ANCLORA-XXX-descripcion

3. Implementa cambios siguiendo convenciones de código

4. Añade tests para nueva funcionalidad

5. Commit con Conventional Commits: feat: descripción

6. Push a tu fork y crea Pull Request

7. Espera code review y aprobación

8. Merge con squash a main

**Conventional Commits**

Formato: \<type\>(\<scope\>): \<description\>

**Tipos válidos**:

1. **feat**: Nueva funcionalidad

2. **fix**: Corrección de bug

3. **docs**: Cambios en documentación

4. **style**: Formateo, linting (sin cambios de código)

5. **refactor**: Refactorización sin cambiar comportamiento

6. **test**: Añadir o corregir tests

7. **chore**: Tareas de mantenimiento (deps, config)

**Ejemplos**:

feat(clients): add email validation on client form  
fix(kanban): prevent drag when status transition invalid  
docs(readme): update installation instructions  
test(auth): add e2e tests for magic link flow

**Code Review**

Criterios de aprobación:

1. Código sigue convenciones del proyecto

2. Tests incluidos y passing

3. Sin cambios innecesarios (formateo masivo, refactors no relacionados)

4. Documentación actualizada si aplica

5. Sin console.logs o TODOs

6. Performance considerada (no bloquea UI, queries optimizadas)

---

**Solución de Problemas**

**Errores Comunes**

**Error: "Supabase client not configured"**

**Causa**: Variables de entorno no cargadas.

**Solución**:

1. Verifica que .env.local existe

2. Verifica que variables tienen valores correctos

3. Reinicia servidor: pnpm dev

**Error: "Ollama connection refused"**

**Causa**: Ollama no está ejecutándose.

**Solución**:

ollama serve \# Inicia servidor Ollama  
ollama list \# Verifica modelos instalados

**Error: "RLS policy violation"**

**Causa**: Row Level Security bloqueando query.

**Solución**:

1. Verifica que usuario está autenticado

2. Verifica que RLS policies están configuradas

3. Usa service\_role key para bypass (solo desarrollo)

**Build Error: "Module not found"**

**Causa**: Dependencias desactualizadas o corruptas.

**Solución**:

rm \-rf node\_modules  
rm pnpm-lock.yaml  
pnpm install

**Logs de Debug**

Habilita logs verbosos:

**Frontend**

DEBUG=\* pnpm dev

**Backend**

LOG\_LEVEL=DEBUG uvicorn main:app \--reload

---

**Licencia**

Este proyecto está bajo la licencia MIT. Ver archivo [LICENSE](http://LICENSE) para más detalles.

---

**Contacto y Soporte**

**Equipo Anclora**

1. **Email**: hola@anclora.app

2. **Website**: [https://anclora.app](https://anclora.app)

3. **GitHub**: [https://github.com/anclora](https://github.com/anclora)

4. **Documentación**: [https://docs.anclora.app](https://docs.anclora.app)

**Reportar Issues**

Si encuentras un bug o tienes una sugerencia:

1. Busca en issues existentes: [https://github.com/anclora/platform/issues](https://github.com/anclora/platform/issues)

2. Si no existe, crea nuevo issue con template

3. Incluye:

   1. Descripción clara del problema

   2. Pasos para reproducir

   3. Comportamiento esperado vs actual

   4. Screenshots si aplica

   5. Environment (OS, navegador, Node version)

**Comunidad**

1. Discord: [https://discord.gg/anclora](https://discord.gg/anclora) (próximamente)

2. Twitter: @ancloraai

3. LinkedIn: Anclora Cognitive Solutions

---

**Agradecimientos**

Este proyecto utiliza excelentes herramientas open-source:

1. Next.js por Vercel

2. Supabase por el increíble BaaS

3. shadcn/ui por los componentes base

4. Ollama por simplificar LLMs locales

5. Meta AI por Llama 3.2

6. Y muchas otras librerías de la comunidad

---

**¡Gracias por usar Anclora Platform\!** 🚀

Para más información, consulta la [documentación completa](http://docs/) o contacta al equipo.

---

*Última actualización: 30 de enero de 2026*

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>