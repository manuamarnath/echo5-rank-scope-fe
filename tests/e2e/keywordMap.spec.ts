import { test, expect } from '@playwright/test';

test('keyword map page loads', async ({ page }) => {
  await page.goto('/keyword-map');
  await expect(page.getByText('Keyword Map')).toBeVisible();
});
