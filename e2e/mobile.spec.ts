import { test, expect } from '@playwright/test';

// Mobile tests only run in the 'mobile' project (375x667 viewport)
test.describe('Mobile menu', () => {
  test('three-dot button is visible on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.mobile-more-trigger')).toBeVisible();
  });

  test('clicking three-dot button opens mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.click('.mobile-more-trigger');
    await expect(page.locator('#mobile-more-menu')).toHaveClass(/open/);
  });

  test('clicking three-dot button again closes mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.click('.mobile-more-trigger');
    await expect(page.locator('#mobile-more-menu')).toHaveClass(/open/);
    await page.click('.mobile-more-trigger');
    const classes = await page.locator('#mobile-more-menu').getAttribute('class');
    expect(classes).not.toContain('open');
  });

  test('mobile menu has theme toggle', async ({ page }) => {
    await page.goto('/');
    await page.click('.mobile-more-trigger');
    await expect(page.locator('#theme-toggle-mobile')).toBeVisible();
  });

  test('mobile menu has language switcher', async ({ page }) => {
    await page.goto('/');
    await page.click('.mobile-more-trigger');
    await expect(page.locator('#mobile-lang-trigger')).toBeVisible();
  });

  test('mobile lang menu opens and has 11 links', async ({ page }) => {
    await page.goto('/');
    await page.click('.mobile-more-trigger');
    await page.click('#mobile-lang-trigger');
    await expect(page.locator('#mobile-lang-menu')).toHaveClass(/open/);
    await expect(page.locator('#mobile-lang-menu .lang-option')).toHaveCount(11);
  });

  test('mobile theme toggle works', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
    await page.click('.mobile-more-trigger');
    await page.click('#theme-toggle-mobile');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('clicking outside mobile menu closes it', async ({ page }) => {
    await page.goto('/');
    await page.click('.mobile-more-trigger');
    await expect(page.locator('#mobile-more-menu')).toHaveClass(/open/);
    await page.click('body', { position: { x: 10, y: 300 } });
    const classes = await page.locator('#mobile-more-menu').getAttribute('class');
    expect(classes).not.toContain('open');
  });
});
