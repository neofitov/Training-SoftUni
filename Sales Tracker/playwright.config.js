const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 10000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  // Spins up a local HTTP server before running tests (solves the file:// CORS issue for ES modules)
  webServer: {
    command: 'npx serve . --listen 3000 --no-clipboard',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
  },
});
