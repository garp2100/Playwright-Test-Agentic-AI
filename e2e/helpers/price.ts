import type { Page, Response } from '@playwright/test';

const PRODUCTS_API = 'https://api.practicesoftwaretesting.com/products';

/**
 * Waits for the products list API call (an HTTP QUERY request whose filters are
 * in the request body) for the exact price range. Create the promise BEFORE the
 * key press that triggers it.
 */
export function waitForPriceResponse(page: Page, min: number, max: number): Promise<Response> {
  return page.waitForResponse((r) => {
    if (!r.url().startsWith(PRODUCTS_API)) return false;
    return (r.request().postData() ?? '').includes(`"between":"price,${min},${max}"`);
  });
}
