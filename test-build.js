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
