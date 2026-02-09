/**
 * Playwright Coverage Collection Helper
 * Instruments client-side JavaScript for code coverage tracking
 */

const { test } = require('@playwright/test');

// Inject coverage collection code before each test
test.beforeEach(async ({ page }) => {
  // Enable JavaScript coverage
  await page.coverage.startJSCoverage({
    resetOnNavigation: false
  });
});

// Collect coverage after each test
test.afterEach(async ({ page }, testInfo) => {
  const coverage = await page.coverage.stopJSCoverage();

  // Filter coverage to only include our source files
  const filteredCoverage = coverage.filter(entry =>
    entry.url.includes('/js/gengyue.js') ||
    entry.url.includes('/js/') && !entry.url.includes('node_modules')
  );

  // Store coverage data in test info for later processing
  if (filteredCoverage.length > 0) {
    testInfo.attachments.push({
      name: 'coverage',
      contentType: 'application/json',
      body: Buffer.from(JSON.stringify(filteredCoverage))
    });
  }
});
