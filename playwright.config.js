const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 4,
  timeout: 60000,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5050',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 60000,
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
    {
      name: 'mobile-chromium',
      testMatch: '**/frontend/**/*.test.js',
      testIgnore: ['**/backend_unit/**', '**/api/**'],
      use: { ...devices['Mobile Chrome'] },
    },
    {
      name: 'mobile-webkit',
      testMatch: '**/frontend/**/*.test.js',
      testIgnore: ['**/backend_unit/**', '**/api/**'],
      use: { ...devices['Mobile Safari'] },
    },
    {
      name: 'mobile-firefox',
      testMatch: '**/frontend/**/*.test.js',
      testIgnore: ['**/backend_unit/**', '**/api/**'],
      use: { ...devices['Mobile Firefox'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:5050',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
