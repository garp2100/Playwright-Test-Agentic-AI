// spec: specs/filters.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Sort', () => {
  test('Sort by price High-Low and Low-High', async ({ page }) => {
    await page.goto('/');
    const prices = page.locator('[data-test="product-price"]');
    await expect(prices.first()).toBeVisible();
    const sort = page.locator('[data-test="sort"]');

    const readPrices = async () =>
      (await prices.allTextContents()).map((p) => parseFloat(p.replace(/[^0-9.]/g, '')));

    // 1. Select 'Price (High - Low)'
    await sort.selectOption('Price (High - Low)');

    // Expect: prices on page 1 are non-increasing
    await expect
      .poll(async () => {
        const v = await readPrices();
        return v.length === 9 && v.every((x, i) => i === 0 || v[i - 1] >= x);
      })
      .toBe(true);

    // 2. Select 'Price (Low - High)'
    await sort.selectOption('Price (Low - High)');

    // Expect: prices on page 1 are non-decreasing
    await expect
      .poll(async () => {
        const v = await readPrices();
        return v.length === 9 && v.every((x, i) => i === 0 || v[i - 1] <= x);
      })
      .toBe(true);
  });
});
