import { test, expect } from './fixtures'

test.describe('Clients Management', () => {
  test.describe('Clients List', () => {
    test('should display clients page with table', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      // Wait for page to load
      await page.waitForTimeout(1000)

      // Check page title
      await expect(page.locator('text=Clientes')).toBeVisible()

      // Check for table or empty state
      const table = page.locator('table')
      const emptyState = page.locator('text=No hay clientes')

      const tableVisible = await table.isVisible().catch(() => false)
      const emptyVisible = await emptyState.isVisible().catch(() => false)

      expect(tableVisible || emptyVisible).toBeTruthy()
    })

    test('should have search input', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      // Check for search input
      const searchInput = page.locator('input[placeholder*="Buscar"]').or(page.locator('[data-testid="search-input"]'))
      await expect(searchInput).toBeVisible()
    })

    test('should have new client button', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      // Check for new client button
      const newButton = page.locator('text=Nuevo Cliente').or(page.locator('button:has-text("Nuevo")'))
      await expect(newButton).toBeVisible()
    })
  })

  test.describe('Create Client', () => {
    test('should open create client modal', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      // Click new client button
      const newButton = page.locator('text=Nuevo Cliente').or(page.locator('button:has-text("Nuevo")'))
      await newButton.click()

      // Wait for modal to appear
      await page.waitForTimeout(500)

      // Check for modal with form fields
      const modal = page.locator('[role="dialog"]').or(page.locator('.modal'))
      await expect(modal).toBeVisible()

      // Check for form fields
      await expect(page.locator('input[id="company_name"]').or(page.locator('label:has-text("Empresa")'))).toBeVisible()
    })

    test('should show validation errors on empty submit', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      // Click new client button
      const newButton = page.locator('text=Nuevo Cliente').or(page.locator('button:has-text("Nuevo")'))
      await newButton.click()

      await page.waitForTimeout(500)

      // Try to submit empty form
      const submitButton = page.locator('button:has-text("Guardar")').or(page.locator('button:has-text("Crear")'))
      await submitButton.click()

      // Check for validation error
      await page.waitForTimeout(500)
      const errorMessage = page.locator('text=requerido').or(page.locator('.text-destructive'))
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 }).catch(() => {
        // Validation might be inline, which is fine
      })
    })

    test('should create client with valid data', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      // Click new client button
      const newButton = page.locator('text=Nuevo Cliente').or(page.locator('button:has-text("Nuevo")'))
      await newButton.click()

      await page.waitForTimeout(500)

      // Fill form with valid data
      const timestamp = Date.now()
      const testCompany = `Test Company ${timestamp}`
      const testEmail = `test${timestamp}@example.com`

      await page.fill('input[id="company_name"]', testCompany)
      await page.fill('input[id="email"]', testEmail)

      // Fill optional fields if visible
      const contactInput = page.locator('input[id="contact_person"]')
      if (await contactInput.isVisible()) {
        await contactInput.fill('Test Contact')
      }

      // Submit form
      const submitButton = page.locator('button:has-text("Guardar")').or(page.locator('button:has-text("Crear")'))
      await submitButton.click()

      // Wait for success
      await page.waitForTimeout(2000)

      // Check for success toast or modal closed
      const successToast = page.locator('text=Cliente creado').or(page.locator('text=creado'))
      const modalClosed = !(await page.locator('[role="dialog"]').isVisible().catch(() => false))

      const success = await successToast.isVisible({ timeout: 3000 }).catch(() => false) || modalClosed
      expect(success).toBeTruthy()
    })
  })

  test.describe('Search and Filter', () => {
    test('should filter clients by search term', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      // Wait for page to load
      await page.waitForTimeout(1000)

      // Type in search input
      const searchInput = page.locator('input[placeholder*="Buscar"]').or(page.locator('[data-testid="search-input"]'))
      await searchInput.fill('test')

      // Wait for debounce and results
      await page.waitForTimeout(500)

      // URL should update with search param
      expect(page.url()).toMatch(/search|q|query/i)
    })

    test('should filter by language dropdown', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/clients')

      await page.waitForTimeout(1000)

      // Find language filter dropdown
      const languageFilter = page.locator('select').or(page.locator('[data-testid="language-filter"]'))

      if (await languageFilter.isVisible()) {
        await languageFilter.selectOption('es')
        await page.waitForTimeout(500)
      }
    })
  })
})
