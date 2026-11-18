// spec: specs/filters.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Sort', () => {
  test('Sort by Name A-Z', async ({ page }) => {
    await page.goto('/');
    const names = page.locator('[data-test="product-name"]');
    await expect(names.first()).toBeVisible();
    const sort = page.locator('[data-test="sort"]');

    // 1. Select 'Name (A - Z)'
    await sort.selectOption('Name (A - Z)');

    // Expect: product list reloads with names ascending
    await expect(names.first()).toHaveText('Adjustable Wrench');
    await expect(names).toHaveCount(9);
    const actual = (await names.allTextContents()).map((n) => n.trim());
    const expected = [...actual].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    expect(actual).toEqual(expected);
  });
});
