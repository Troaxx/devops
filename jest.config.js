module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: [
    'utils/GengyueUtil.js',
    // Frontend coverage is collected by Playwright
    // 'public/js/gengyue.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],

  // Ignore frontend tests (now handled by Playwright)
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/',
    '/__tests__/gengyue.frontend.test.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Transform
  transform: {},

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,
};
