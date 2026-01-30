<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# ahora quiero que me des el prompt que he de dar al agente antigravity para que con los archivos generados construya la aplicación en un one-shoot

Aquí tienes el prompt optimizado para el agente Antigravity:

***

**PROMPT PARA ANTIGRAVITY - CONSTRUCCIÓN ONE-SHOT ANCLORA PLATFORM**

***

Construye la plataforma completa Anclora Cognitive Solutions siguiendo EXACTAMENTE las especificaciones de los 4 documentos adjuntos (spec.md, plan.md, tasks.md, README.md).

## OBJETIVO

Generar un proyecto Next.js 14 completo, funcional y production-ready que implemente:

- Autenticación dual (admin + cliente con magic link)
- CRUD completo de clientes y proyectos
- Kanban board con drag \& drop y realtime sync
- Generación de presupuestos con IA (integración FastAPI + Ollama)
- Sistema de facturación con PDFs
- Portal cliente read-only
- Sistema de alertas automatizado


## PRIORIZACIÓN DE IMPLEMENTACIÓN

**FASE 1 (CRÍTICO - MVP FUNCIONAL):**

1. Setup proyecto Next.js 14 + TypeScript + Tailwind + shadcn/ui
2. Configuración Supabase client (SSR con @supabase/ssr)
3. Schema completo de base de datos (SQL migrations)
4. Autenticación admin (email/password) con middleware protección rutas
5. Autenticación cliente (magic link) con validación email en tabla clients
6. CRUD clientes completo con validaciones (NIF español, E.164 phone)
7. CRUD proyectos con estados y matriz de transiciones
8. Kanban board con @hello-pangea/dnd (7 columnas, drag \& drop funcional)
9. Integración Supabase Realtime para sync Kanban
10. Generación presupuestos con IA (formulario wizard + integración FastAPI)
11. Exportación PDFs presupuestos (@react-pdf/renderer)
12. Sistema facturación básico (numeración automática YYYY-MM-NNNN)
13. Portal cliente con dashboard y Kanban read-only

**FASE 2 (IMPORTANTE - PULIDO):**
14. Sistema de alertas (Edge Function cron + panel UI)
15. Audit logs con timeline visual
16. Tests E2E críticos (Playwright): login, CRUD, Kanban, generación IA
17. Optimistic updates en Kanban
18. Notificaciones toast realtime
19. RLS policies completas y testeadas

**FASE 3 (NICE-TO-HAVE):**
20. Tests unitarios (Vitest, >80% coverage)
21. CI/CD pipeline (GitHub Actions)
22. Storybook para componentes
23. Lighthouse optimization (>90 score)
24. Accessibility audit (WCAG 2.1 AA)

## ESTRUCTURA DEL PROYECTO

Genera esta estructura EXACTA:

```
anclora-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── portal/
│   │   │       └── login/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── kanban/page.tsx
│   │   │   ├── quotes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   └── alerts/page.tsx
│   │   ├── portal/
│   │   │   └── client/
│   │   │       └── [clientId]/
│   │   │           ├── page.tsx
│   │   │           ├── kanban/page.tsx
│   │   │           ├── quotes/page.tsx
│   │   │           └── invoices/page.tsx
│   │   ├── actions/
│   │   │   ├── clients.ts
│   │   │   ├── projects.ts
│   │   │   ├── quotes.ts
│   │   │   └── invoices.ts
│   │   ├── api/
│   │   │   └── generate-quote/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn/ui components)
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── page-container.tsx
│   │   ├── clients/
│   │   │   ├── client-table.tsx
│   │   │   └── client-form-modal.tsx
│   │   ├── projects/
│   │   │   ├── project-form.tsx
│   │   │   └── project-details-modal.tsx
│   │   ├── kanban/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── kanban-column.tsx
│   │   │   └── project-card.tsx
│   │   └── quotes/
│   │       ├── quote-wizard.tsx
│   │       └── quote-editor.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── validations/
│   │   │   ├── client.schema.ts
│   │   │   ├── project.schema.ts
│   │   │   └── quote.schema.ts
│   │   └── utils.ts
│   └── types/
│       └── database.types.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── tests/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── clients.spec.ts
│   │   └── kanban.spec.ts
│   └── unit/
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── README.md
```


## CONFIGURACIONES CLAVE

### package.json dependencies

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "@tanstack/react-query": "^5.56.0",
    "@tanstack/react-table": "^8.20.0",
    "@hello-pangea/dnd": "^17.0.0",
    "react-hook-form": "^7.53.0",
    "zod": "^3.23.0",
    "@react-pdf/renderer": "^4.0.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.453.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "eslint": "^8",
    "prettier": "^3.3.0",
    "@playwright/test": "^1.48.0",
    "vitest": "^2.1.0"
  }
}
```


### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```


### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... más colores según design system
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
```


## IMPLEMENTACIÓN DE MÓDULOS CRÍTICOS

### 1. Supabase Client (src/lib/supabase/client.ts)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```


### 2. Middleware de Autenticación (src/middleware.ts)

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Proteger rutas /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/portal/:path*']
}
```


### 3. Schema SQL Completo (supabase/migrations/001_initial_schema.sql)

Copia EXACTAMENTE el SQL de spec.md sección 3.2, incluyendo:

- Todas las tablas (clients, projects, quotes, invoices, alerts, audit_logs)
- Todos los indexes
- Todos los triggers (set_quote_version, generate_invoice_number, audit_trigger)
- Todas las RLS policies


### 4. Kanban Board con Realtime

Implementar según especificación en spec.md sección 2.3.2, asegurando:

- @hello-pangea/dnd configurado correctamente
- 7 columnas (Backlog, Propuesta, Aprobado, En Progreso, Testing, Completado, Cancelado)
- Validación matriz de transiciones
- Optimistic updates
- Supabase Realtime subscription
- Notificaciones toast en cambios


### 5. Generación IA con FastAPI

**Frontend (src/app/api/generate-quote/route.ts):**

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const response = await fetch(`${process.env.AI_SERVICE_URL}/api/generate-quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  
  const data = await response.json()
  return NextResponse.json(data)
}
```

**Backend FastAPI (ai-service/main.py):**

Implementar según spec.md sección 4, con:

- Sistema prompt template completo
- Llamada a Ollama (localhost:11434)
- Extracción JSON de respuesta LLM
- Validación estructura
- Manejo errores y timeout 30s


## VALIDACIONES OBLIGATORIAS

1. **Email único** en tabla clients (constraint DB + validación frontend)
2. **NIF/CIF español** con regex: `/^[XYZ]?\d{7,8}[A-Z]$/`
3. **Phone E.164** con regex: `/^\+[1-9]\d{1,14}$/`
4. **Deadline futura** en proyectos
5. **Matriz transiciones** estados proyecto (ver spec.md sección 2.3.3)
6. **Invoice number único** con trigger automático
7. **RLS policies** funcionando correctamente

## PUNTOS CRÍTICOS DE CALIDAD

- **NO usar localStorage, sessionStorage, cookies manualmente** (Supabase maneja auth)
- **Usar Server Actions** para mutaciones (no API routes salvo IA)
- **Optimistic updates** en Kanban para UX fluida
- **Toasts informativos** en todas las acciones (success, error, loading)
- **Loading states** visibles (spinners, skeletons)
- **Error boundaries** en componentes críticos
- **Responsive design** (mobile-first, 320px mínimo)
- **Accessibility**: Labels en inputs, color contrast 4.5:1, keyboard navigation


## ENTREGABLES ESPERADOS

Al finalizar, debe funcionar:

1. ✅ Login admin → Dashboard
2. ✅ CRUD clientes con validaciones
3. ✅ CRUD proyectos con formulario completo
4. ✅ Kanban drag \& drop actualiza DB
5. ✅ Realtime sync visible en 2 pestañas simultáneas
6. ✅ Wizard presupuestos (3 pasos) → Llamada IA → Editor → PDF
7. ✅ Generación facturas con número automático → PDF
8. ✅ Login cliente magic link → Dashboard portal → Ver proyectos
9. ✅ Sistema alertas (generación + panel UI)
10. ✅ Tests E2E críticos passing

## ARCHIVOS DE CONFIGURACIÓN ADICIONALES

### .env.example

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Email
RESEND_API_KEY=re_xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
```


### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```


## INSTRUCCIONES FINALES

1. Genera TODOS los archivos necesarios para un proyecto funcional
2. Prioriza implementación completa de Fase 1 (MVP funcional)
3. Código production-ready, sin TODOs ni placeholders
4. Sigue EXACTAMENTE las especificaciones de los 4 documentos
5. Si algo no está especificado, usa best practices de Next.js 14 + TypeScript
6. Incluye comentarios solo en lógica compleja
7. Mantén consistencia en naming, estructura y patterns

**OBJETIVO FINAL:** Proyecto que se pueda clonar, ejecutar `pnpm install && pnpm dev` y funcione inmediatamente (asumiendo Supabase configurado).

***

**¿Estás listo para construir la plataforma completa Anclora en un solo shot?** 🚀
<span style="display:none">[^1][^2]</span>

<div align="center">⁂</div>

[^1]: Estructura_inicial_repo.md

[^2]: Estructura_inicial_repo.md

