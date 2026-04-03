import { test, expect } from '@playwright/test';

test.describe('Mobile viewport', () => {
  test('three-dot menu opens, shows language switcher and dark mode toggle', async ({ page }) => {
    await page.goto('/');

    // Desktop nav items should be hidden at mobile width
    await expect(page.locator('.nav > .theme-toggle')).toBeHidden();
    await expect(page.locator('.nav > .lang-switcher')).toBeHidden();

    // Three-dot menu should be visible
    const moreBtn = page.locator('.mobile-more-trigger');
    await expect(moreBtn).toBeVisible();

    // Open the mobile more menu
    await moreBtn.click();
    const moreMenu = page.locator('#mobile-more-menu');
    await expect(moreMenu).toHaveClass(/open/);

    // Dark mode toggle is visible inside the menu
    await expect(page.locator('#theme-toggle-mobile')).toBeVisible();

    // Language trigger is visible inside the menu
    await expect(page.locator('#mobile-lang-trigger')).toBeVisible();

    // Open mobile language menu
    await page.locator('#mobile-lang-trigger').click();
    await expect(page.locator('#mobile-lang-menu')).toHaveClass(/open/);
  });

  test('dark mode works via mobile menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('.mobile-more-trigger').click();
    await page.locator('#theme-toggle-mobile').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
