import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3456',
    headless: true,
  },
  webServer: {
    command: 'npx serve . -l 3456 --no-clipboard',
    port: 3456,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 720 } },
      testIgnore: /mobile/,
    },
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 667 } },
      testMatch: /mobile/,
    },
  ],
});
