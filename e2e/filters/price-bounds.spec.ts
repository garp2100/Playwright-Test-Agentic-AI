// spec: specs/filters.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';
import { waitForPriceResponse } from '../helpers/price';

test.describe('Price Range', () => {
  test('Slider extreme bounds', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

    const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });
    const prices = page.locator('[data-test="product-price"]');

    // Sort high-low up front so products above 100 appear on the first page. The app sends
    // every slider-triggered reload with the sort param, so late/out-of-order responses
    // (observed after key bursts) cannot replace the list with an unsorted one.
    const sortReload = page.waitForResponse(
      (r) =>
        r.url().startsWith('https://api.practicesoftwaretesting.com/products') &&
        (r.url() + (r.request().postData() ?? '')).includes('price,desc')
    );
    await page.locator('[data-test="sort"]').selectOption('price,desc');
    await sortReload;

    // 1. Focus max handle press End; focus min handle press Home
    await maxHandle.click();
    await maxHandle.press('End');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '200');
    // Handles never exceed limits
    await maxHandle.press('ArrowRight');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '200');

    await minHandle.click();
    const fullRangeReload = waitForPriceResponse(page, 0, 200);
    await minHandle.press('Home');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '0');
    await fullRangeReload;
    await minHandle.press('ArrowLeft');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '0');

    // Range is 0-200
    await expect(minHandle).toHaveAttribute('aria-valuenow', '0');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '200');

    // Products above 100 are listed
    await expect
      .poll(async () => {
        const list = (await prices.allTextContents()).map((t) => parseFloat(t.replace('$', '').trim()));
        return list.length > 0 && list[0] > 100 && list.every((p) => p <= 200);
      })
      .toBe(true);
  });
});
