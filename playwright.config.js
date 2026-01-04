const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'frontend-chromium',
      testMatch: '**/frontend/**/*.test.js',
      testIgnore: ['**/backend_unit/**', '**/api/**'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'frontend-firefox',
      testMatch: '**/frontend/**/*.test.js',
      testIgnore: ['**/backend_unit/**', '**/api/**'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'frontend-webkit',
      testMatch: '**/frontend/**/*.test.js',
      testIgnore: ['**/backend_unit/**', '**/api/**'],
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:5000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});


