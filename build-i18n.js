#!/usr/bin/env node
/**
 * build-i18n.js - Static site generator for locale pages
 *
 * Reads index.html and privacy.html as templates (from git HEAD for idempotency),
 * generates /{locale}/ directories with translated pages for each locale.
 *
 * Usage: node build-i18n.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Load template, stripping any prior build artifacts for idempotency.
 * Prefers git HEAD if it has data-i18n markers (fully prepared template).
 * Falls back to local file with build artifacts stripped.
 */
function loadTemplate(filename) {
  let html;
  try {
    const git = execSync(`git show HEAD:${filename}`, { cwd: SITE_DIR, encoding: 'utf8' });
    if (git.includes('data-i18n=')) return git;
  } catch { /* no git or file not tracked */ }
  html = fs.readFileSync(path.join(SITE_DIR, filename), 'utf8');
  // Strip prior build artifacts so the build is idempotent
  html = html.replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*">/g, '');
  return html;
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
 * Process a template for a given locale
 * @param {string} pagePath '' for index, 'privacy.html' for privacy
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

  // 2. Update title, meta, OG tags (index pages only - privacy keeps its own)
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
    const ogUrl = locale === DEFAULT_LOCALE ? `${BASE_URL}/` : `${BASE_URL}/${locale}/`;
    html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*">/, `<meta property="og:url" content="${ogUrl}">`);
  }

  // 3. Set canonical URL (insert if missing)
  const canonicalPath = locale === DEFAULT_LOCALE
    ? (pagePath || '')
    : (pagePath ? `${locale}/${pagePath}` : `${locale}/`);
  const canonicalTag = `<link rel="canonical" href="${BASE_URL}/${canonicalPath}">`;

  if (/<link\s+rel="canonical"/.test(html)) {
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*">/, canonicalTag);
  } else {
    // Insert canonical after last <meta> in <head>
    html = html.replace(/(<meta[^>]*>)(\s*<link\s+rel="icon")/, `$1\n  ${canonicalTag}$2`);
  }

  // 4. Insert hreflang tags after canonical
  const hreflangTags = buildHreflangTags(allLocales, pagePath);
  html = html.replace(
    /(<link\s+rel="canonical"\s+href="[^"]*">)/,
    `$1\n${hreflangTags}`
  );

  // 5. Inject nav-cta and lang-switcher CSS if missing (for pages like privacy.html)
  if (!(/\.nav-cta/.test(html))) {
    const extraCss = `
    .nav-cta {
      background: #f97316 !important;
      color: #fff !important;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 600 !important;
      transition: background 0.15s ease !important;
    }
    .nav-cta:hover { background: #ea580c !important; }

    .lang-switcher { position: relative; }
    .lang-trigger {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: #a1a1a6;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .lang-trigger:hover { color: #ffffff; border-color: rgba(255,255,255,0.3); }
    .lang-trigger svg { width: 12px; height: 12px; opacity: 0.6; }
    .lang-menu {
      display: none;
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 6px;
      min-width: 160px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      z-index: 200;
      max-height: 320px;
      overflow-y: scroll;
    }
    .lang-menu.open { display: block; }
    .lang-option {
      display: block;
      width: 100%;
      background: transparent;
      border: none;
      color: #a1a1a6;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s ease;
      white-space: nowrap;
      text-decoration: none;
    }
    .lang-option:hover { background: rgba(255,255,255,0.08); color: #ffffff; }
    .lang-option.active { color: #f97316; background: rgba(249,115,22,0.1); }
    [dir="rtl"] .lang-menu { left: 0; right: auto; }
    [dir="rtl"] .lang-option { text-align: right; }`;

    // Also fix mobile breakpoint to hide nav links and show switcher
    html = html.replace(
      /(@media\s*\(max-width:\s*768px\)\s*\{[^}]*)\}/,
      `$1  .nav a:not(.nav-cta) { display: none; }\n      .lang-switcher { display: flex; }\n    }`
    );

    // Inject CSS before </style>
    html = html.replace('</style>', extraCss + '\n  </style>');

    // Make header sticky if not already
    if (!/position:\s*sticky/.test(html.split('</style>')[0])) {
      html = html.replace(
        /\.header\s*\{([^}]*)\}/,
        (match, inner) => `.header {${inner}  position: sticky;\n      top: 0;\n      z-index: 100;\n    }`
      );
    }
  }

  // 6. Replace data-i18n content
  html = replaceDataI18n(html, t);

  // 6. Replace nav and language switcher
  const switcherHtml = buildLangSwitcher(locale, pagePath);
  const hasLangSwitcher = /class="lang-switcher"/.test(html);

  if (hasLangSwitcher) {
    // Template already has a lang-switcher: replace it
    html = html.replace(
      /(<nav\s+class="nav">[\s\S]*?)(<div\s+class="lang-switcher"[\s\S]*?<\/div>\s*<\/div>)\s*(<\/nav>)/,
      `$1${switcherHtml}\n    $3`
    );
  } else {
    // Template has a basic nav (e.g. privacy.html): replace entire nav with full nav + switcher
    const sectionBase = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
    const privacyHref = locale === DEFAULT_LOCALE ? 'privacy.html' : `/${locale}/privacy.html`;
    const navFeatures = t.nav_features || 'Features';
    const navLibrary = t.nav_library || 'Library';
    const navFaq = t.nav_faq || 'FAQ';
    const navPrivacy = t.nav_privacy || 'Privacy';
    const navCta = t.nav_cta || 'Add to Chrome';

    const fullNav = `    <nav class="nav">
      <a href="${sectionBase}/#features" data-i18n="nav_features">${navFeatures}</a>
      <a href="${sectionBase}/#library" data-i18n="nav_library">${navLibrary}</a>
      <a href="${sectionBase}/#faq" data-i18n="nav_faq">${navFaq}</a>
      <a href="${privacyHref}" data-i18n="nav_privacy">${navPrivacy}</a>
      <a href="#" class="nav-cta" data-i18n="nav_cta">${navCta}</a>
${switcherHtml}
    </nav>`;
    html = html.replace(/<nav\s+class="nav">[\s\S]*?<\/nav>/, fullNav);
  }

  // 7. Replace footer for pages without data-i18n footer
  if (!(/data-i18n="footer_privacy"/.test(html)) && t.footer_privacy && t.footer_copy) {
    const privacyHref = locale === DEFAULT_LOCALE ? 'privacy.html' : `/${locale}/privacy.html`;
    const newFooter = `  <footer class="footer">
    <div class="footer-links">
      <a href="${privacyHref}" data-i18n="footer_privacy">${t.footer_privacy}</a>
    </div>
    <p data-i18n="footer_copy">${t.footer_copy}</p>
  </footer>`;
    html = html.replace(/<footer\s+class="footer">[\s\S]*?<\/footer>/, newFooter);
  }

  // 8. Remove client-side i18n scripts
  html = html.replace(/\s*<script\s+src="translations\.js"><\/script>/g, '');
  html = html.replace(/\s*<script\s+src="i18n\.js"><\/script>/g, '');

  // 8. Add dropdown toggle script (minimal inline JS for the language menu)
  html = html.replace(
    '</body>',
    `  <script>
    (function() {
      var t = document.querySelector('.lang-trigger');
      var m = document.querySelector('.lang-menu');
      if (!t || !m) return;
      t.addEventListener('click', function(e) { e.stopPropagation(); m.classList.toggle('open'); });
      document.addEventListener('click', function() { m.classList.remove('open'); });
    })();
  </script>
</body>`
  );

  // 9. Fix paths for locale subdirectories
  if (locale !== DEFAULT_LOCALE) {
    html = html.replace(/src="(icon48\.png|icon128\.png|favicon\.ico|favicon\.png)"/g, 'src="../$1"');
    html = html.replace(/href="(favicon\.ico)"/g, 'href="../$1"');
    html = html.replace(/href="(icon48\.png)"/g, 'href="../$1"');
    html = html.replace(/href="privacy\.html"/g, `href="/${locale}/privacy.html"`);
    html = html.replace(/href="\/#(features|library|faq)"/g, `href="/${locale}/#$1"`);
    html = html.replace(/href="#(features|library|faq)"/g, `href="/${locale}/#$1"`);
  }

  return html;
}

function main() {
  console.log('Building i18n locale pages...\n');

  const translations = loadTranslations();
  const allLocales = Object.keys(translations);

  // Load templates from git HEAD for idempotent builds
  const indexTemplate = loadTemplate('index.html');
  const privacyTemplate = loadTemplate('privacy.html');

  let generated = 0;

  for (const locale of allLocales) {
    const localeDir = locale === DEFAULT_LOCALE ? SITE_DIR : path.join(SITE_DIR, locale);

    if (locale !== DEFAULT_LOCALE && !fs.existsSync(localeDir)) {
      fs.mkdirSync(localeDir, { recursive: true });
    }

    // Generate index.html
    const localeIndex = processTemplate(indexTemplate, locale, translations, allLocales, '');
    fs.writeFileSync(path.join(localeDir, 'index.html'), localeIndex);

    // Generate privacy.html
    const localePrivacy = processTemplate(privacyTemplate, locale, translations, allLocales, 'privacy.html');
    fs.writeFileSync(path.join(localeDir, 'privacy.html'), localePrivacy);

    const prefix = locale === DEFAULT_LOCALE ? '/ (en)' : `/${locale}/`;
    console.log(`  ${prefix} -> index.html, privacy.html`);
    generated += 2;
  }

  console.log(`\nGenerated ${generated} files for ${allLocales.length} locales.`);
  console.log('Done.');
}

main();
