// spec: specs/filters.md
// seed: e2e/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Sort', () => {
  test('Default sort option is blank', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

    // 1. Inspect [data-test="sort"] in the seed state
    const sort = page.locator('[data-test="sort"]');

    // Expect: selected option is the empty placeholder
    await expect(sort).toHaveValue('');
    await expect(sort.locator('option:checked')).toHaveText('');

    // Expect: 7 options total (placeholder + 6 sort options)
    await expect(sort.locator('option')).toHaveCount(7);

    // Expect: 9 products per page
    await expect(page.locator('[data-test="product-name"]')).toHaveCount(9);
  });
});
