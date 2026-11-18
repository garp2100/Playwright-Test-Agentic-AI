// spec: specs/filters.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Sort', () => {
  test('Sort by CO2 rating', async ({ page }) => {
    await page.goto('/');
    const names = page.locator('[data-test="product-name"]');
    await expect(names.first()).toBeVisible();
    const sort = page.locator('[data-test="sort"]');

    const readNames = async () => (await names.allTextContents()).map((n) => n.trim());
    const defaultOrder = await readNames();

    // 1. Select 'CO₂ Rating (A - E)'
    await sort.selectOption('CO₂ Rating (A - E)');
    await expect(sort).toHaveValue('co2_rating,asc');
    await expect.poll(readNames).not.toEqual(defaultOrder);
    await expect(names).toHaveCount(9);
    const ascOrder = await readNames();

    // 2. Select 'CO₂ Rating (E - A)'
    await sort.selectOption('CO₂ Rating (E - A)');
    await expect(sort).toHaveValue('co2_rating,desc');

    // Expect: list reorders and the order differs from the A-E result
    await expect.poll(readNames).not.toEqual(ascOrder);
    await expect(names).toHaveCount(9);
    const descOrder = await readNames();
    expect(descOrder[0]).not.toEqual(ascOrder[0]);
  });
});
