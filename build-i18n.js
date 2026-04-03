#!/usr/bin/env node
/**
 * build-i18n.js - Static site generator for locale pages
 *
 * Reads index.html and privacy.html as templates (local files),
 * generates /{locale}/ directories with translated pages for each non-English locale.
 *
 * The root index.html and privacy.html ARE the English pages AND templates.
 * They are never overwritten by this script.
 *
 * Usage: node build-i18n.js
 */

const fs = require('fs');
const path = require('path');

const SITE_DIR = __dirname;
const TRANSLATIONS_PATH = path.join(SITE_DIR, 'translations.json');
const BASE_URL = 'https://promptingninja.ai';
const RTL_LOCALES = ['ar'];
const DEFAULT_LOCALE = 'en';

const LANG_META = {
  en: { flag: '\u{1F1EC}\u{1F1E7}', name: 'English' },
  pl: { flag: '\u{1F1F5}\u{1F1F1}', name: 'Polski' },
  es: { flag: '\u{1F1EA}\u{1F1F8}', name: 'Espa\u00f1ol' },
  pt: { flag: '\u{1F1E7}\u{1F1F7}', name: 'Portugu\u00eas' },
  uk: { flag: '\u{1F1FA}\u{1F1E6}', name: '\u0423\u043a\u0440\u0430\u0457\u043d\u0441\u044c\u043a\u0430' },
  fr: { flag: '\u{1F1EB}\u{1F1F7}', name: 'Fran\u00e7ais' },
  de: { flag: '\u{1F1E9}\u{1F1EA}', name: 'Deutsch' },
  it: { flag: '\u{1F1EE}\u{1F1F9}', name: 'Italiano' },
  ja: { flag: '\u{1F1EF}\u{1F1F5}', name: '\u65e5\u672c\u8a9e' },
  zh: { flag: '\u{1F1E8}\u{1F1F3}', name: '\u4e2d\u6587' },
  ar: { flag: '\u{1F1F8}\u{1F1E6}', name: '\u0627\u0644\u0639\u0631\u0628\u064a\u0629' },
};

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, '');
}

function loadTranslations() {
  return JSON.parse(fs.readFileSync(TRANSLATIONS_PATH, 'utf8'));
}

/**
 * Load template from local file. The local files are the English pages
 * AND the templates. They contain data-i18n attributes, hreflang tags,
 * lang-switcher HTML/CSS, and toggle script already.
 */
function loadTemplate(filename) {
  return fs.readFileSync(path.join(SITE_DIR, filename), 'utf8');
}

function buildHreflangTags(locales, pagePath) {
  const suffix = pagePath || '';
  const lines = [];
  lines.push(`  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/${suffix}">`);
  lines.push(`  <link rel="alternate" hreflang="en" href="${BASE_URL}/${suffix}">`);
  for (const locale of locales) {
    if (locale === DEFAULT_LOCALE) continue;
    const locPath = suffix ? `${locale}/${suffix}` : `${locale}/`;
    lines.push(`  <link rel="alternate" hreflang="${locale}" href="${BASE_URL}/${locPath}">`);
  }
  return lines.join('\n');
}

function buildLangSwitcher(currentLocale, pagePath) {
  const suffix = pagePath || '';
  const currentMeta = LANG_META[currentLocale] || LANG_META.en;
  const lines = [];
  lines.push('      <div class="lang-switcher" id="lang-switcher">');
  lines.push('        <button class="lang-trigger" aria-label="Change language">');
  lines.push(`          <span id="lang-current">${currentMeta.flag} ${currentMeta.name}</span>`);
  lines.push('          <svg viewBox="0 0 12 12" fill="currentColor"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg>');
  lines.push('        </button>');
  lines.push('        <div class="lang-menu">');
  for (const [locale, meta] of Object.entries(LANG_META)) {
    const isActive = locale === currentLocale;
    const cls = isActive ? 'lang-option active' : 'lang-option';
    let href;
    if (locale === DEFAULT_LOCALE) {
      href = suffix ? `/${suffix}` : '/';
    } else {
      href = suffix ? `/${locale}/${suffix}` : `/${locale}/`;
    }
    lines.push(`          <a href="${href}" class="${cls}">${meta.flag} ${meta.name}</a>`);
  }
  lines.push('        </div>');
  lines.push('      </div>');
  return lines.join('\n');
}

/**
 * Replace data-i18n element content with translated text.
 * KEEPS the data-i18n attribute in the output.
 */
function replaceDataI18n(html, translations) {
  return html.replace(
    /(<([a-z][a-z0-9]*)\b[^>]*data-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/gi,
    (match, openTag, _tagName, key, _content, closeTag) => {
      if (translations[key] !== undefined) {
        return openTag + translations[key] + closeTag;
      }
      return match;
    }
  );
}

/**
 * Process a template for a given locale.
 * @param {string} templateHtml - The English template HTML
 * @param {string} locale - Target locale code
 * @param {object} translations - Full translations object
 * @param {string[]} allLocales - All locale codes
 * @param {string} pagePath - '' for index, 'privacy.html' for privacy
 */
function processTemplate(templateHtml, locale, translations, allLocales, pagePath) {
  let html = templateHtml;
  const t = translations[locale];
  const isRTL = RTL_LOCALES.includes(locale);
  const isIndexPage = !pagePath;

  // 1. Set <html lang> and dir
  if (isRTL) {
    html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${locale}" dir="rtl"`);
  } else {
    html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${locale}"`);
  }

  // 2. Update title, meta, OG tags (index pages only)
  if (isIndexPage) {
    if (t.hero_title) {
      const plainTitle = stripHtml(t.hero_title).replace(/\s+/g, ' ').trim();
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${plainTitle} | Prompting Ninja</title>`);
      html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*">/, `<meta property="og:title" content="${plainTitle.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+name="twitter:title"\s+content="[^"]*">/, `<meta name="twitter:title" content="${plainTitle.replace(/"/g, '&quot;')}">`);
    }
    if (t.hero_desc) {
      const plainDesc = stripHtml(t.hero_desc);
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*">/, `<meta name="description" content="${plainDesc.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*">/, `<meta property="og:description" content="${plainDesc.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+name="twitter:description"\s+content="[^"]*">/, `<meta name="twitter:description" content="${plainDesc.replace(/"/g, '&quot;')}">`);
    }
    // Update OG URL
    const ogUrl = `${BASE_URL}/${locale}/`;
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*">/, `<meta property="og:url" content="${ogUrl}">`);
  }

  // 3. Update canonical URL
  const canonicalPath = pagePath ? `${locale}/${pagePath}` : `${locale}/`;
  const canonicalTag = `<link rel="canonical" href="${BASE_URL}/${canonicalPath}">`;
  html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*">/, canonicalTag);

  // 4. Replace hreflang tags (template already has them, just replace the block)
  const hreflangBlock = buildHreflangTags(allLocales, pagePath);
  // Remove all existing hreflang tags and insert new ones after canonical
  html = html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*">/g, '');
  html = html.replace(
    /(<link\s+rel="canonical"\s+href="[^"]*">)/,
    `$1\n${hreflangBlock}`
  );

  // 5. Replace data-i18n content (keeps data-i18n attributes)
  html = replaceDataI18n(html, t);

  // 6. Replace the lang-switcher with locale-specific version
  const switcherHtml = buildLangSwitcher(locale, pagePath);
  // Match the lang-switcher div precisely: it contains a <button> and a <div class="lang-menu">
  // Structure: <div class="lang-switcher"...> <button>...</button> <div class="lang-menu">...(links)...</div> </div>
  html = html.replace(
    /<div\s+class="lang-switcher"\s+id="lang-switcher">[\s\S]*?<\/div>\s*<\/div>/,
    switcherHtml
  );

  // 7. Fix paths for locale subdirectories (assets are in parent dir)
  html = html.replace(/src="(icon48\.png|icon128\.png|favicon\.ico|favicon\.png)"/g, 'src="../$1"');
  html = html.replace(/href="(favicon\.ico)"/g, 'href="../$1"');
  html = html.replace(/href="(icon48\.png)"/g, 'href="../$1"');

  // 8. Fix nav links for locale subdirectories
  html = html.replace(/href="privacy\.html"/g, `href="/${locale}/privacy.html"`);
  html = html.replace(/href="\/#(features|library|faq)"/g, `href="/${locale}/#$1"`);
  html = html.replace(/href="#(features|library|faq)"/g, `href="/${locale}/#$1"`);

  return html;
}

function main() {
  console.log('Building i18n locale pages...\n');

  const translations = loadTranslations();
  const allLocales = Object.keys(translations);

  // Load templates from local files (they ARE the English pages)
  const indexTemplate = loadTemplate('index.html');
  const privacyTemplate = loadTemplate('privacy.html');

  let generated = 0;

  for (const locale of allLocales) {
    // Skip English - the root files ARE the English pages and templates
    if (locale === DEFAULT_LOCALE) {
      console.log(`  / (en) -> skipped (root files are English)`);
      continue;
    }

    const localeDir = path.join(SITE_DIR, locale);

    if (!fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }

    // Generate index.html
    const localeIndex = processTemplate(indexTemplate, locale, translations, allLocales, '');
    fs.writeFileSync(path.join(localeDir, 'index.html'), localeIndex);

    // Generate privacy.html
    const localePrivacy = processTemplate(privacyTemplate, locale, translations, allLocales, 'privacy.html');
    fs.writeFileSync(path.join(localeDir, 'privacy.html'), localePrivacy);

    console.log(`  /${locale}/ -> index.html, privacy.html`);
    generated += 2;
  }

  console.log(`\nGenerated ${generated} files for ${allLocales.length - 1} non-English locales.`);
  console.log('Done.');
}

main();
