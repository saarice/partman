import { test, expect } from '@playwright/test';

/**
 * React Dashboard Visual Regression Test
 * Compares React implementation to static HTML baseline
 * Tolerance: 5% (focus on maintainability over pixel perfection)
 */

test.describe('React Dashboard - Visual Regression', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    // Capture console logs and errors
    page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Login to get authentication
    await page.goto('/login');

    // Fill in login form (using default admin credentials)
    await page.fill('input[name="email"], input[type="email"]', 'admin@partman.com');
    await page.fill('input[name="password"], input[type="password"]', 'Admin123');

    // Submit login
    await page.click('button[type="submit"]');

    // Wait a moment for login to complete
    await page.waitForTimeout(2000);

    // Navigate directly to dashboard
    await page.goto('/dashboards/overall');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for any animations to complete
    await page.waitForTimeout(1000);
  });

  test('Main Dashboard - React vs Static HTML Baseline', async ({ page }) => {
    // Should already be on dashboard from login
    await page.goto('/dashboards/overall');

    // Wait for React content to render
    await page.waitForSelector('text=Overall Dashboard', { state: 'visible', timeout: 10000 });

    // Wait a bit more for all content
    await page.waitForTimeout(2000);

    // Compare to baseline (from static HTML)
    await expect(page).toHaveScreenshot('01-main-dashboard.png', {
      fullPage: true,
      // 5% tolerance - focus on functional parity and maintainability
      maxDiffPixelRatio: 0.05,
    });
  });
});
