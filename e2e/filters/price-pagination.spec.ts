// spec: specs/filters.md
// seed: e2e/seed.spec.ts
import { test, expect } from '@playwright/test';
import { waitForPriceResponse } from '../helpers/price';

test.describe('Price Range', () => {
  test('Price filter resets pagination to page 1', async ({ page }) => {
    // CONFIRMED APP BUG (chromium, firefox, webkit): after changing the price on Page-3,
    // the list returns to page 1 content but `ul.pagination li.active` still highlights "3".
    // The final assertion is the correct behavior; remove test.fail() once the app is fixed.
    test.fail();

    await page.goto('/');
    await expect(page.locator('[data-test="product-name"]').first()).toBeVisible();

    const names = page.locator('[data-test="product-name"]');
    const activePage = page.locator('ul.pagination li.active');
    const maxHandle = page.getByRole('slider', { name: 'ngx-slider-max' });

    const page1Names = await names.allTextContents();

    // 1. Click Page-3
    await page.getByRole('button', { name: 'Page-3' }).click();
    await expect(activePage).toHaveText('3');
    await expect.poll(async () => (await names.allTextContents())[0]).not.toBe(page1Names[0]);

    // ... then change the price max
    await maxHandle.click();
    const reload = waitForPriceResponse(page, 1, 80);
    await maxHandle.press('PageDown');
    await expect(maxHandle).toHaveAttribute('aria-valuenow', '80');
    await reload;

    // Results return to page 1; no empty page shown
    await expect(page.getByText('There are no products found.')).toHaveCount(0);
    await expect(names.first()).toBeVisible();
    await expect.poll(async () => await names.allTextContents()).toEqual(page1Names);
    // Pagination indicator must also return to page 1
    // (KNOWN APP BUG: the "3" stays highlighted while page 1 content is shown)
    await expect(activePage).toHaveText('1');
  });
});
