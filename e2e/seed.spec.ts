import { test, expect } from '@playwright/test';

/**
 * Seed test for the Playwright agents (planner / generator / healer).
 * It brings the app to a known, fully-loaded starting state; generated
 * tests begin from where this test leaves off.
 */
test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    // Open the Toolshop home page (baseURL from playwright.config.ts).
    await page.goto('/');

    // Wait until the Angular app has rendered the product catalog.
    await expect(page).toHaveTitle(/Practice Software Testing/);
    await expect(page.locator('[data-test="nav-home"]')).toBeVisible();
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();
  });
});
