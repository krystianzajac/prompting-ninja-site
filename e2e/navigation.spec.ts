import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Prompting Ninja/);
  });

  test('nav links are visible on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav a[data-i18n="nav_features"]')).toBeVisible();
    await expect(page.locator('nav a[data-i18n="nav_library"]')).toBeVisible();
    await expect(page.locator('nav a[data-i18n="nav_faq"]')).toBeVisible();
    await expect(page.locator('nav a[data-i18n="nav_privacy"]')).toBeVisible();
    await expect(page.locator('nav a[data-i18n="nav_cta"]')).toBeVisible();
  });

  test('Features anchor link scrolls to section', async ({ page }) => {
    await page.goto('/');
    await page.click('nav a[data-i18n="nav_features"]');
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('Library anchor link scrolls to section', async ({ page }) => {
    await page.goto('/');
    await page.click('nav a[data-i18n="nav_library"]');
    await expect(page.locator('#library')).toBeInViewport();
  });

  test('Privacy link navigates to privacy page', async ({ page }) => {
    await page.goto('/');
    await page.click('nav a[data-i18n="nav_privacy"]');
    await expect(page).toHaveURL(/privacy/);
    await expect(page).toHaveTitle(/Privacy/);
  });

  test('privacy page has same nav links as index', async ({ page }) => {
    await page.goto('/privacy.html');
    await expect(page.locator('nav a[data-i18n="nav_features"]')).toBeAttached();
    await expect(page.locator('nav a[data-i18n="nav_library"]')).toBeAttached();
    await expect(page.locator('nav a[data-i18n="nav_faq"]')).toBeAttached();
    await expect(page.locator('nav a[data-i18n="nav_privacy"]')).toBeAttached();
    await expect(page.locator('nav a[data-i18n="nav_cta"]')).toBeAttached();
  });

  test('logo links to homepage', async ({ page }) => {
    await page.goto('/privacy.html');
    await page.click('.logo');
    await expect(page).toHaveURL('/');
  });
});
