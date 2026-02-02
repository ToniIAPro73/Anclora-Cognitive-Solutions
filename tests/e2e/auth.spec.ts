import { test, expect, TEST_ADMIN, waitForToast } from './fixtures'

test.describe('Authentication', () => {
  test.describe('Admin Login', () => {
    test('should show login page correctly', async ({ page }) => {
      await page.goto('/login')

      // Check page elements
      await expect(page.locator('text=Anclora')).toBeVisible()
      await expect(page.locator('text=Inicia sesión')).toBeVisible()
      await expect(page.locator('input[id="email"]')).toBeVisible()
      await expect(page.locator('input[id="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show validation errors for invalid email', async ({ page }) => {
      await page.goto('/login')

      // Fill invalid email
      await page.fill('input[id="email"]', 'invalid-email')
      await page.fill('input[id="password"]', 'password123')
      await page.click('button[type="submit"]')

      // Check for validation error
      await expect(page.locator('text=Email inválido')).toBeVisible()
    })

    test('should show validation errors for short password', async ({ page }) => {
      await page.goto('/login')

      // Fill short password
      await page.fill('input[id="email"]', 'test@example.com')
      await page.fill('input[id="password"]', 'short')
      await page.click('button[type="submit"]')

      // Check for validation error
      await expect(page.locator('text=La contraseña debe tener al menos 8 caracteres')).toBeVisible()
    })

    test('should show error toast for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      // Fill incorrect credentials
      await page.fill('input[id="email"]', 'wrong@example.com')
      await page.fill('input[id="password"]', 'wrongpassword123')
      await page.click('button[type="submit"]')

      // Wait for error toast
      await expect(page.locator('text=Credenciales incorrectas')).toBeVisible({ timeout: 5000 })
    })

    test('should redirect to dashboard after successful login', async ({ page }) => {
      await page.goto('/login')

      // Fill correct credentials
      await page.fill('input[id="email"]', TEST_ADMIN.email)
      await page.fill('input[id="password"]', TEST_ADMIN.password)
      await page.click('button[type="submit"]')

      // Wait for redirect
      await page.waitForURL('**/dashboard**', { timeout: 10000 })

      // Verify we're on dashboard
      expect(page.url()).toContain('/dashboard')
    })

    test('should have link to client portal login', async ({ page }) => {
      await page.goto('/login')

      // Check for client portal link
      const portalLink = page.locator('a[href="/portal/login"]')
      await expect(portalLink).toBeVisible()
      await expect(portalLink).toHaveText('Accede aquí')
    })
  })

  test.describe('Logout', () => {
    test('should logout successfully and redirect to login', async ({ authenticatedPage }) => {
      const page = authenticatedPage

      // Find and click logout button (assuming it's in the navbar)
      // The logout button might be in a dropdown menu
      const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button:has-text("Cerrar sesión")'))

      if (await userMenu.isVisible()) {
        await userMenu.click()
      }

      // Look for logout option
      const logoutButton = page.locator('text=Cerrar sesión').or(page.locator('[data-testid="logout-button"]'))
      await logoutButton.click()

      // Should redirect to login
      await page.waitForURL('**/login**', { timeout: 10000 })
      expect(page.url()).toContain('/login')
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      // Try to access dashboard directly
      await page.goto('/dashboard')

      // Should be redirected to login
      await page.waitForURL('**/login**', { timeout: 10000 })
      expect(page.url()).toContain('/login')
    })

    test('should redirect to login when accessing clients page without auth', async ({ page }) => {
      await page.goto('/dashboard/clients')

      // Should be redirected to login
      await page.waitForURL('**/login**', { timeout: 10000 })
      expect(page.url()).toContain('/login')
    })

    test('should redirect to login when accessing kanban without auth', async ({ page }) => {
      await page.goto('/dashboard/kanban')

      // Should be redirected to login
      await page.waitForURL('**/login**', { timeout: 10000 })
      expect(page.url()).toContain('/login')
    })
  })
})
