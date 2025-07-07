/**
 * Jest setup file for test environment configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Use random port for testing

// Global test timeout
jest.setTimeout(10000);

// Suppress console logs in tests unless explicitly enabled
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 