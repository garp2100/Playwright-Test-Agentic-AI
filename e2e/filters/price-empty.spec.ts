// spec: specs/filters.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';
import { waitForPriceResponse } from '../helpers/price';

test.describe('Price Range', () => {
  test('Narrow range yielding no products', async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.goto('/');
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

    const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });
    const productNames = page.locator('[data-test="product-name"]');
    const pageButtons = page.getByRole('button', { name: /^Page-\d+$/ });

    // 1. Set min near 190, max 200
    await maxHandle.click();
    await maxHandle.press('End');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '200');

    await minHandle.click();
    // PageUp moves the handle by 20 units: 1 -> 21 -> ... -> 181
    for (let value = 21; value <= 181; value += 20) {
      await minHandle.press('PageUp');
      await expect(minHandle).toHaveAttribute('aria-valuenow', String(value));
    }
    // Single steps up to 191 (the app only applies the filter reliably after the last step)
    for (let value = 182; value <= 190; value++) {
      await minHandle.press('ArrowRight');
      await expect(minHandle).toHaveAttribute('aria-valuenow', String(value));
    }
    const reload = waitForPriceResponse(page, 191, 200);
    await minHandle.press('ArrowRight');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '191');
    await reload;

    // No products found, no pagination, no errors
    await expect(page.getByText('There are no products found.')).toBeVisible();
    await expect(productNames).toHaveCount(0);
    await expect(pageButtons).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });
});
