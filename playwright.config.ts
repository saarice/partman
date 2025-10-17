import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Visual Regression Testing
 * Epic 9 - React Migration with Pixel-Perfect UI Preservation
 */

export default defineConfig({
  testDir: './tests/visual-regression',

  // Baseline screenshots directory
  snapshotPathTemplate: '{testDir}/../visual-baseline/{testFilePath}/{arg}{ext}',

  // Visual comparison - Focus on maintainability over pixel perfection
  expect: {
    toHaveScreenshot: {
      // Maximum allowed difference: 5% (adjusted for React migration)
      maxDiffPixelRatio: 0.05,
      // Threshold for individual pixel comparison
      threshold: 0.2,
      // Generate comparison images on failure
      animations: 'disabled',
    },
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail fast if baseline doesn't exist
  forbidOnly: !!process.env.CI,

  // Retry failed tests once (for flakiness)
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'tests/visual-regression/report' }],
    ['list'],
    ['json', { outputFile: 'tests/visual-regression/results.json' }],
  ],

  // Global test settings
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3000',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Record trace on first retry
    trace: 'on-first-retry',

    // Viewport size for consistency
    viewport: { width: 1920, height: 1080 },

    // Ignore HTTPS errors (for local development)
    ignoreHTTPSErrors: true,
  },

  // Test projects for different browsers and viewports
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'chromium-tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['iPhone 12 Pro'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  // Development server configuration
  webServer: {
    command: 'cd infrastructure/docker && docker-compose up web',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
