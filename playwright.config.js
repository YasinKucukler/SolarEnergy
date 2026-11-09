const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  /* Fazla paralel tarayıcı işlemciyi doldurup tıklamaları zaman aşımına düşürüyor; 4 hem kararlı hem en hızlısı */
  workers: 4,
  retries: 0,
  reporter: 'html',
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    /* -s (SPA modu) KULLANMAYIN: her adrese index.html döner. cleanUrls kapalı: .html adresleri yönlendirilmez */
    command: 'npx serve . -l 3000 --no-clipboard -c tests/serve.json',
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
