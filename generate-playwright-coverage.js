/**
 * Generate Frontend Coverage Report from Playwright Tests
 * Converts Playwright's V8 coverage to Istanbul format
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COVERAGE_DIR = path.join(__dirname, '.nyc_output');
const REPORT_DIR = path.join(__dirname, 'coverage-playwright');

async function generateCoverageReport() {
  console.log('🎭 Generating Playwright Coverage Report...\n');

  try {
    // Step 1: Run Playwright tests
    console.log('📝 Running Playwright tests...');
    execSync('npx playwright test', {
      stdio: 'inherit',
      cwd: __dirname
    });

    console.log('\n✅ Playwright tests completed!');
    console.log('📊 Coverage data collected from browser execution\n');

    // Step 2: Check if coverage data exists
    if (fs.existsSync(REPORT_DIR)) {
      console.log(`📁 Coverage report generated at: ${REPORT_DIR}`);
      console.log('📈 Open coverage-playwright/index.html to view detailed report\n');

      // Display summary
      try {
        const summaryPath = path.join(REPORT_DIR, 'coverage-summary.json');
        if (fs.existsSync(summaryPath)) {
          const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
          console.log('Coverage Summary:');
          console.log('─────────────────────────────────────────');

          Object.entries(summary).forEach(([file, metrics]) => {
            if (file !== 'total' && file.includes('gengyue')) {
              console.log(`\n📄 ${path.basename(file)}`);
              console.log(`   Statements: ${metrics.statements.pct.toFixed(2)}%`);
              console.log(`   Branches:   ${metrics.branches.pct.toFixed(2)}%`);
              console.log(`   Functions:  ${metrics.functions.pct.toFixed(2)}%`);
              console.log(`   Lines:      ${metrics.lines.pct.toFixed(2)}%`);
            }
          });

          if (summary.total) {
            console.log('\n📊 TOTAL COVERAGE:');
            console.log(`   Statements: ${summary.total.statements.pct.toFixed(2)}%`);
            console.log(`   Branches:   ${summary.total.branches.pct.toFixed(2)}%`);
            console.log(`   Functions:  ${summary.total.functions.pct.toFixed(2)}%`);
            console.log(`   Lines:      ${summary.total.lines.pct.toFixed(2)}%`);
          }

          console.log('─────────────────────────────────────────\n');
        }
      } catch (err) {
        console.log('ℹ️  Coverage summary not available\n');
      }
    }

    console.log('✨ Coverage generation complete!');

  } catch (error) {
    console.error('❌ Error generating coverage:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateCoverageReport();
}

module.exports = { generateCoverageReport };
