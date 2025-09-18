// DOM setup for Jest tests
import 'jest-environment-jsdom';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup DOM environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;