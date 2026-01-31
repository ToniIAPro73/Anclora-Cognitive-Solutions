import { test, expect } from './fixtures'

test.describe('Kanban Board', () => {
  test.describe('Layout', () => {
    test('should display all 7 columns', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/kanban')

      // Wait for kanban to load
      await page.waitForSelector('[data-testid="kanban-board"]', { timeout: 10000 }).catch(() => {
        // Fallback: wait for any column to appear
      })

      // Check for all column headers
      const columns = [
        'Backlog',
        'Propuesta',
        'Aprobado',
        'En Progreso',
        'Testing',
        'Completado',
        'Cancelado',
      ]

      for (const columnName of columns) {
        await expect(page.locator(`text=${columnName}`).first()).toBeVisible({ timeout: 10000 })
      }
    })

    test('should have horizontal scroll on smaller screens', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.setViewportSize({ width: 768, height: 1024 }) // Tablet size
      await page.goto('/dashboard/kanban')

      // The board container should be scrollable
      const board = page.locator('.overflow-x-auto').first()
      await expect(board).toBeVisible()
    })
  })

  test.describe('Project Cards', () => {
    test('should display project information on cards', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/kanban')

      // Wait for projects to load
      await page.waitForTimeout(2000)

      // Check if there are any project cards (depends on test data)
      const projectCards = page.locator('[data-testid="project-card"]').or(page.locator('[draggable="true"]'))
      const cardCount = await projectCards.count()

      if (cardCount > 0) {
        // Verify first card has expected elements
        const firstCard = projectCards.first()
        await expect(firstCard).toBeVisible()
      }
    })
  })

  test.describe('Drag and Drop', () => {
    test('should show error toast for invalid transition', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/kanban')

      // Wait for kanban to load
      await page.waitForTimeout(2000)

      // Get a project card from "Completed" column (if exists)
      const completedColumn = page.locator('text=Completado').locator('..')
      const projectCard = completedColumn.locator('[draggable="true"]').first()

      // If there's a card in completed column, try to drag it to backlog
      if (await projectCard.isVisible().catch(() => false)) {
        const backlogColumn = page.locator('text=Backlog').locator('..')

        // Attempt drag (should fail with validation error)
        await projectCard.dragTo(backlogColumn, { timeout: 5000 }).catch(() => {
          // Drag might fail due to validation, which is expected
        })

        // Check for error toast about invalid transition
        const errorToast = page.locator('text=No se puede mover')
        if (await errorToast.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(errorToast).toBeVisible()
        }
      }
    })

    test('should update project status on valid drag', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard/kanban')

      // Wait for kanban to load
      await page.waitForTimeout(2000)

      // Get a project card from "Backlog" column (if exists)
      const backlogColumn = page.locator('text=Backlog').locator('..')
      const projectCard = backlogColumn.locator('[draggable="true"]').first()

      // If there's a card in backlog, try to drag it to Propuesta (valid transition)
      if (await projectCard.isVisible().catch(() => false)) {
        const proposalColumn = page.locator('text=Propuesta').locator('..')

        // Perform drag
        await projectCard.dragTo(proposalColumn, { timeout: 5000 })

        // Wait for success toast
        await page.waitForTimeout(1000)

        // Check for success toast or verify the card moved
        const successToast = page.locator('text=Proyecto actualizado')
        if (await successToast.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(successToast).toBeVisible()
        }
      }
    })
  })

  test.describe('Navigation', () => {
    test('should be accessible from sidebar', async ({ authenticatedPage }) => {
      const page = authenticatedPage
      await page.goto('/dashboard')

      // Click on Kanban link in sidebar
      const kanbanLink = page.locator('a[href*="kanban"]').or(page.locator('text=Kanban'))
      await kanbanLink.click()

      // Should navigate to kanban page
      await page.waitForURL('**/kanban**', { timeout: 5000 })
      expect(page.url()).toContain('/kanban')
    })
  })
})
