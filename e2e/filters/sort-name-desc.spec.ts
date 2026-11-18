// spec: specs/filters.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Sort', () => {
  test('Sort by Name Z-A', async ({ page }) => {
    await page.goto('/');
    const names = page.locator('[data-test="product-name"]');
    await expect(names.first()).toBeVisible();

    // 1. Select 'Name (Z - A)'
    await page.locator('[data-test="sort"]').selectOption('Name (Z - A)');

    // Expect: names on page 1 are in descending alphabetical order
    await expect
      .poll(async () => {
        const actual = (await names.allTextContents()).map((n) => n.trim());
        const expected = [...actual].sort((a, b) => b.toLowerCase().localeCompare(a.toLowerCase()));
        return actual.length === 9 && JSON.stringify(actual) === JSON.stringify(expected);
      })
      .toBe(true);
  });
});
