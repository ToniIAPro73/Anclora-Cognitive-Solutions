# Configuración CI/CD - GitHub Actions

## Secrets Requeridos

Para que el pipeline de CI/CD funcione correctamente, necesitas configurar los siguientes secrets en tu repositorio de GitHub.

### Pasos para configurar secrets:

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Añade cada uno de los siguientes secrets:

---

## Secrets de Supabase

| Secret Name | Descripción | Dónde encontrarlo |
|-------------|-------------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | Supabase Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (admin) | Supabase Dashboard → Settings → API → service_role key |

---

## Secrets de Testing

| Secret Name | Descripción | Valor sugerido |
|-------------|-------------|----------------|
| `TEST_ADMIN_EMAIL` | Email del usuario admin de pruebas | `admin@anclora.app` o tu email de admin |
| `TEST_ADMIN_PASSWORD` | Contraseña del usuario admin de pruebas | La contraseña del admin de test |

### Crear usuario de pruebas en Supabase:

```sql
-- Ejecutar en Supabase SQL Editor
-- Esto crea un usuario admin para tests E2E

-- 1. Primero, crea el usuario via Supabase Auth Dashboard o:
-- Authentication → Users → Add user
-- Email: admin@anclora.app
-- Password: (tu contraseña segura)

-- 2. Luego, marca al usuario como admin:
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@anclora.app';
```

---

## Secrets de Cobertura (Codecov)

| Secret Name | Descripción | Dónde encontrarlo |
|-------------|-------------|-------------------|
| `CODECOV_TOKEN` | Token de autenticación Codecov | codecov.io → Settings → Repository Upload Token |

### Configurar Codecov:

1. Ve a [codecov.io](https://codecov.io) e inicia sesión con GitHub
2. Selecciona tu repositorio
3. Copia el **Repository Upload Token**
4. Añádelo como secret `CODECOV_TOKEN` en GitHub

---

## Secrets Opcionales

| Secret Name | Descripción | Necesario para |
|-------------|-------------|----------------|
| `CRON_SECRET` | Token para proteger endpoints cron | Alertas automáticas (producción) |
| `RESEND_API_KEY` | API key de Resend | Tests de email |

---

## Verificar Configuración

Después de configurar los secrets, puedes verificar que todo funciona:

1. **Manualmente:** Haz push de un commit o crea un PR
2. **Ver resultados:** Ve a la pestaña **Actions** en tu repositorio

### Estructura del Pipeline:

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   lint-and-type-check   │     │      unit-tests         │
└───────────┬─────────────┘     │   + Codecov upload      │
            │                   └───────────┬─────────────┘
            │                               │
            └───────────────┬───────────────┘
                            │
                            ▼
            ┌─────────────────────────┐
            │         build           │
            └───────────┬─────────────┘
                        │
                        ▼
            ┌─────────────────────────┐
            │       e2e-tests         │
            └───────────┬─────────────┘
                        │
                        ▼
            ┌─────────────────────────┐
            │       ci-success        │
            │  (branch protection)    │
            └─────────────────────────┘
```

---

## Configuración Local para Tests

Para correr los tests E2E localmente, crea un archivo `.env.test.local`:

```bash
# .env.test.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
TEST_ADMIN_EMAIL=admin@anclora.app
TEST_ADMIN_PASSWORD=tu-password-seguro
```

Luego ejecuta:

```bash
# Correr todos los tests E2E
pnpm test:e2e

# Correr con UI interactiva
pnpm test:e2e:ui

# Correr solo un archivo
pnpm test:e2e tests/e2e/auth.spec.ts
```

---

## Troubleshooting

### Error: "Credenciales incorrectas" en tests

1. Verifica que el usuario existe en Supabase Auth
2. Verifica que la contraseña es correcta
3. Verifica que el usuario tiene rol admin en `user_metadata`

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"

1. Verifica que los secrets están configurados en GitHub
2. Los nombres deben coincidir exactamente (case-sensitive)

### Tests fallan en CI pero pasan localmente

1. Verifica que todos los secrets están configurados
2. Revisa los logs en GitHub Actions
3. Descarga los artifacts (screenshots) para ver qué falló
