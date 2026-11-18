// spec: specs/filters.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';
import { waitForPriceResponse } from '../helpers/price';

test.describe('Price Range', () => {
  test('Raise min handle excludes cheap products', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

    const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    const prices = page.locator('[data-test="product-price"]');

    // 1. Focus handle 'ngx-slider' (min), press ArrowRight to about 50
    await minHandle.click();
    // PageUp moves the handle by 20 units: 1 -> 21 -> 41
    await minHandle.press('PageUp');
    await minHandle.press('PageUp');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '41');
    // Nine single steps: 41 -> 50
    for (let value = 42; value <= 50; value++) {
      await minHandle.press('ArrowRight');
      await expect(minHandle).toHaveAttribute('aria-valuenow', String(value));
    }
    // One more step so the final request is unambiguous (50 -> 51)
    const reload = waitForPriceResponse(page, 51, 100);
    await minHandle.press('ArrowRight');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '51');
    await reload;

    // All prices >= handle value; cheap products are excluded
    await expect(prices.first()).toBeVisible();
    await expect
      .poll(async () => {
        const list = (await prices.allTextContents()).map((t) => parseFloat(t.replace('$', '').trim()));
        return list.length > 0 && list.every((p) => p >= 50);
      })
      .toBe(true);

    // Pagination updates: the filtered result fits on a single page, so there are no page buttons
    await expect(page.getByRole('button', { name: 'Page-2' })).toHaveCount(0);
  });
});
