import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('defaults to light mode (no data-theme attribute)', async ({ page }) => {
    const theme = await page.locator('html').getAttribute('data-theme');
    expect(theme).toBeNull();
  });

  test('clicking theme toggle switches to dark mode', async ({ page }) => {
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('clicking theme toggle twice returns to light mode', async ({ page }) => {
    await page.click('#theme-toggle');
    await page.click('#theme-toggle');
    const theme = await page.locator('html').getAttribute('data-theme');
    expect(theme).toBeNull();
  });

  test('dark mode persists across page reload', async ({ page }) => {
    await page.click('#theme-toggle');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('dark mode persists across navigation', async ({ page }) => {
    await page.click('#theme-toggle');
    await page.goto('/privacy.html');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('theme toggle button text changes for dark mode', async ({ page }) => {
    // Light mode shows moon symbol
    const lightText = await page.locator('#theme-toggle').textContent();
    expect(lightText).toContain('\u263E'); // moon

    await page.click('#theme-toggle');

    // Dark mode shows sun symbol
    const darkText = await page.locator('#theme-toggle').textContent();
    expect(darkText).toContain('\u2600'); // sun
  });

  test('localStorage stores pn-theme value', async ({ page }) => {
    await page.click('#theme-toggle');
    const stored = await page.evaluate(() => localStorage.getItem('pn-theme'));
    expect(stored).toBe('dark');

    await page.click('#theme-toggle');
    const storedLight = await page.evaluate(() => localStorage.getItem('pn-theme'));
    expect(storedLight).toBe('light');
  });
});
