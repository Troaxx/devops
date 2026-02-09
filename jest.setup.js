// Jest setup file for global test configuration
// require('@testing-library/jest-dom'); // Not needed for backend/API tests (frontend uses Playwright)

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
