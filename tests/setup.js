// Global test setup
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

// Custom matchers for business logic
expect.extend({
  toBeValidCommissionRate(received) {
    const pass = received >= 0 && received <= 100;
    return {
      message: () => `expected ${received} to be a valid commission rate (0-100%)`,
      pass,
    };
  },

  toBeValidPipelineStage(received) {
    const validStages = ['lead', 'demo', 'poc', 'proposal', 'closed_won', 'closed_lost'];
    const pass = validStages.includes(received);
    return {
      message: () => `expected ${received} to be a valid pipeline stage`,
      pass,
    };
  }
});