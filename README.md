# Anclora Cognitive Solutions Platform

[![CI](https://github.com/anclora/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/anclora/platform/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/anclora/platform/branch/main/graph/badge.svg)](https://codecov.io/gh/anclora/platform)

Plataforma SaaS para gestión de proyectos, presupuestos y facturación con asistencia de IA.

## Tecnologías

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **UI Components:** shadcn/ui, Radix UI
- **AI:** OpenAI GPT-4 para generación de presupuestos
- **PDF:** @react-pdf/renderer
- **Testing:** Vitest (unit), Playwright (E2E)

## Requisitos

- Node.js 20+
- pnpm 8+
- Cuenta en Supabase
- API Key de OpenAI (opcional, para generación IA)

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/anclora/platform.git
cd platform

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Iniciar servidor de desarrollo
pnpm dev
```

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor de desarrollo (localhost:3000)

# Build
pnpm build            # Build de producción
pnpm start            # Servidor de producción

# Testing
pnpm test             # Tests unitarios
pnpm test:coverage    # Tests con cobertura
pnpm test:e2e         # Tests E2E (Playwright)
pnpm test:e2e:ui      # Tests E2E con interfaz visual

# Calidad de código
pnpm lint             # ESLint
pnpm type-check       # TypeScript
```

## Estructura del Proyecto

```
src/
├── app/                  # Next.js App Router
│   ├── (dashboard)/      # Rutas protegidas (admin)
│   ├── (portal)/         # Portal de clientes
│   ├── actions/          # Server Actions
│   └── api/              # API Routes
├── components/           # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── layout/           # Layout (Navbar, Sidebar)
│   └── [feature]/        # Componentes por feature
├── lib/                  # Utilidades
│   ├── supabase/         # Cliente Supabase
│   ├── pdf/              # Templates PDF
│   ├── verifactu/        # Integración Verifactu
│   └── validations/      # Schemas Zod
└── types/                # TypeScript types
```

## Testing

### Tests Unitarios

```bash
# Ejecutar tests
pnpm test

# Con UI interactiva
pnpm test:ui

# Con cobertura
pnpm test:coverage
```

### Tests E2E

```bash
# Configurar usuario de prueba (ver docs/SETUP_CI_CD.md)
cp .env.test.local.example .env.test.local

# Ejecutar tests
pnpm test:e2e

# Con UI interactiva
pnpm test:e2e:ui
```

## CI/CD

El proyecto usa GitHub Actions para CI/CD con los siguientes jobs:

1. **Lint & Type Check** - ESLint y TypeScript
2. **Unit Tests** - Vitest con reporte a Codecov
3. **Build** - Verificación de build de Next.js
4. **E2E Tests** - Playwright en Chromium y Firefox

Ver [docs/SETUP_CI_CD.md](./docs/SETUP_CI_CD.md) para configuración de secrets.

## Funcionalidades

### Gestión de Clientes
- CRUD completo con validaciones
- Idioma preferido (ES/EN/CA)
- Portal de acceso con magic link

### Gestión de Proyectos
- Kanban board interactivo con drag & drop
- Estados: Backlog → Propuesta → Aprobado → En Progreso → Testing → Completado
- Alertas de deadline

### Presupuestos
- Generación asistida con IA
- Wizard de 3 pasos
- PDF profesional descargable
- Versionado automático

### Facturación
- Numeración automática
- Integración Verifactu (AEAT)
- PDF con requisitos legales
- Estados: Borrador → Enviada → Pagada/Vencida

### Sistema de Alertas
- Deadlines próximos
- Facturas vencidas
- Presupuestos aprobados/rechazados

## Licencia

Propietario - Anclora Cognitive Solutions S.L.
