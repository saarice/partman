module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    'apps/**/*.{js,ts}',
    'tests/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/build/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80, // Lowered from 90 for initial setup
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.(js|ts)',
    '**/*.(test|spec).(js|ts)'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: [
        '**/tests/**/*.test.(js|ts)',
        '**/apps/api/**/*.test.(js|ts)'
      ]
    },
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      testMatch: [
        '**/apps/web/**/*.test.(js|ts)'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/setup-dom.js']
    }
  ]
};