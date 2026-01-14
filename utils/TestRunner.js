const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class TestRunner {
  constructor() {
    this.testPaths = {
      all: 'tests',
      create: 'tests/create_function',
      read: 'tests/read_function',
      update: 'tests/update_function',
      delete: 'tests/delete_function',
      backend: 'tests/**/backend_unit',
      api: 'tests/**/api',
      frontend: 'tests/**/frontend'
    };
  }

  async runTests(testType = 'all', withCoverage = false) {
    const testPath = this.testPaths[testType] || this.testPaths.all;
    let command;

    if (withCoverage) {
      command = `npx c8 --reporter=json-summary --reporter=text --reporter=html playwright test ${testPath}`;
    } else {
      command = `npx playwright test ${testPath} --reporter=json`;
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024
      });

      let coverage = null;
      if (withCoverage) {
        try {
          const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
          const coverageData = await fs.readFile(coveragePath, 'utf8');
          coverage = JSON.parse(coverageData);
        } catch (err) {
          console.error('Error reading coverage:', err);
        }
      }

      let testResults = null;
      try {
        const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
        const resultsData = await fs.readFile(resultsPath, 'utf8');
        testResults = JSON.parse(resultsData);
      } catch (err) {
        testResults = this.parseTestOutput(stdout);
      }

      if (!testResults || !testResults.stats) {
        testResults = this.parseTestOutput(stdout);
      }

      return {
        success: true,
        stdout,
        stderr,
        testResults,
        coverage
      };
    } catch (error) {
      let testResults = null;
      try {
        const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
        const resultsData = await fs.readFile(resultsPath, 'utf8');
        testResults = JSON.parse(resultsData);
      } catch (err) {
        testResults = this.parseTestOutput(error.stdout || '');
      }

      if (!testResults || !testResults.stats) {
        testResults = this.parseTestOutput(error.stdout || '');
      }

      let coverage = null;
      if (withCoverage) {
        try {
          const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
          const coverageData = await fs.readFile(coveragePath, 'utf8');
          coverage = JSON.parse(coverageData);
        } catch (err) {
          if (process.env.DEBUG) console.error('Error reading coverage:', err);
        }
      }

      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        testResults,
        coverage
      };
    }
  }

  parseTestOutput(output) {
    const lines = output.split('\n');
    const results = {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
      stats: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };

    lines.forEach(line => {
      if (line.includes('passed')) {
        const match = line.match(/(\d+)\s+passed/);
        if (match) {
          results.passed = parseInt(match[1]);
          results.stats.passed = parseInt(match[1]);
        }
      }
      if (line.includes('failed')) {
        const match = line.match(/(\d+)\s+failed/);
        if (match) {
          results.failed = parseInt(match[1]);
          results.stats.failed = parseInt(match[1]);
        }
      }
      if (line.includes('skipped')) {
        const match = line.match(/(\d+)\s+skipped/);
        if (match) {
          results.skipped = parseInt(match[1]);
          results.stats.skipped = parseInt(match[1]);
        }
      }
    });

    results.total = results.passed + results.failed + results.skipped;
    results.stats.total = results.total;
    return results;
  }

  async getTestList() {
    try {
      const { stdout } = await execAsync('npx playwright test --list', {
        cwd: process.cwd(),
        maxBuffer: 10 * 1024 * 1024
      });

      const tests = this.parseTestList(stdout);
      return {
        success: true,
        tests
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        tests: []
      };
    }
  }

  parseTestList(output) {
    const lines = output.split('\n');
    const tests = {
      create: [],
      read: [],
      update: [],
      delete: [],
      all: []
    };

    const seenTests = {
      create: new Set(),
      read: new Set(),
      update: new Set(),
      delete: new Set()
    };

    let currentFeature = null;

    lines.forEach(line => {
      if (line.includes('create_function')) {
        currentFeature = 'create';
      } else if (line.includes('read_function')) {
        currentFeature = 'read';
      } else if (line.includes('update_function')) {
        currentFeature = 'update';
      } else if (line.includes('delete_function')) {
        currentFeature = 'delete';
      }

      if (line.includes('›') && line.trim()) {
        const testName = line.split('›').pop().trim();
        if (testName && currentFeature && !seenTests[currentFeature].has(testName)) {
          seenTests[currentFeature].add(testName);
          tests[currentFeature].push(testName);
          tests.all.push({ feature: currentFeature, name: testName });
        }
      }
    });

    return tests;
  }

  async getCoverageReport() {
    try {
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
      const coverageData = await fs.readFile(coveragePath, 'utf8');
      const coverage = JSON.parse(coverageData);
      return {
        success: true,
        coverage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        coverage: null
      };
    }
  }
}

module.exports = new TestRunner();

