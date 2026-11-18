// spec: specs/filters.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Sort', () => {
  test('Sort persists across pagination', async ({ page }) => {
    await page.goto('/');
    const prices = page.locator('[data-test="product-price"]');
    await expect(prices.first()).toBeVisible();
    const sort = page.locator('[data-test="sort"]');

    const readPrices = async () =>
      (await prices.allTextContents()).map((p) => parseFloat(p.replace(/[^0-9.]/g, '')));

    // 1. Select 'Price (High - Low)'
    await sort.selectOption('Price (High - Low)');
    await expect
      .poll(async () => {
        const v = await readPrices();
        return v.length === 9 && v.every((x, i) => i === 0 || v[i - 1] >= x);
      })
      .toBe(true);
    const page1 = await readPrices();

    // 2. Click Page-2
    await page.getByRole('button', { name: 'Page-2' }).click();
    await expect.poll(async () => (await readPrices())[0]).not.toBe(page1[0]);

    // Expect: page 2 first price <= page 1 last price, and sort option stays selected
    const page2 = await readPrices();
    expect(page2[0]).toBeLessThanOrEqual(page1[page1.length - 1]);
    expect(page2.every((x, i) => i === 0 || page2[i - 1] >= x)).toBe(true);
    await expect(sort).toHaveValue('price,desc');
    await expect(sort.locator('option:checked')).toHaveText('Price (High - Low)');
  });
});
