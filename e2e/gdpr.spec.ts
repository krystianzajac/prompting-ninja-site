import { test, expect } from '@playwright/test';

test.describe('GDPR privacy banner', () => {
  test('shows when pn-privacy-ok not in localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await expect(page.locator('#privacy-notice')).toBeVisible();
  });

  test('hidden when pn-privacy-ok is set', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('pn-privacy-ok', '1'));
    await page.goto('/');
    await expect(page.locator('#privacy-notice')).toBeHidden();
  });

  test('clicking Got it hides the banner', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await expect(page.locator('#privacy-notice')).toBeVisible();
    await page.click('#privacy-notice button');
    await expect(page.locator('#privacy-notice')).toBeHidden();
  });

  test('clicking Got it saves pn-privacy-ok to localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.click('#privacy-notice button');
    const stored = await page.evaluate(() => localStorage.getItem('pn-privacy-ok'));
    expect(stored).toBe('1');
  });

  test('banner stays dismissed after page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.click('#privacy-notice button');
    await page.reload();
    await expect(page.locator('#privacy-notice')).toBeHidden();
  });

  test('banner shows on all pages when not accepted', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Check homepage
    await page.goto('/');
    await expect(page.locator('#privacy-notice')).toBeVisible();

    // Check privacy page
    await page.goto('/privacy.html');
    await expect(page.locator('#privacy-notice')).toBeVisible();

    // Check locale page
    await page.goto('/pl/');
    await expect(page.locator('#privacy-notice')).toBeVisible();
  });
});
