const fs = require('fs');
const path = require('path');
const v8ToIstanbul = require('v8-to-istanbul');
const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const reports = require('istanbul-reports');

// Paths
const playwrightCoverageDir = path.join(__dirname, '..', 'coverage', 'playwright');
const istanbulCoverageDir = path.join(__dirname, '..', 'coverage', 'playwright-istanbul');
const sourceDir = path.join(__dirname, '..', 'public', 'js');

async function convertCoverage() {
  // Check if coverage directory exists
  if (!fs.existsSync(playwrightCoverageDir)) {
    console.error('Coverage directory not found:', playwrightCoverageDir);
    process.exit(1);
  }

  // Find all JSON coverage files
  const coverageFiles = fs.readdirSync(playwrightCoverageDir).filter(f => f.endsWith('.json'));

  if (coverageFiles.length === 0) {
    console.error('No coverage files found in:', playwrightCoverageDir);
    console.error('Run "npm run test:playwright:coverage" first.');
    process.exit(1);
  }

  // Combine V8 coverage data from all files
  let v8Coverage = [];
  for (const file of coverageFiles) {
    const filePath = path.join(playwrightCoverageDir, file);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(data)) {
        v8Coverage.push(...data);
      }
    } catch (e) {
      console.warn(`Warning: Failed to read ${file}: ${e.message}`);
    }
  }

  // Create an Istanbul coverage map
  const coverageMap = createCoverageMap({});

  // Track included and skipped files (use Set to avoid duplicates)
  const includedFiles = new Set();
  const skippedFiles = new Set();

  // Get all JS files in source directory for reference
  const allSourceFiles = fs.readdirSync(sourceDir).filter(f => f.endsWith('.js'));

  // Convert each V8 coverage entry to Istanbul format
  for (const entry of v8Coverage) {
    try {
      // Extract filename from URL
      const url = new URL(entry.url);
      const filename = path.basename(url.pathname);

      // Only process daniella.js (the Create feature file)
      if (filename !== 'daniella.js') {
        if (allSourceFiles.includes(filename) && !skippedFiles.has(filename)) {
          skippedFiles.add(filename);
        }
        continue;
      }

      const sourcePath = path.join(sourceDir, filename);

      // Skip if source file doesn't exist locally
      if (!fs.existsSync(sourcePath)) {
        continue;
      }

      // Track included file (only add once)
      if (!includedFiles.has(filename)) {
        includedFiles.add(filename);
      }

      // Convert V8 coverage to Istanbul format
      const converter = v8ToIstanbul(sourcePath, 0, { source: entry.source });
      await converter.load();
      converter.applyCoverage(entry.functions);

      const istanbulCoverage = converter.toIstanbul();
      coverageMap.merge(istanbulCoverage);
    } catch (err) {
      console.warn(`Warning: Could not process ${entry.url}: ${err.message}`);
    }
  }

  // Add remaining source files that weren't encountered
  allSourceFiles.forEach(f => {
    if (!includedFiles.has(f)) {
      skippedFiles.add(f);
    }
  });

  // Print file processing summary
  console.log('');
  includedFiles.forEach(f => console.log(`Processing coverage for: /js/${f}`));
  skippedFiles.forEach(f => console.log(`Skipping: /js/${f}`));

  // Ensure output directory exists
  if (!fs.existsSync(istanbulCoverageDir)) {
    fs.mkdirSync(istanbulCoverageDir, { recursive: true });
  }

  // Generate HTML and lcov reports
  const context = createContext({ dir: istanbulCoverageDir, coverageMap });
  ['html', 'lcovonly'].forEach(type => reports.create(type).execute(context));

  // Retrieve overall coverage summary data from the coverage map
  const summary = coverageMap.getCoverageSummary().data;

  // Define minimum acceptable coverage thresholds for each metric (in percentage)
  const thresholds = {
    lines: 95,
    statements: 95,
    functions: 95,
    branches: 95
  };

  // Array to store any metrics that do not meet the defined threshold
  let belowThreshold = [];

  // Loop through each coverage metric (lines, statements, functions, branches)
  for (const [metric, threshold] of Object.entries(thresholds)) {
    const covered = summary[metric].pct; // Get the coverage percentage for this metric
    // Check if the actual coverage is below the threshold
    if (covered < threshold) {
      // Add a message to the belowThreshold array for reporting later
      belowThreshold.push(`${metric}: ${covered}% (below ${threshold}%)`);
    }
  }

  // Print summary
  console.log('\n--- Frontend Coverage Summary ---');
  console.log(`Lines:      ${summary.lines.pct}%`);
  console.log(`Statements: ${summary.statements.pct}%`);
  console.log(`Functions:  ${summary.functions.pct}%`);
  console.log(`Branches:   ${summary.branches.pct}%`);

    // If any metrics fall below the required threshold
  if (belowThreshold.length > 0) {
    console.error('\nX Coverage threshold NOT met:');
    // Print each failing metric and its coverage percentage
    belowThreshold.forEach(msg => console.error(`  - ${msg}`));
    // Set exit code to 1 to indicate failure (useful for CI/CD pipelines)
    process.exitCode = 1;
  } else {
    // If all thresholds are met, display a success message
    console.log('\n✓ All coverage thresholds met.');
  }

  console.log(`\nCoverage report generated in ${istanbulCoverageDir}`);
}

convertCoverage();
