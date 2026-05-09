import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page and display title', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/小黑助手/)
  })

  test('should navigate through the application', async ({ page }) => {
    await page.goto('/')

    const navLinks = page.locator('nav a')
    await expect(navLinks).toBeVisible()
  })
})
