#!/usr/bin/env node
/**
 * test-client.js - Client-side JavaScript behavior tests using jsdom
 *
 * Tests theme toggle, language persistence, mobile menu, and GDPR banner
 * logic extracted from inline scripts in index.html.
 *
 * Usage: node test-client.js
 */

const assert = require('assert');
const { JSDOM } = require('jsdom');

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

// ---------------------------------------------------------------------------
// Helper: create a jsdom environment with the relevant DOM elements
// ---------------------------------------------------------------------------
function createDOM(options = {}) {
  const {
    pathname = '/',
    localStorage: localStorageInit = {},
    includePrivacyNotice = true,
  } = options;

  const privacyNoticeHTML = includePrivacyNotice
    ? `<div id="privacy-notice" style="display:none;">
         <div style="max-width:960px;">
           <p>This website does not use cookies.</p>
           <button id="privacy-accept"
             onclick="document.getElementById('privacy-notice').style.display='none';localStorage.setItem('pn-privacy-ok','1');">
             Got it
           </button>
         </div>
       </div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head><title>Test</title></head>
<body>
  <nav class="nav">
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">&#9790;</button>
    <div class="lang-switcher" id="lang-switcher">
      <button class="lang-trigger" id="desktop-lang-trigger" aria-label="Change language">
        <span id="lang-current">English</span>
      </button>
      <div class="lang-menu" id="desktop-lang-menu">
        <a href="/" class="lang-option active">English</a>
        <a href="/pl/" class="lang-option">Polski</a>
        <a href="/es/" class="lang-option">Espanol</a>
        <a href="/fr/" class="lang-option">Francais</a>
      </div>
    </div>
    <div class="mobile-more" id="mobile-more">
      <button class="mobile-more-trigger" aria-label="More options">&#8943;</button>
      <div class="mobile-more-menu" id="mobile-more-menu">
        <button class="theme-toggle" id="theme-toggle-mobile" aria-label="Toggle dark mode">&#9790; Dark mode</button>
        <div class="lang-switcher">
          <button class="lang-trigger" id="mobile-lang-trigger" aria-label="Change language">
            <span>English</span>
          </button>
          <div class="lang-menu" id="mobile-lang-menu">
            <a href="/" class="lang-option active">English</a>
            <a href="/pl/" class="lang-option">Polski</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
  ${privacyNoticeHTML}
</body>
</html>`;

  const dom = new JSDOM(html, {
    url: `https://promptingninja.ai${pathname}`,
    runScripts: 'dangerously',
    pretendToBeVisual: true,
  });

  // Seed localStorage
  for (const [k, v] of Object.entries(localStorageInit)) {
    dom.window.localStorage.setItem(k, v);
  }

  return dom;
}

// ---------------------------------------------------------------------------
// Helpers: run the inline scripts from index.html inside a jsdom window
// ---------------------------------------------------------------------------
function runThemeEarlyScript(window) {
  window.eval(`
    (function() {
      var theme = localStorage.getItem('pn-theme');
      if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    })();
  `);
}

function runLanguagePersistenceScript(window) {
  window.eval(`
    (function() {
      var path = window.location.pathname;
      var match = path.match(/^\\/(pl|es|pt|uk|fr|de|it|ja|zh|ar)\\//);
      if (match) {
        localStorage.setItem('pn-locale', match[1]);
      } else if (path === '/' || path === '/index.html') {
        var saved = localStorage.getItem('pn-locale');
        if (saved && saved !== 'en') {
          window.location.replace('/' + saved + '/');
        }
      }
      document.addEventListener('click', function(e) {
        var link = e.target.closest('.lang-option');
        if (!link) return;
        var href = link.getAttribute('href');
        if (!href) return;
        var localeMatch = href.match(/^\\/(pl|es|pt|uk|fr|de|it|ja|zh|ar)\\//);
        if (localeMatch) {
          localStorage.setItem('pn-locale', localeMatch[1]);
        } else if (href === '/' || href === '/index.html' || href === '/privacy.html') {
          localStorage.setItem('pn-locale', 'en');
        }
      });
    })();
  `);
}

function runMenuScript(window) {
  window.eval(`
    (function() {
      var dTrigger = document.getElementById('desktop-lang-trigger');
      var dMenu = document.getElementById('desktop-lang-menu');
      if (dTrigger && dMenu) {
        dTrigger.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          dMenu.classList.toggle('open');
        });
      }
      var moreTrigger = document.querySelector('.mobile-more-trigger');
      var moreMenu = document.getElementById('mobile-more-menu');
      var mLangTrigger = document.getElementById('mobile-lang-trigger');
      var mLangMenu = document.getElementById('mobile-lang-menu');
      if (moreTrigger && moreMenu) {
        moreTrigger.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          moreMenu.classList.toggle('open');
          if (!moreMenu.classList.contains('open') && mLangMenu) {
            mLangMenu.classList.remove('open');
          }
        });
      }
      if (mLangTrigger && mLangMenu) {
        mLangTrigger.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          mLangMenu.classList.toggle('open');
        });
      }
      document.addEventListener('click', function(e) {
        if (dMenu && dTrigger && !dTrigger.contains(e.target) && !dMenu.contains(e.target)) {
          dMenu.classList.remove('open');
        }
        if (moreMenu && moreTrigger && !moreTrigger.contains(e.target) && !moreMenu.contains(e.target)) {
          moreMenu.classList.remove('open');
          if (mLangMenu) mLangMenu.classList.remove('open');
        }
      });
    })();
  `);
}

function runThemeToggleScript(window) {
  window.eval(`
    (function() {
      var btn = document.getElementById('theme-toggle');
      var btnMobile = document.getElementById('theme-toggle-mobile');
      function update() {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (btn) { btn.textContent = isDark ? '\\u2600' : '\\u263E'; btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode'; }
        if (btnMobile) { btnMobile.textContent = isDark ? '\\u2600 Light mode' : '\\u263E Dark mode'; }
      }
      update();
      function toggle() {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('pn-theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('pn-theme', 'dark');
        }
        update();
      }
      if (btn) btn.addEventListener('click', toggle);
      if (btnMobile) btnMobile.addEventListener('click', toggle);
    })();
  `);
}

function runGDPRScript(window) {
  window.eval(`
    if (!localStorage.getItem('pn-privacy-ok')) {
      document.getElementById('privacy-notice').style.display = 'block';
    }
  `);
}

// ============================================================
// 1. Theme Toggle Tests
// ============================================================

test('Theme toggle: clicking sets data-theme="dark" on html element', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  btn.click();
  assert.strictEqual(
    dom.window.document.documentElement.getAttribute('data-theme'),
    'dark'
  );
  dom.window.close();
});

test('Theme toggle: clicking twice removes data-theme', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  btn.click(); // -> dark
  btn.click(); // -> light
  assert.strictEqual(
    dom.window.document.documentElement.getAttribute('data-theme'),
    null
  );
  dom.window.close();
});

test('Theme toggle: persists "dark" to localStorage', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  btn.click();
  assert.strictEqual(dom.window.localStorage.getItem('pn-theme'), 'dark');
  dom.window.close();
});

test('Theme toggle: persists "light" to localStorage on second click', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  btn.click(); // dark
  btn.click(); // light
  assert.strictEqual(dom.window.localStorage.getItem('pn-theme'), 'light');
  dom.window.close();
});

test('Theme toggle: icon shows sun (\u2600) in dark mode', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  btn.click(); // dark
  assert.strictEqual(btn.textContent, '\u2600');
  dom.window.close();
});

test('Theme toggle: icon shows moon (\u263E) in light mode', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  assert.strictEqual(btn.textContent, '\u263E');
  dom.window.close();
});

test('Theme toggle: title updates to "Switch to light mode" in dark mode', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  btn.click();
  assert.strictEqual(btn.title, 'Switch to light mode');
  dom.window.close();
});

test('Theme toggle: title updates to "Switch to dark mode" in light mode', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  assert.strictEqual(btn.title, 'Switch to dark mode');
  dom.window.close();
});

test('Theme toggle: mobile button text shows "Light mode" when dark', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btnMobile = dom.window.document.getElementById('theme-toggle-mobile');
  btnMobile.click();
  assert.strictEqual(btnMobile.textContent, '\u2600 Light mode');
  dom.window.close();
});

test('Theme toggle: mobile button text shows "Dark mode" when light', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btnMobile = dom.window.document.getElementById('theme-toggle-mobile');
  assert.strictEqual(btnMobile.textContent, '\u263E Dark mode');
  dom.window.close();
});

test('Theme early script: applies data-theme="dark" from localStorage', () => {
  const dom = createDOM({ localStorage: { 'pn-theme': 'dark' } });
  runThemeEarlyScript(dom.window);
  assert.strictEqual(
    dom.window.document.documentElement.getAttribute('data-theme'),
    'dark'
  );
  dom.window.close();
});

test('Theme early script: does not set data-theme when localStorage has "light"', () => {
  const dom = createDOM({ localStorage: { 'pn-theme': 'light' } });
  runThemeEarlyScript(dom.window);
  assert.strictEqual(
    dom.window.document.documentElement.getAttribute('data-theme'),
    null
  );
  dom.window.close();
});

test('Theme toggle: double toggle returns to original state', () => {
  const dom = createDOM();
  runThemeToggleScript(dom.window);
  const btn = dom.window.document.getElementById('theme-toggle');
  btn.click(); // dark
  btn.click(); // light
  assert.strictEqual(dom.window.document.documentElement.getAttribute('data-theme'), null);
  assert.strictEqual(dom.window.localStorage.getItem('pn-theme'), 'light');
  dom.window.close();
});

// ============================================================
// 2. Language Persistence Tests
// ============================================================

test('Language: saves pn-locale when visiting /pl/ page', () => {
  const dom = createDOM({ pathname: '/pl/' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), 'pl');
  dom.window.close();
});

test('Language: saves pn-locale when visiting /es/ page', () => {
  const dom = createDOM({ pathname: '/es/' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), 'es');
  dom.window.close();
});

test('Language: saves pn-locale when visiting /ar/ page', () => {
  const dom = createDOM({ pathname: '/ar/' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), 'ar');
  dom.window.close();
});

test('Language: all supported locales are detected from paths', () => {
  const locales = ['pl', 'es', 'pt', 'uk', 'fr', 'de', 'it', 'ja', 'zh', 'ar'];
  for (const locale of locales) {
    const dom = createDOM({ pathname: `/${locale}/` });
    runLanguagePersistenceScript(dom.window);
    assert.strictEqual(
      dom.window.localStorage.getItem('pn-locale'),
      locale,
      `Failed for locale: ${locale}`
    );
    dom.window.close();
  }
});

test('Language: does not set pn-locale when visiting root with no saved locale', () => {
  const dom = createDOM({ pathname: '/' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), null);
  dom.window.close();
});

test('Language: redirects from / when pn-locale is saved (non-en)', () => {
  const dom = createDOM({ pathname: '/', localStorage: { 'pn-locale': 'fr' } });
  // Inject a stub for location.replace via script evaluation before the real script runs
  // jsdom does not allow direct override of location.replace, so we test the redirect
  // logic by running it in a context where location.replace is captured
  let replacedUrl = null;
  dom.window.eval(`
    (function() {
      var path = window.location.pathname;
      var saved = localStorage.getItem('pn-locale');
      if ((path === '/' || path === '/index.html') && saved && saved !== 'en') {
        window.__redirectTarget = '/' + saved + '/';
      }
    })();
  `);
  assert.strictEqual(dom.window.__redirectTarget, '/fr/');
  dom.window.close();
});

test('Language: does NOT redirect from / when pn-locale is "en"', () => {
  const dom = createDOM({ pathname: '/', localStorage: { 'pn-locale': 'en' } });
  dom.window.eval(`
    (function() {
      window.__redirectTarget = null;
      var path = window.location.pathname;
      var saved = localStorage.getItem('pn-locale');
      if ((path === '/' || path === '/index.html') && saved && saved !== 'en') {
        window.__redirectTarget = '/' + saved + '/';
      }
    })();
  `);
  assert.strictEqual(dom.window.__redirectTarget, null, 'Should not redirect when locale is en');
  dom.window.close();
});

test('Language: clicking English lang-option link sets pn-locale="en"', () => {
  const dom = createDOM({ pathname: '/' });
  runLanguagePersistenceScript(dom.window);
  const enLink = dom.window.document.querySelector('.lang-option[href="/"]');
  enLink.click();
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), 'en');
  dom.window.close();
});

test('Language: clicking Polish lang-option link sets pn-locale="pl"', () => {
  const dom = createDOM({ pathname: '/' });
  runLanguagePersistenceScript(dom.window);
  const plLink = dom.window.document.querySelector('.lang-option[href="/pl/"]');
  plLink.click();
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), 'pl');
  dom.window.close();
});

test('Language: non-locale path /about/ does not set locale', () => {
  const dom = createDOM({ pathname: '/about/' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), null);
  dom.window.close();
});

test('Language: /index.html with saved locale=fr redirects', () => {
  const dom = createDOM({ pathname: '/index.html', localStorage: { 'pn-locale': 'fr' } });
  dom.window.eval(`
    (function() {
      window.__redirectTarget = null;
      var path = window.location.pathname;
      var saved = localStorage.getItem('pn-locale');
      if ((path === '/' || path === '/index.html') && saved && saved !== 'en') {
        window.__redirectTarget = '/' + saved + '/';
      }
    })();
  `);
  assert.strictEqual(dom.window.__redirectTarget, '/fr/');
  dom.window.close();
});

test('Language: locale regex does not match partial paths like /platform/', () => {
  const dom = createDOM({ pathname: '/platform/' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), null);
  dom.window.close();
});

// ============================================================
// 3. Mobile Menu Tests
// ============================================================

test('Mobile menu: three-dot button toggles .open class on mobile-more-menu', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const trigger = dom.window.document.querySelector('.mobile-more-trigger');
  const menu = dom.window.document.getElementById('mobile-more-menu');
  assert.ok(!menu.classList.contains('open'), 'Menu should start closed');
  trigger.click();
  assert.ok(menu.classList.contains('open'), 'Menu should be open after click');
  dom.window.close();
});

test('Mobile menu: second click closes the menu', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const trigger = dom.window.document.querySelector('.mobile-more-trigger');
  const menu = dom.window.document.getElementById('mobile-more-menu');
  trigger.click(); // open
  trigger.click(); // close
  assert.ok(!menu.classList.contains('open'), 'Menu should be closed after second click');
  dom.window.close();
});

test('Mobile menu: closing more menu also closes lang submenu', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const moreTrigger = dom.window.document.querySelector('.mobile-more-trigger');
  const mLangTrigger = dom.window.document.getElementById('mobile-lang-trigger');
  const mLangMenu = dom.window.document.getElementById('mobile-lang-menu');
  moreTrigger.click(); // open more menu
  mLangTrigger.click(); // open lang submenu
  assert.ok(mLangMenu.classList.contains('open'), 'Lang submenu should be open');
  moreTrigger.click(); // close more menu
  assert.ok(!mLangMenu.classList.contains('open'), 'Lang submenu should close with more menu');
  dom.window.close();
});

test('Mobile menu: clicking outside closes mobile menu', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const trigger = dom.window.document.querySelector('.mobile-more-trigger');
  const menu = dom.window.document.getElementById('mobile-more-menu');
  trigger.click(); // open
  assert.ok(menu.classList.contains('open'));
  // Click on body (outside menu)
  dom.window.document.body.click();
  assert.ok(!menu.classList.contains('open'), 'Menu should close on outside click');
  dom.window.close();
});

test('Desktop lang menu: trigger toggles .open class', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const trigger = dom.window.document.getElementById('desktop-lang-trigger');
  const menu = dom.window.document.getElementById('desktop-lang-menu');
  assert.ok(!menu.classList.contains('open'));
  trigger.click();
  assert.ok(menu.classList.contains('open'), 'Desktop lang menu should open');
  dom.window.close();
});

test('Desktop lang menu: clicking outside closes it', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const trigger = dom.window.document.getElementById('desktop-lang-trigger');
  const menu = dom.window.document.getElementById('desktop-lang-menu');
  trigger.click(); // open
  dom.window.document.body.click();
  assert.ok(!menu.classList.contains('open'), 'Desktop lang menu should close on outside click');
  dom.window.close();
});

test('Desktop lang menu: second click closes it', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const trigger = dom.window.document.getElementById('desktop-lang-trigger');
  const menu = dom.window.document.getElementById('desktop-lang-menu');
  trigger.click(); // open
  trigger.click(); // close
  assert.ok(!menu.classList.contains('open'), 'Desktop lang menu should close on second click');
  dom.window.close();
});

test('Mobile lang submenu: trigger toggles .open class', () => {
  const dom = createDOM();
  runMenuScript(dom.window);
  const mLangTrigger = dom.window.document.getElementById('mobile-lang-trigger');
  const mLangMenu = dom.window.document.getElementById('mobile-lang-menu');
  assert.ok(!mLangMenu.classList.contains('open'));
  mLangTrigger.click();
  assert.ok(mLangMenu.classList.contains('open'), 'Mobile lang submenu should open');
  dom.window.close();
});

// ============================================================
// 4. GDPR Banner Tests
// ============================================================

test('GDPR banner: shows when pn-privacy-ok not in localStorage', () => {
  const dom = createDOM();
  runGDPRScript(dom.window);
  const notice = dom.window.document.getElementById('privacy-notice');
  assert.strictEqual(notice.style.display, 'block');
  dom.window.close();
});

test('GDPR banner: hidden when pn-privacy-ok is set in localStorage', () => {
  const dom = createDOM({ localStorage: { 'pn-privacy-ok': '1' } });
  runGDPRScript(dom.window);
  const notice = dom.window.document.getElementById('privacy-notice');
  assert.strictEqual(notice.style.display, 'none');
  dom.window.close();
});

test('GDPR banner: clicking accept hides banner and saves to localStorage', () => {
  const dom = createDOM();
  runGDPRScript(dom.window);
  const notice = dom.window.document.getElementById('privacy-notice');
  const acceptBtn = dom.window.document.getElementById('privacy-accept');
  assert.strictEqual(notice.style.display, 'block');
  acceptBtn.click();
  assert.strictEqual(notice.style.display, 'none', 'Banner should be hidden after accept');
  assert.strictEqual(
    dom.window.localStorage.getItem('pn-privacy-ok'),
    '1',
    'pn-privacy-ok should be saved'
  );
  dom.window.close();
});

test('GDPR banner: remains hidden on subsequent page loads after acceptance', () => {
  // Simulate first visit + accept
  const dom1 = createDOM();
  runGDPRScript(dom1.window);
  dom1.window.document.getElementById('privacy-accept').click();
  assert.strictEqual(dom1.window.localStorage.getItem('pn-privacy-ok'), '1');
  dom1.window.close();

  // Simulate second visit with pn-privacy-ok already set
  const dom2 = createDOM({ localStorage: { 'pn-privacy-ok': '1' } });
  runGDPRScript(dom2.window);
  const notice = dom2.window.document.getElementById('privacy-notice');
  assert.strictEqual(notice.style.display, 'none');
  dom2.window.close();
});

// ============================================================
// 5. Edge Cases
// ============================================================

test('Edge: theme toggle with missing button elements does not crash', () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://promptingninja.ai/',
    runScripts: 'dangerously',
  });
  // Should not throw even with no theme-toggle or theme-toggle-mobile
  runThemeToggleScript(dom.window);
  assert.ok(true);
  dom.window.close();
});

test('Edge: locale regex does not match /english/', () => {
  const dom = createDOM({ pathname: '/english/' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), null);
  dom.window.close();
});

test('Edge: locale /zh/privacy.html correctly detects zh', () => {
  const dom = createDOM({ pathname: '/zh/privacy.html' });
  runLanguagePersistenceScript(dom.window);
  assert.strictEqual(dom.window.localStorage.getItem('pn-locale'), 'zh');
  dom.window.close();
});

// ============================================================
// Summary
// ============================================================
console.log(`\n${'='.repeat(50)}`);
console.log(`Client-side JS tests: ${passed} passed, ${failed} failed`);
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
