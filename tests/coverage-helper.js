const fs = require('fs');
const path = require('path');

const COVERAGE_DIR = path.join(__dirname, '..', 'coverage', 'playwright');
const COVERAGE_FILE = path.join(COVERAGE_DIR, 'coverage.json');

let allCoverage = [];

/**
 * Starts JS coverage collection on the page.
 * Should be called in beforeEach or at the start of a test.
 * @param {import('@playwright/test').Page} page
 */
async function startCoverage(page) {
  // Only start coverage if the browser context supports it (Chromium only)
  if (page.coverage) {
    await page.coverage.startJSCoverage({ resetOnNavigation: false });
  }
}

/**
 * Stops JS coverage collection and aggregates the results.
 * Should be called in afterEach or at the end of a test.
 * @param {import('@playwright/test').Page} page
 */
async function stopCoverage(page) {
  if (page.coverage) {
    const coverage = await page.coverage.stopJSCoverage();
    // Filter to only include our source files
    const filtered = coverage.filter(entry =>
      entry.url.includes('/js/') && !entry.url.includes('node_modules')
    );
    allCoverage.push(...filtered);
  }
}

/**
 * Writes all accumulated coverage data to a JSON file.
 * Should be called in a global teardown or afterAll hook.
 */
function saveCoverageReport() {
  if (allCoverage.length === 0) {
    console.log('[Coverage Helper] No coverage data collected.');
    return;
  }

  // Ensure directory exists
  if (!fs.existsSync(COVERAGE_DIR)) {
    fs.mkdirSync(COVERAGE_DIR, { recursive: true });
  }

  fs.writeFileSync(COVERAGE_FILE, JSON.stringify(allCoverage, null, 2));
  console.log(`[Coverage Helper] Coverage report saved to ${COVERAGE_FILE}`);
}

/**
 * Resets the in-memory coverage data.
 */
function resetCoverage() {
  allCoverage = [];
}

module.exports = {
  startCoverage,
  stopCoverage,
  saveCoverageReport,
  resetCoverage
};
