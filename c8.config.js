module.exports = {
  all: true,
  include: [
    'index.js',
    'public/**/*.js'
  ],
  exclude: [
    'node_modules/**',
    'tests/**',
    '*.config.js',
    'coverage/**'
  ],
  reporter: ['html', 'text', 'lcov'],
  reportsDirectory: './coverage/playwright',
  tempDirectory: './.nyc_output',
  checkCoverage: {
    statements: 95,
    branches: 95,
    functions: 95,
    lines: 95
  }
};

