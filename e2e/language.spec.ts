import { test, expect } from '@playwright/test';

test.describe('Language switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('desktop lang-switcher opens on click', async ({ page }) => {
    await page.goto('/');
    await page.click('#desktop-lang-trigger');
    await expect(page.locator('#desktop-lang-menu')).toHaveClass(/open/);
  });

  test('desktop lang-switcher has 11 language links', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('#desktop-lang-menu .lang-option');
    await expect(links).toHaveCount(11);
  });

  test('clicking a locale link navigates to that locale', async ({ page }) => {
    await page.goto('/');
    await page.click('#desktop-lang-trigger');
    await page.click('#desktop-lang-menu a[href="/pl/"]');
    await expect(page).toHaveURL(/\/pl\//);
  });

  test('locale page shows correct active language', async ({ page }) => {
    await page.goto('/pl/');
    const activeLink = page.locator('#desktop-lang-menu .lang-option.active');
    await expect(activeLink).toHaveAttribute('href', '/pl/');
  });

  test('Polish page has Polish hero text, not English', async ({ page }) => {
    await page.goto('/pl/');
    const heroTitle = await page.locator('[data-i18n="hero_title"]').textContent();
    expect(heroTitle).toContain('Twoje');
    expect(heroTitle).not.toContain('Your best AI prompts');
  });
});

test.describe('Language persistence', () => {
  test('visiting locale page saves pn-locale to localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/pl/');
    const saved = await page.evaluate(() => localStorage.getItem('pn-locale'));
    expect(saved).toBe('pl');
  });

  test('saved locale redirects from / to locale page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('pn-locale', 'pl'));
    await page.goto('/');
    await page.waitForURL(/\/pl\//);
    expect(page.url()).toContain('/pl/');
  });

  test('clicking English link sets pn-locale to en', async ({ page }) => {
    await page.goto('/pl/');
    // pn-locale is now 'pl'
    await page.click('#desktop-lang-trigger');
    await page.click('#desktop-lang-menu a[href="/"]');
    await page.waitForURL('/');
    const saved = await page.evaluate(() => localStorage.getItem('pn-locale'));
    expect(saved).toBe('en');
  });

  test('REGRESSION: after visiting Polish then clicking English, / does NOT redirect to /pl/', async ({ page }) => {
    // This was the exact bug: once you visited Polish, you could never get back to English
    // because the redirect always fired.
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // Step 1: Visit Polish page (sets pn-locale = 'pl')
    await page.goto('/pl/');
    const afterPolish = await page.evaluate(() => localStorage.getItem('pn-locale'));
    expect(afterPolish).toBe('pl');

    // Step 2: Click English lang-option link (should set pn-locale = 'en')
    await page.click('#desktop-lang-trigger');
    await page.click('#desktop-lang-menu a[href="/"]');
    await page.waitForURL('/');
    const afterEnglish = await page.evaluate(() => localStorage.getItem('pn-locale'));
    expect(afterEnglish).toBe('en');

    // Step 3: Navigate to / again — must NOT redirect to /pl/
    await page.goto('/');
    // Wait a moment for any redirect to fire
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain('/pl/');
    expect(page.url()).toMatch(/\/$/);
  });

  test('pn-locale=en prevents redirect from /', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('pn-locale', 'en'));
    await page.goto('/');
    await page.waitForTimeout(500);
    expect(page.url()).not.toMatch(/\/(pl|es|pt|uk|fr|de|it|ja|zh|ar)\//);
  });
});
