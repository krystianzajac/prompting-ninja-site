#!/usr/bin/env node
/**
 * test-build.js - Smoke tests for build-i18n.js output
 *
 * Verifies that all generated locale pages have correct structure,
 * translations, hreflang tags, canonical URLs, RTL support, and asset paths.
 *
 * Usage: node test-build.js
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const SITE_DIR = __dirname;
const BASE_URL = 'https://promptingninja.ai';
const LOCALES = ['en', 'pl', 'es', 'pt', 'uk', 'fr', 'de', 'it', 'ja', 'zh', 'ar'];
const NON_EN_LOCALES = LOCALES.filter((l) => l !== 'en');

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
  }
}

function readFile(filePath) {
  return fs.readFileSync(path.join(SITE_DIR, filePath), 'utf8');
}

function fileExists(filePath) {
  return fs.existsSync(path.join(SITE_DIR, filePath));
}

// Load translations for verification
const translations = JSON.parse(fs.readFileSync(path.join(SITE_DIR, 'translations.json'), 'utf8'));

// ============================================================
// 1. All locale directories exist with index.html and privacy.html
// ============================================================
for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html exists`, () => {
    assert.ok(fileExists(`${locale}/index.html`), `Missing ${locale}/index.html`);
  });

  test(`${locale}/privacy.html exists`, () => {
    assert.ok(fileExists(`${locale}/privacy.html`), `Missing ${locale}/privacy.html`);
  });
}

test('root index.html exists', () => {
  assert.ok(fileExists('index.html'));
});

test('root privacy.html exists', () => {
  assert.ok(fileExists('privacy.html'));
});

// ============================================================
// 2. Each index.html has correct <html lang="xx">
// ============================================================
test('root index.html has lang="en"', () => {
  const html = readFile('index.html');
  assert.ok(html.includes('lang="en"'), 'Root index.html should have lang="en"');
});

for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html has lang="${locale}"`, () => {
    const html = readFile(`${locale}/index.html`);
    assert.ok(html.includes(`lang="${locale}"`), `${locale}/index.html missing lang="${locale}"`);
  });

  test(`${locale}/privacy.html has lang="${locale}"`, () => {
    const html = readFile(`${locale}/privacy.html`);
    assert.ok(html.includes(`lang="${locale}"`), `${locale}/privacy.html missing lang="${locale}"`);
  });
}

// ============================================================
// 3. Arabic pages have dir="rtl", others do not
// ============================================================
test('ar/index.html has dir="rtl"', () => {
  const html = readFile('ar/index.html');
  assert.ok(/<html[^>]+dir="rtl"/.test(html), 'Arabic index should have dir="rtl" on html element');
});

test('ar/privacy.html has dir="rtl"', () => {
  const html = readFile('ar/privacy.html');
  assert.ok(/<html[^>]+dir="rtl"/.test(html), 'Arabic privacy should have dir="rtl" on html element');
});

for (const locale of LOCALES.filter((l) => l !== 'ar')) {
  const filePath = locale === 'en' ? 'index.html' : `${locale}/index.html`;
  test(`${filePath} does NOT have dir="rtl" on html`, () => {
    const html = readFile(filePath);
    assert.ok(!/<html[^>]+dir="rtl"/.test(html), `${filePath} should not have dir="rtl"`);
  });
}

// ============================================================
// 4. All pages have 12 hreflang tags (x-default + 11 locales)
// ============================================================
for (const locale of LOCALES) {
  const dir = locale === 'en' ? '' : `${locale}/`;
  for (const page of ['index.html', 'privacy.html']) {
    const filePath = `${dir}${page}`;
    test(`${filePath} has 12 hreflang tags`, () => {
      const html = readFile(filePath);
      const hreflangCount = (html.match(/hreflang="/g) || []).length;
      assert.strictEqual(hreflangCount, 12, `Expected 12 hreflang tags, got ${hreflangCount}`);
    });

    test(`${filePath} has x-default hreflang`, () => {
      const html = readFile(filePath);
      assert.ok(html.includes('hreflang="x-default"'), 'Missing x-default hreflang');
    });
  }
}

// ============================================================
// 5. Canonical URLs match the locale
// ============================================================
test('root index.html canonical is base URL', () => {
  const html = readFile('index.html');
  assert.ok(html.includes(`href="${BASE_URL}/"`), 'Root canonical should be base URL');
});

test('root privacy.html canonical points to /privacy.html', () => {
  const html = readFile('privacy.html');
  assert.ok(html.includes(`href="${BASE_URL}/privacy.html"`), 'Root privacy canonical should be /privacy.html');
});

for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html canonical is /${locale}/`, () => {
    const html = readFile(`${locale}/index.html`);
    assert.ok(html.includes(`href="${BASE_URL}/${locale}/"`), `Canonical should be ${BASE_URL}/${locale}/`);
  });

  test(`${locale}/privacy.html canonical is /${locale}/privacy.html`, () => {
    const html = readFile(`${locale}/privacy.html`);
    assert.ok(
      html.includes(`href="${BASE_URL}/${locale}/privacy.html"`),
      `Canonical should be ${BASE_URL}/${locale}/privacy.html`
    );
  });
}

// ============================================================
// 6. data-i18n elements are translated (nav, footer, and any marked body content)
// ============================================================
for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html has translated nav_features (not English)`, () => {
    const html = readFile(`${locale}/index.html`);
    const t = translations[locale];
    assert.ok(html.includes(t.nav_features), `${locale} nav_features should be "${t.nav_features}"`);
  });

  test(`${locale}/index.html has translated nav_cta (not English)`, () => {
    const html = readFile(`${locale}/index.html`);
    const t = translations[locale];
    assert.ok(html.includes(t.nav_cta), `${locale} nav_cta should be "${t.nav_cta}"`);
  });

  test(`${locale}/index.html has translated footer (not English)`, () => {
    const html = readFile(`${locale}/index.html`);
    const t = translations[locale];
    assert.ok(html.includes(t.footer_privacy), `${locale} footer_privacy should be translated`);
    assert.ok(html.includes(t.footer_copy), `${locale} footer_copy should be translated`);
  });

  test(`${locale}/privacy.html has translated nav (not English)`, () => {
    const html = readFile(`${locale}/privacy.html`);
    const t = translations[locale];
    assert.ok(html.includes(t.nav_features), `${locale} privacy nav_features should be translated`);
  });

  // If hero_title is marked with data-i18n, verify it's translated
  test(`${locale}/index.html data-i18n elements have locale content`, () => {
    const html = readFile(`${locale}/index.html`);
    const t = translations[locale];
    // Check all data-i18n elements: none should contain the English translation
    const enT = translations.en;
    const dataI18nMatches = html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]*)/g);
    for (const m of dataI18nMatches) {
      const key = m[1];
      const content = m[2].trim();
      if (enT[key] && t[key] && enT[key] !== t[key]) {
        assert.notStrictEqual(content, enT[key].trim(),
          `${locale} data-i18n="${key}" should not contain English "${enT[key].trim()}"`);
      }
    }
  });
}

// ============================================================
// 7. OG title/description are translated (not English) for locale index pages
// ============================================================
for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html OG title is not English`, () => {
    const html = readFile(`${locale}/index.html`);
    const ogMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/);
    assert.ok(ogMatch, `${locale} should have og:title`);
    // English title starts with "Your best AI prompts"
    assert.ok(!ogMatch[1].startsWith('Your best AI prompts'), `${locale} og:title should be translated`);
  });

  test(`${locale}/index.html OG description is not English`, () => {
    const html = readFile(`${locale}/index.html`);
    const ogMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/);
    assert.ok(ogMatch, `${locale} should have og:description`);
    assert.ok(!ogMatch[1].startsWith('Stop wasting time'), `${locale} og:description should be translated`);
  });
}

// ============================================================
// 8. Asset paths correct for subdirectories (../icon48.png)
// ============================================================
for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html uses ../ for icon assets`, () => {
    const html = readFile(`${locale}/index.html`);
    assert.ok(html.includes('src="../icon48.png"'), `${locale} should reference ../icon48.png`);
    assert.ok(html.includes('href="../favicon.ico"'), `${locale} should reference ../favicon.ico`);
  });

  test(`${locale}/privacy.html uses ../ for icon assets`, () => {
    const html = readFile(`${locale}/privacy.html`);
    assert.ok(html.includes('src="../icon48.png"'), `${locale}/privacy should reference ../icon48.png`);
    assert.ok(html.includes('href="../favicon.ico"'), `${locale}/privacy should reference ../favicon.ico`);
  });
}

// Root pages should NOT have ../
test('root index.html does not use ../ for assets', () => {
  const html = readFile('index.html');
  assert.ok(!html.includes('src="../icon48.png"'), 'Root should not use ../ paths');
});

// ============================================================
// 9. Desktop lang-switcher has correct IDs and active locale
// ============================================================
for (const locale of LOCALES) {
  const filePath = locale === 'en' ? 'index.html' : `${locale}/index.html`;
  test(`${filePath} has desktop-lang-trigger`, () => {
    const html = readFile(filePath);
    assert.ok(html.includes('id="desktop-lang-trigger"'), `${filePath} missing id="desktop-lang-trigger"`);
  });

  test(`${filePath} has desktop-lang-menu`, () => {
    const html = readFile(filePath);
    assert.ok(html.includes('id="desktop-lang-menu"'), `${filePath} missing id="desktop-lang-menu"`);
  });

  test(`${filePath} desktop-lang-menu has correct active locale`, () => {
    const html = readFile(filePath);
    const menuMatch = html.match(/id="desktop-lang-menu">([\s\S]*?)<\/div>/);
    assert.ok(menuMatch, `${filePath} could not extract desktop-lang-menu content`);
    const menuContent = menuMatch[1];
    const activeMatch = menuContent.match(/href="([^"]*)"[^>]*class="lang-option active"/);
    assert.ok(activeMatch, `${filePath} desktop-lang-menu missing active lang-option`);
    const expectedHref = locale === 'en' ? '/' : `/${locale}/`;
    assert.strictEqual(activeMatch[1], expectedHref,
      `${filePath} desktop active href should be "${expectedHref}", got "${activeMatch[1]}"`);
  });
}

// ============================================================
// 10. Mobile lang-switcher has correct IDs and active locale
// ============================================================
for (const locale of LOCALES) {
  const filePath = locale === 'en' ? 'index.html' : `${locale}/index.html`;
  test(`${filePath} has mobile-lang-trigger`, () => {
    const html = readFile(filePath);
    assert.ok(html.includes('id="mobile-lang-trigger"'), `${filePath} missing id="mobile-lang-trigger"`);
  });

  test(`${filePath} has mobile-lang-menu`, () => {
    const html = readFile(filePath);
    assert.ok(html.includes('id="mobile-lang-menu"'), `${filePath} missing id="mobile-lang-menu"`);
  });

  test(`${filePath} mobile-lang-menu has correct active locale`, () => {
    const html = readFile(filePath);
    const menuMatch = html.match(/id="mobile-lang-menu">([\s\S]*?)<\/div>/);
    assert.ok(menuMatch, `${filePath} could not extract mobile-lang-menu content`);
    const menuContent = menuMatch[1];
    const activeMatch = menuContent.match(/href="([^"]*)"[^>]*class="lang-option active"/);
    assert.ok(activeMatch, `${filePath} mobile-lang-menu missing active lang-option`);
    const expectedHref = locale === 'en' ? '/' : `/${locale}/`;
    assert.strictEqual(activeMatch[1], expectedHref,
      `${filePath} mobile active href should be "${expectedHref}", got "${activeMatch[1]}"`);
  });
}

// ============================================================
// 11. Both lang-switchers have all 11 language links
// ============================================================
for (const locale of LOCALES) {
  const filePath = locale === 'en' ? 'index.html' : `${locale}/index.html`;
  for (const menuId of ['desktop-lang-menu', 'mobile-lang-menu']) {
    test(`${filePath} ${menuId} has all 11 language links`, () => {
      const html = readFile(filePath);
      const menuMatch = html.match(new RegExp(`id="${menuId}">([\\s\\S]*?)<\\/div>`));
      assert.ok(menuMatch, `${filePath} could not extract ${menuId} content`);
      const menuContent = menuMatch[1];
      const linkCount = (menuContent.match(/class="lang-option/g) || []).length;
      assert.strictEqual(linkCount, 11, `${filePath} ${menuId} should have 11 lang links, got ${linkCount}`);
      // Verify each locale path is present
      for (const targetLocale of NON_EN_LOCALES) {
        assert.ok(menuContent.includes(`href="/${targetLocale}/"`),
          `${filePath} ${menuId} missing link to /${targetLocale}/`);
      }
      // English link should point to /
      assert.ok(menuContent.includes('href="/"'), `${filePath} ${menuId} missing link to /`);
    });
  }
}

// ============================================================
// 12. Theme toggle buttons present in all index pages
// ============================================================
for (const locale of LOCALES) {
  const filePath = locale === 'en' ? 'index.html' : `${locale}/index.html`;
  test(`${filePath} has theme-toggle button`, () => {
    const html = readFile(filePath);
    assert.ok(html.includes('id="theme-toggle"'), `${filePath} missing id="theme-toggle"`);
  });

  test(`${filePath} has theme-toggle-mobile button`, () => {
    const html = readFile(filePath);
    assert.ok(html.includes('id="theme-toggle-mobile"'), `${filePath} missing id="theme-toggle-mobile"`);
  });
}

// ============================================================
// 13. Install section has data-i18n="install_title" with translated content
// ============================================================
for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html install_title is translated`, () => {
    const html = readFile(`${locale}/index.html`);
    const t = translations[locale];
    assert.ok(html.includes('data-i18n="install_title"'), `${locale} missing data-i18n="install_title"`);
    assert.ok(html.includes(t.install_title), `${locale} install_title should contain "${t.install_title}"`);
    // Should not contain English text
    const enTitle = translations.en.install_title;
    if (enTitle !== t.install_title) {
      const match = html.match(/data-i18n="install_title"[^>]*>([^<]*)/);
      assert.ok(match, `${locale} could not extract install_title content`);
      assert.notStrictEqual(match[1].trim(), enTitle, `${locale} install_title should not be English`);
    }
  });
}

// ============================================================
// 14. Spot check: Polish hero title contains Polish text
// ============================================================
test('pl/index.html hero title contains Polish text', () => {
  const html = readFile('pl/index.html');
  assert.ok(html.includes('Twoje najlepsze prompty AI.'), 'Polish hero should contain "Twoje najlepsze prompty AI."');
  assert.ok(!html.match(/data-i18n="hero_title"[^>]*>Your best AI prompts/),
    'Polish hero_title should not contain English text');
});

// ============================================================
// 15. No English text leaking into locale pages (comprehensive check)
// ============================================================
const INSTALL_KEYS = ['install_title', 'install_step1', 'install_step2', 'install_step3', 'install_step4', 'install_step5', 'install_note'];
const CRITICAL_KEYS = ['hero_title', 'hero_sub', 'nav_features', 'nav_library', 'nav_faq', 'nav_privacy', 'nav_cta', ...INSTALL_KEYS];

for (const locale of NON_EN_LOCALES) {
  test(`${locale}/index.html has no English leaks in critical data-i18n elements`, () => {
    const html = readFile(`${locale}/index.html`);
    const enT = translations.en;
    const locT = translations[locale];
    for (const key of CRITICAL_KEYS) {
      if (!enT[key] || !locT[key] || enT[key] === locT[key]) continue;
      // Extract the plain text from English value (strip HTML tags for comparison)
      const enPlain = enT[key].replace(/<[^>]+>/g, '').trim();
      if (enPlain.length < 10) continue; // Skip very short strings that might match accidentally
      const dataI18nRegex = new RegExp(`data-i18n="${key}"[^>]*>([^<]*)`);
      const match = html.match(dataI18nRegex);
      if (match) {
        assert.notStrictEqual(match[1].trim(), enPlain,
          `${locale} data-i18n="${key}" contains English text: "${enPlain}"`);
      }
    }
  });

  // Check install steps are translated (content inside <li> elements)
  for (const stepKey of INSTALL_KEYS) {
    if (stepKey === 'install_title' || stepKey === 'install_note') continue; // Already tested in section 13
    test(`${locale}/index.html ${stepKey} is translated`, () => {
      const html = readFile(`${locale}/index.html`);
      const locT = translations[locale];
      if (locT[stepKey]) {
        assert.ok(html.includes(`data-i18n="${stepKey}"`),
          `${locale} missing data-i18n="${stepKey}"`);
      }
    });
  }
}

// ============================================================
// 16. Privacy page has same nav links as index page
// ============================================================
const NAV_I18N_KEYS = ['nav_features', 'nav_library', 'nav_faq', 'nav_privacy', 'nav_cta'];

test('root privacy.html has all nav data-i18n links', () => {
  const html = readFile('privacy.html');
  for (const key of NAV_I18N_KEYS) {
    assert.ok(html.includes(`data-i18n="${key}"`), `privacy.html missing data-i18n="${key}"`);
  }
});

for (const locale of NON_EN_LOCALES) {
  test(`${locale}/privacy.html has all nav data-i18n links`, () => {
    const html = readFile(`${locale}/privacy.html`);
    for (const key of NAV_I18N_KEYS) {
      assert.ok(html.includes(`data-i18n="${key}"`), `${locale}/privacy.html missing data-i18n="${key}"`);
    }
  });
}

// ============================================================
// Summary
// ============================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`Website build tests: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(50)}`);

if (failures.length > 0) {
  console.log('\nFailures:');
  for (const f of failures) {
    console.log(`  FAIL: ${f.name}`);
    console.log(`        ${f.error}`);
  }
  process.exit(1);
} else {
  console.log('\nAll tests passed.');
}
