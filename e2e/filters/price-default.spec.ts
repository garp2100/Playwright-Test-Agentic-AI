// spec: specs/filters.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Price Range', () => {
  test('Default slider bounds', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

    // 1. Inspect the price slider on seed state
    const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });

    await expect(minHandle).toHaveAttribute('aria-valuemin', '0');
    await expect(minHandle).toHaveAttribute('aria-valuemax', '200');
    await expect(maxHandle).toHaveAttribute('aria-valuemin', '0');
    await expect(maxHandle).toHaveAttribute('aria-valuemax', '200');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '1');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '100');

    // Scale labels 0 and 200; handle labels 1 and 100
    const slider = page.locator('ngx-slider');
    for (const label of ['0', '200', '1', '100']) {
      await expect(slider.getByText(label, { exact: true })).toBeVisible();
    }
  });
});
