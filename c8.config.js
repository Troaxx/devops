module.exports = {
  all: true,
  include: [
    'index.js',
    'utils/**/*.js'
  ],
  exclude: [
    'node_modules/**',
    'tests/**',
    'public/**',
    '*.config.js',
    'coverage/**',
    'utils/TestRunner.js'
  ],
  reporter: ['html', 'text', 'json-summary', 'lcov'],
  reportsDirectory: './coverage',
  tempDirectory: './.nyc_output',
  checkCoverage: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80
  }
};

