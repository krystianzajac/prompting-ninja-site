# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: website.spec.ts >> Dark mode contrast >> key elements have readable text in dark mode
- Location: e2e/website.spec.ts:133:7

# Error details

```
Error: feature card: color=rgb(229, 231, 235) bg=rgb(242, 243, 245) ratio=1.12

expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 3
Received:    1.115118882059628
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e2]:
    - link "Prompting Ninja Prompting Ninja" [ref=e3] [cursor=pointer]:
      - /url: /
      - img "Prompting Ninja" [ref=e4]
      - heading "Prompting Ninja" [level=1] [ref=e5]
    - navigation [ref=e6]:
      - link "Features" [ref=e7] [cursor=pointer]:
        - /url: "#features"
      - link "Library" [ref=e8] [cursor=pointer]:
        - /url: "#library"
      - link "FAQ" [ref=e9] [cursor=pointer]:
        - /url: "#faq"
      - link "Privacy" [ref=e10] [cursor=pointer]:
        - /url: privacy.html
      - link "Get it Free" [ref=e11] [cursor=pointer]:
        - /url: "#install"
      - button "Toggle dark mode" [active] [ref=e12] [cursor=pointer]: ☀
      - button "Change language" [ref=e14] [cursor=pointer]:
        - generic [ref=e15]: 🇬🇧 English
        - img [ref=e16]
  - generic [ref=e18]:
    - generic [ref=e19]: Free Chrome Extension - No Account Needed
    - heading "Your best AI prompts. One click away." [level=2] [ref=e20]:
      - text: Your best AI prompts.
      - text: One click away.
    - paragraph [ref=e21]: Stop wasting time rewriting prompts from memory. Store them once, find them in seconds, paste them anywhere.
    - link "Download Free" [ref=e23] [cursor=pointer]:
      - /url: prompting-ninja.zip
      - img [ref=e24]
      - text: Download Free
    - paragraph [ref=e26]:
      - text: Works with
      - strong [ref=e27]: ChatGPT
      - text: ","
      - strong [ref=e28]: Claude
      - text: ","
      - strong [ref=e29]: Gemini
      - text: ", and any website."
      - link "See install instructions below." [ref=e30] [cursor=pointer]:
        - /url: "#install"
  - generic [ref=e32]:
    - heading "You've written great prompts before. Can you find them now?" [level=3] [ref=e33]:
      - text: You've written great prompts before.
      - text: Can you find them now?
    - paragraph [ref=e34]: "Every AI power user has the same problem:"
    - list [ref=e35]:
      - listitem [ref=e36]: ✕ You wrote a perfect prompt last week - now it's buried in a chat history
      - listitem [ref=e37]: ✕ You keep rewriting the same prompts from memory, slightly worse each time
      - listitem [ref=e38]: ✕ Your best prompts are scattered across notes, docs, and browser tabs
      - listitem [ref=e39]: ✕ Switching between AI tools means starting from scratch every time
    - paragraph [ref=e40]: Prompting Ninja fixes this in under 3 seconds.
  - generic [ref=e41]:
    - generic [ref=e42]: How It Works
    - heading "Three steps. Zero friction." [level=3] [ref=e43]
    - generic [ref=e44]:
      - generic [ref=e45]:
        - generic [ref=e46]: "1"
        - heading "Save your prompt" [level=4] [ref=e47]
        - paragraph [ref=e48]: Store any prompt with a title, category, and tags. Or start with our curated library of 38 ready-to-use prompts.
      - generic [ref=e49]:
        - generic [ref=e50]: "2"
        - heading "Find it instantly" [level=4] [ref=e51]
        - paragraph [ref=e52]: Search across everything - titles, content, tags. Results appear as you type. Your best prompts are always one click away.
      - generic [ref=e53]:
        - generic [ref=e54]: "3"
        - heading "Use it anywhere" [level=4] [ref=e55]
        - paragraph [ref=e56]: Copy to clipboard or insert directly into ChatGPT, Claude, or any text field on the web. One click, done.
  - generic [ref=e57]:
    - generic [ref=e58]: Features
    - heading "Built for people who use AI every day" [level=3] [ref=e59]
    - generic [ref=e60]:
      - generic [ref=e61]:
        - generic [ref=e62]: ⚡
        - heading "Instant search" [level=4] [ref=e63]
        - paragraph [ref=e64]: Find any prompt in milliseconds. Search across titles, content, categories, and tags as you type.
      - generic [ref=e65]:
        - generic [ref=e66]: 📋
        - heading "One-click copy & insert" [level=4] [ref=e67]
        - paragraph [ref=e68]: Copy to clipboard or insert directly into ChatGPT, Claude, and standard web inputs. Clipboard fallback if insertion fails.
      - generic [ref=e69]:
        - generic [ref=e70]: 🏷️
        - heading "Categories & tags" [level=4] [ref=e71]
        - paragraph [ref=e72]: Organise prompts with categories and tags. Filter, sort, and browse. Default categories included - customise everything.
      - generic [ref=e73]:
        - generic [ref=e74]: ⭐
        - heading "Favourites & recently used" [level=4] [ref=e75]
        - paragraph [ref=e76]: Star your best prompts. Sort by recently used, most used, newest, or title. Your workflow adapts to you.
      - generic [ref=e77]:
        - generic [ref=e78]: 🌙
        - heading "Dark & light themes" [level=4] [ref=e79]
        - paragraph [ref=e80]: Follows your system preference or set it manually. Designed to look premium either way.
      - generic [ref=e81]:
        - generic [ref=e82]: 🔄
        - heading "Sync across devices" [level=4] [ref=e83]
        - paragraph [ref=e84]: Optionally sync via Chrome's built-in sync. Works across all your computers automatically.
      - generic [ref=e85]:
        - generic [ref=e86]: 🌍
        - heading "12 languages, built in" [level=4] [ref=e87]
        - paragraph [ref=e88]: Full UI and prompt library in English, Polish, Spanish, Portuguese, Ukrainian, French, German, Italian, Japanese, Chinese, and Arabic with RTL support.
      - generic [ref=e89]:
        - generic [ref=e90]: 📦
        - heading "Import & export" [level=4] [ref=e91]
        - paragraph [ref=e92]: Export your entire library as JSON. Import it on another machine. Your prompts are always portable.
      - generic [ref=e93]:
        - generic [ref=e94]: 🔒
        - heading "Private by default" [level=4] [ref=e95]
        - paragraph [ref=e96]: All data stays in your browser. No accounts, no tracking, no servers. Your prompts are yours.
  - generic [ref=e97]:
    - generic [ref=e98]: Starter Library
    - heading "39 prompts, ready to use" [level=3] [ref=e99]
    - paragraph [ref=e100]: Start with a curated library of high-quality prompts for everyday AI work. Add your own, edit anything, build your personal collection.
    - generic [ref=e101]:
      - generic [ref=e102]: Writing
      - generic [ref=e103]: Analysis
      - generic [ref=e104]: Business
      - generic [ref=e105]: Productivity
      - generic [ref=e106]: Creative
      - generic [ref=e107]: Learning
    - generic [ref=e108]:
      - generic [ref=e109]:
        - strong [ref=e110]: Rewrite for clarity
        - text: Rewrite the text below for clarity, simplicity, and flow. Keep the original meaning...
      - generic [ref=e111]:
        - strong [ref=e112]: Challenge my thinking
        - text: Identify weak assumptions, blind spots, missing evidence, and what a smart sceptic would say...
      - generic [ref=e113]:
        - strong [ref=e114]: Turn this into an action plan
        - text: Clear action plan with objective, key tasks, logical sequence, dependencies, risks...
  - generic [ref=e115]:
    - generic [ref=e116]:
      - generic [ref=e117]:
        - generic [ref=e118]: "39"
        - generic [ref=e119]: Ready-to-use prompts
      - generic [ref=e120]:
        - generic [ref=e121]: "6"
        - generic [ref=e122]: Categories
      - generic [ref=e123]:
        - generic [ref=e124]: "0"
        - generic [ref=e125]: Data collected
      - generic [ref=e126]:
        - generic [ref=e127]: 100%
        - generic [ref=e128]: Free
    - generic [ref=e129]:
      - generic [ref=e130]:
        - generic [ref=e131]: "\"I use AI tools all day. Before this, my best prompts were buried across 20 different chat threads. Now I find them in seconds.\""
        - generic [ref=e132]: "- Kris Z."
      - generic [ref=e133]:
        - generic [ref=e134]: "\"The starter library alone saved me hours. I just added them all and started using them immediately. No setup, no friction.\""
        - generic [ref=e135]: "- Andy L."
      - generic [ref=e136]:
        - generic [ref=e137]: "\"Finally something that respects privacy. No account, no cloud, no tracking. Just a fast prompt library that works.\""
        - generic [ref=e138]: "- Mia H."
      - generic [ref=e139]:
        - generic [ref=e140]: "\"I copy-paste prompts into ChatGPT and Claude dozens of times a day. This extension cut that workflow from minutes to one click.\""
        - generic [ref=e141]: "- Aneta M."
      - generic [ref=e142]:
        - generic [ref=e143]: "\"Dark mode looks beautiful. The whole thing feels like it was designed by Apple. Clean, fast, and stays out of the way.\""
        - generic [ref=e144]: "- Louis A."
  - generic [ref=e145]:
    - heading "Your prompts are yours" [level=3] [ref=e146]
    - paragraph [ref=e147]: "We built Prompting Ninja with a simple belief: your prompts are your intellectual property. We never see them."
    - list [ref=e148]:
      - listitem [ref=e149]: ✓ All data stored locally in your browser
      - listitem [ref=e150]: ✓ No account or sign-up required
      - listitem [ref=e151]: ✓ No analytics, tracking, or telemetry
      - listitem [ref=e152]: ✓ No external servers or cloud dependency
      - listitem [ref=e153]: ✓ Minimal permissions - only what's needed
      - listitem [ref=e154]: ✓ Open to inspection - we have nothing to hide
  - generic [ref=e155]:
    - generic [ref=e156]: FAQ
    - heading "Common questions" [level=3] [ref=e157]
    - generic [ref=e158]:
      - heading "Is it really free?" [level=4] [ref=e159]
      - paragraph [ref=e160]: Yes, completely free. No premium tier, no trial period, no hidden costs. We built this because we needed it ourselves.
    - generic [ref=e161]:
      - heading "Do I need to create an account?" [level=4] [ref=e162]
      - paragraph [ref=e163]: No. Install it and start using it immediately. No email, no sign-up, no password. Your data is stored locally in your browser.
    - generic [ref=e164]:
      - heading "Which AI tools does it work with?" [level=4] [ref=e165]
      - paragraph [ref=e166]: Prompting Ninja works with any website. It can insert prompts directly into ChatGPT, Claude, Gemini, and standard text fields - including Gmail (which now includes Gemini). For any other tool, one-click copy to clipboard works everywhere.
    - generic [ref=e167]:
      - heading "Can I sync my prompts across devices?" [level=4] [ref=e168]
      - paragraph [ref=e169]: Yes, optionally. Turn on Chrome Sync in settings and your prompts travel with your Chrome profile across all your computers. No account needed - it uses Chrome's built-in sync.
    - generic [ref=e170]:
      - heading "Is my data private?" [level=4] [ref=e171]
      - paragraph [ref=e172]: Completely. All prompts are stored locally in your browser. We don't run servers, collect analytics, or see your data. The extension requests only the minimum permissions needed to function.
    - generic [ref=e173]:
      - heading "Can I import my existing prompts?" [level=4] [ref=e174]
      - paragraph [ref=e175]: Yes. Import from JSON, or start with our curated library of 39 prompts and build from there. You can also export your entire library at any time.
    - generic [ref=e176]:
      - heading "What if I switch browsers?" [level=4] [ref=e177]
      - paragraph [ref=e178]: Export your library as JSON and import it into Prompting Ninja on any other Chrome-based browser (Chrome, Edge, Brave, Arc).
  - generic [ref=e179]:
    - heading "Stop rewriting prompts from memory" [level=3] [ref=e180]
    - paragraph [ref=e181]: Join AI power users who save hours every week by keeping their best prompts one click away.
    - link "Download Free" [ref=e182] [cursor=pointer]:
      - /url: prompting-ninja.zip
      - img [ref=e183]
      - text: Download Free
    - paragraph [ref=e185]:
      - text: Then follow the
      - link "simple install steps" [ref=e186] [cursor=pointer]:
        - /url: "#install"
      - text: below. No account needed.
  - generic [ref=e187]:
    - heading "How to install" [level=3] [ref=e188]
    - list [ref=e189]:
      - listitem [ref=e190]:
        - link "Download the zip file" [ref=e191] [cursor=pointer]:
          - /url: prompting-ninja.zip
        - text: and unzip it anywhere on your computer.
      - listitem [ref=e192]:
        - text: Open Chrome and go to
        - strong [ref=e193]: chrome://extensions
        - text: (paste it into your address bar).
      - listitem [ref=e194]:
        - text: Turn on
        - strong [ref=e195]: Developer mode
        - text: using the toggle in the top-right corner.
      - listitem [ref=e196]:
        - text: Click
        - strong [ref=e197]: Load unpacked
        - text: and select the unzipped folder.
      - listitem [ref=e198]: Done! Click the shuriken icon in your toolbar to start using Prompting Ninja.
    - paragraph [ref=e199]: Coming soon to the Chrome Web Store for one-click install.
  - generic [ref=e201]:
    - generic [ref=e202]: The Story
    - heading "Built out of frustration" [level=3] [ref=e203]
    - paragraph [ref=e204]:
      - text: I'm
      - link "Krystian" [ref=e205] [cursor=pointer]:
        - /url: https://www.linkedin.com/in/krystianzajac/
      - text: "- and I built Prompting Ninja because I was tired of losing my best prompts."
    - paragraph [ref=e206]: Every day I use ChatGPT, Claude, and Gemini for everything from writing to coding to strategy. And every day I'd waste time hunting through old chat threads, notes, and docs trying to find that one prompt that worked perfectly last week.
    - paragraph [ref=e207]: I kept rewriting the same prompts from memory. It was maddening.
    - paragraph [ref=e208]: "So I built the tool I desperately needed: a fast, private prompt library that lives in my browser and lets me find and use any prompt in one click. No accounts, no cloud, no complexity. Just my prompts, ready when I need them."
    - paragraph [ref=e209]: If you use AI tools daily, I think you'll find it as useful as I do.
    - generic [ref=e210]:
      - link "@krystianzajac" [ref=e211] [cursor=pointer]:
        - /url: https://x.com/krystianzajac
        - img [ref=e212]
        - text: "@krystianzajac"
      - link "LinkedIn" [ref=e214] [cursor=pointer]:
        - /url: https://www.linkedin.com/in/krystianzajac/
        - img [ref=e215]
        - text: LinkedIn
  - contentinfo [ref=e217]:
    - link "Privacy Policy" [ref=e219] [cursor=pointer]:
      - /url: privacy.html
    - paragraph [ref=e220]: © 2026 Prompting Ninja. All rights reserved.
  - generic [ref=e222]:
    - paragraph [ref=e223]:
      - text: This website does not use cookies or tracking. We store your language preference locally in your browser. See our
      - link "Privacy Policy" [ref=e224] [cursor=pointer]:
        - /url: privacy.html
      - text: for details.
    - button "Got it" [ref=e225] [cursor=pointer]
```

# Test source

```ts
  74  | });
  75  | 
  76  | test.describe('Install section', () => {
  77  |   test('install section visible with download link', async ({ page }) => {
  78  |     await page.goto('/');
  79  |     const install = page.locator('#install');
  80  |     await expect(install).toBeVisible();
  81  | 
  82  |     const downloadLink = page.locator('a[href="prompting-ninja.zip"][download]').first();
  83  |     await expect(downloadLink).toBeVisible();
  84  |   });
  85  | });
  86  | 
  87  | test.describe('GDPR banner', () => {
  88  |   test('shows on first visit and is dismissible', async ({ page }) => {
  89  |     // Clear any prior localStorage
  90  |     await page.goto('/');
  91  |     await page.evaluate(() => localStorage.removeItem('pn-privacy-ok'));
  92  |     await page.reload();
  93  | 
  94  |     const banner = page.locator('#privacy-notice');
  95  |     await expect(banner).toBeVisible();
  96  | 
  97  |     // Click "Got it"
  98  |     await banner.locator('button').click();
  99  |     await expect(banner).toBeHidden();
  100 | 
  101 |     // Reload - banner should not reappear
  102 |     await page.reload();
  103 |     await expect(banner).toBeHidden();
  104 |   });
  105 | });
  106 | 
  107 | test.describe('Dark mode contrast', () => {
  108 |   /** Parse an rgb/rgba string into [r, g, b] */
  109 |   function parseRgb(color: string): [number, number, number] {
  110 |     const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  111 |     if (!m) return [0, 0, 0];
  112 |     return [Number(m[1]), Number(m[2]), Number(m[3])];
  113 |   }
  114 | 
  115 |   /** Relative luminance per WCAG 2.0 */
  116 |   function luminance([r, g, b]: [number, number, number]): number {
  117 |     const [rs, gs, bs] = [r, g, b].map(c => {
  118 |       const s = c / 255;
  119 |       return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  120 |     });
  121 |     return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  122 |   }
  123 | 
  124 |   /** Contrast ratio between two colours (>= 1) */
  125 |   function contrastRatio(a: string, b: string): number {
  126 |     const la = luminance(parseRgb(a));
  127 |     const lb = luminance(parseRgb(b));
  128 |     const lighter = Math.max(la, lb);
  129 |     const darker = Math.min(la, lb);
  130 |     return (lighter + 0.05) / (darker + 0.05);
  131 |   }
  132 | 
  133 |   test('key elements have readable text in dark mode', async ({ page }) => {
  134 |     await page.goto('/');
  135 |     await page.locator('#theme-toggle').click();
  136 |     await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  137 | 
  138 |     // Check contrast on representative elements
  139 |     const selectors = [
  140 |       { name: 'hero title', sel: 'h2[data-i18n="hero_title"]' },
  141 |       { name: 'feature card', sel: '.feature h4' },
  142 |       { name: 'testimonial text', sel: '.testimonial-text' },
  143 |       { name: 'faq item title', sel: '.faq-item h4' },
  144 |     ];
  145 | 
  146 |     for (const { name, sel } of selectors) {
  147 |       const el = page.locator(sel).first();
  148 |       await expect(el).toBeVisible();
  149 | 
  150 |       const styles = await el.evaluate((node) => {
  151 |         const cs = window.getComputedStyle(node);
  152 |         return { color: cs.color, bg: cs.backgroundColor };
  153 |       });
  154 | 
  155 |       // If bg is transparent, walk up to find an opaque ancestor
  156 |       let bg = styles.bg;
  157 |       if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
  158 |         bg = await el.evaluate((node) => {
  159 |           let current = node.parentElement;
  160 |           while (current) {
  161 |             const cs = window.getComputedStyle(current);
  162 |             if (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent') {
  163 |               return cs.backgroundColor;
  164 |             }
  165 |             current = current.parentElement;
  166 |           }
  167 |           return 'rgb(0, 0, 0)'; // fallback to black for dark mode body
  168 |         });
  169 |       }
  170 | 
  171 |       const ratio = contrastRatio(styles.color, bg);
  172 |       // WCAG AA requires >= 4.5 for normal text, >= 3 for large text
  173 |       // We use 3 as the floor since headings count as large text
> 174 |       expect(ratio, `${name}: color=${styles.color} bg=${bg} ratio=${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
      |                                                                                          ^ Error: feature card: color=rgb(229, 231, 235) bg=rgb(242, 243, 245) ratio=1.12
  175 |     }
  176 |   });
  177 | });
  178 | 
  179 | test.describe('Privacy page nav consistency', () => {
  180 |   test('privacy page has same nav elements as homepage', async ({ page }) => {
  181 |     // Collect nav element presence on homepage
  182 |     await page.goto('/');
  183 |     await expect(page.locator('.logo')).toBeVisible();
  184 |     await expect(page.locator('#theme-toggle')).toBeVisible();
  185 |     await expect(page.locator('#lang-switcher')).toBeVisible();
  186 |     await expect(page.locator('.nav-cta')).toBeVisible();
  187 | 
  188 |     // Now check privacy page has the same elements
  189 |     await page.goto('/privacy.html');
  190 |     await expect(page.locator('.logo')).toBeVisible();
  191 |     await expect(page.locator('#theme-toggle')).toBeVisible();
  192 |     await expect(page.locator('#lang-switcher')).toBeVisible();
  193 |     await expect(page.locator('.nav-cta')).toBeVisible();
  194 | 
  195 |     // Verify logo links home
  196 |     const logoHref = await page.locator('.logo').getAttribute('href');
  197 |     expect(logoHref).toBe('/');
  198 |   });
  199 | });
  200 | 
```