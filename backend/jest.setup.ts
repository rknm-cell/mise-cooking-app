import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/mise_test';
process.env.OPENAI_API_KEY = 'test-key-123';
process.env.BETTER_AUTH_SECRET = 'test-secret-key';
process.env.API_KEY = 'test-api-key';
process.env.PORT = '8080';

// Increase timeout for integration tests
jest.setTimeout(10000);

// Mock console methods to keep test output clean
const mockConsole: Console = {
  ...console,
  log: jest.fn<Console['log']>(),
  debug: jest.fn<Console['debug']>(),
  info: jest.fn<Console['info']>(),
  warn: jest.fn<Console['warn']>(),
  error: jest.fn<Console['error']>(),
};

global.console = mockConsole;
