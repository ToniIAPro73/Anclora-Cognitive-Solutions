import { test as base, expect, type Page } from '@playwright/test'

// Test credentials - these should be set up in your test environment
export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@anclora.app',
  password: process.env.TEST_ADMIN_PASSWORD || 'testpassword123',
}

export const TEST_CLIENT = {
  email: process.env.TEST_CLIENT_EMAIL || 'cliente@example.com',
}

// Custom test fixture with authenticated admin
export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ page }, use: (page: Page) => Promise<void>) => {
    // Go to login page
    await page.goto('/login')

    // Fill in credentials
    await page.fill('input[id="email"]', TEST_ADMIN.email)
    await page.fill('input[id="password"]', TEST_ADMIN.password)

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 10000 })

    // Use the authenticated page
    await use(page)
  },
})

export { expect }

// Helper to wait for toast notification
export async function waitForToast(page: Page, text: string) {
  await page.waitForSelector(`text=${text}`, { timeout: 5000 })
}

// Helper to check if user is logged in
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForURL('**/dashboard**', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}
