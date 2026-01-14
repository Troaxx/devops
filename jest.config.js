module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/backend_unit/**/*.test.js',
    '**/tests/**/api/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/'
  ],
  collectCoverageFrom: [
    'utils/DaniellaUtil.js'
  ],
  coverageDirectory: './coverage/jest',
  coverageReporters: ['html', 'text', 'lcov', 'json-summary'],
  coverageThreshold: {
    'utils/DaniellaUtil.js': {
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95
    }
  },
  verbose: true,
  testTimeout: 30000
};


