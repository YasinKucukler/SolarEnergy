const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: 'html',
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npx serve -s . -l 3000 --no-clipboard',
    port: 3000,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'mobile',
      use: { browserName: 'chromium', viewport: { width: 375, height: 667 } },
    },
  ],
});
