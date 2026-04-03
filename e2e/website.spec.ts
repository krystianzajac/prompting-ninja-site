import { test, expect } from '@playwright/test';

test.describe('English homepage', () => {
  test('loads and shows hero title', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h2[data-i18n="hero_title"]');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Your best AI prompts');
  });

  test('has correct lang attribute', async ({ page }) => {
    await page.goto('/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });
});

test.describe('Polish page', () => {
  test('loads with Polish content, not English', async ({ page }) => {
    await page.goto('/pl/');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('pl');

    const hero = page.locator('h2[data-i18n="hero_title"]');
    await expect(hero).toBeVisible();
    await expect(hero).toContainText('Twoje najlepsze prompty AI');
    // Must not contain English text
    await expect(hero).not.toContainText('Your best AI prompts');
  });
});

test.describe('Language switcher', () => {
  test('clicking English on Polish page navigates to /', async ({ page }) => {
    await page.goto('/pl/');
    // Open the desktop language menu
    await page.locator('#desktop-lang-trigger').click();
    await expect(page.locator('#desktop-lang-menu')).toHaveClass(/open/);

    // Click English option
    await page.locator('#desktop-lang-menu .lang-option[href="/"]').click();
    await page.waitForURL('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('en');
  });
});

test.describe('Dark mode', () => {
  test('toggle sets data-theme="dark", persists on reload', async ({ page }) => {
    await page.goto('/');
    // Initially no dark theme
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');

    // Click the theme toggle
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Reload and verify persistence
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('toggling back removes dark theme', async ({ page }) => {
    await page.goto('/');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  });
});

test.describe('Install section', () => {
  test('install section visible with download link', async ({ page }) => {
    await page.goto('/');
    const install = page.locator('#install');
    await expect(install).toBeVisible();

    const downloadLink = page.locator('a[href="prompting-ninja.zip"][download]').first();
    await expect(downloadLink).toBeVisible();
  });
});

test.describe('GDPR banner', () => {
  test('shows on first visit and is dismissible', async ({ page }) => {
    // Clear any prior localStorage
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('pn-privacy-ok'));
    await page.reload();

    const banner = page.locator('#privacy-notice');
    await expect(banner).toBeVisible();

    // Click "Got it"
    await banner.locator('button').click();
    await expect(banner).toBeHidden();

    // Reload - banner should not reappear
    await page.reload();
    await expect(banner).toBeHidden();
  });
});

test.describe('Dark mode contrast', () => {
  /** Parse an rgb/rgba string into [r, g, b] */
  function parseRgb(color: string): [number, number, number] {
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return [0, 0, 0];
    return [Number(m[1]), Number(m[2]), Number(m[3])];
  }

  /** Relative luminance per WCAG 2.0 */
  function luminance([r, g, b]: [number, number, number]): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /** Contrast ratio between two colours (>= 1) */
  function contrastRatio(a: string, b: string): number {
    const la = luminance(parseRgb(a));
    const lb = luminance(parseRgb(b));
    const lighter = Math.max(la, lb);
    const darker = Math.min(la, lb);
    return (lighter + 0.05) / (darker + 0.05);
  }

  test('key elements have readable text in dark mode', async ({ page }) => {
    await page.goto('/');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Check contrast on representative elements
    const selectors = [
      { name: 'hero title', sel: 'h2[data-i18n="hero_title"]' },
      { name: 'feature card', sel: '.feature h4' },
      { name: 'testimonial text', sel: '.testimonial-text' },
      { name: 'faq item title', sel: '.faq-item h4' },
    ];

    for (const { name, sel } of selectors) {
      const el = page.locator(sel).first();
      await expect(el).toBeVisible();

      const styles = await el.evaluate((node) => {
        const cs = window.getComputedStyle(node);
        return { color: cs.color, bg: cs.backgroundColor };
      });

      // If bg is transparent, walk up to find an opaque ancestor
      let bg = styles.bg;
      if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
        bg = await el.evaluate((node) => {
          let current = node.parentElement;
          while (current) {
            const cs = window.getComputedStyle(current);
            if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
              return cs.backgroundColor;
            }
            current = current.parentElement;
          }
          return 'rgb(0, 0, 0)'; // fallback to black for dark mode body
        });
      }

      const ratio = contrastRatio(styles.color, bg);
      // WCAG AA requires >= 4.5 for normal text, >= 3 for large text
      // We use 3 as the floor since headings count as large text
      expect(ratio, `${name}: color=${styles.color} bg=${bg} ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
    }
  });
});

test.describe('Privacy page nav consistency', () => {
  test('privacy page has same nav elements as homepage', async ({ page }) => {
    // Collect nav element presence on homepage
    await page.goto('/');
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('#theme-toggle')).toBeVisible();
    await expect(page.locator('#lang-switcher')).toBeVisible();
    await expect(page.locator('.nav-cta')).toBeVisible();

    // Now check privacy page has the same elements
    await page.goto('/privacy.html');
    await expect(page.locator('.logo')).toBeVisible();
    await expect(page.locator('#theme-toggle')).toBeVisible();
    await expect(page.locator('#lang-switcher')).toBeVisible();
    await expect(page.locator('.nav-cta')).toBeVisible();

    // Verify logo links home
    const logoHref = await page.locator('.logo').getAttribute('href');
    expect(logoHref).toBe('/');
  });
});
