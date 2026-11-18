// spec: specs/filters.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';
import { waitForPriceResponse } from '../helpers/price';

test.describe('Price Range', () => {
  test('Lower the max handle with keyboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

    const minHandle = page.getByRole('slider', { name: 'ngx-slider', exact: true });
    const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });
    const prices = page.locator('[data-test="product-price"]');
    const emptyState = page.getByText('There are no products found.');

    const readPrices = async () =>
      (await prices.allTextContents()).map((t) => parseFloat(t.replace('$', '').trim()));

    // 1. Click handle 'ngx-slider-max' and press ArrowLeft
    await maxHandle.click();
    const firstReload = waitForPriceResponse(page, 1, 99);
    await maxHandle.press('ArrowLeft');
    await firstReload;

    // Max label becomes 99; list reloads and all prices <= 99
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '99');
    await expect(prices.first()).toBeVisible();
    await expect.poll(async () => (await readPrices()).every((p) => p <= 99)).toBe(true);

    // 2. Press the max handle down repeatedly until it reaches the min handle
    // (PageDown moves the handle by 10% of the scale, i.e. 20 units)
    // Pushing the max handle to the bottom drags the min handle along: final range is 0-0.
    const finalReload = waitForPriceResponse(page, 0, 0);
    for (let i = 0; i < 6; i++) {
      await maxHandle.press('PageDown');
    }
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '0');
    await expect(minHandle).toHaveAttribute('aria-valuenow', '0');
    await finalReload;

    // Handles cannot cross
    await expect
      .poll(async () => {
        const min = Number(await minHandle.getAttribute('aria-valuenow'));
        const max = Number(await maxHandle.getAttribute('aria-valuenow'));
        return min <= max;
      })
      .toBe(true);
    const min = Number(await minHandle.getAttribute('aria-valuenow'));
    const max = Number(await maxHandle.getAttribute('aria-valuenow'));
    expect(max).toBeLessThanOrEqual(1);

    // List shows in-range products or the empty state
    await expect
      .poll(async () => {
        if (await emptyState.isVisible()) return true;
        const list = await readPrices();
        return list.length > 0 && list.every((p) => p >= min && p <= max);
      })
      .toBe(true);
  });
});
