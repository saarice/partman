import { test, expect } from '@playwright/test';

test.describe('Verify Latest Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin@partman.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboards/overall');
    await page.waitForTimeout(1000);
  });

  test('Capture Overall Dashboard - verify gap fix', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboards/overall');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/fix-overall-dashboard.png',
      fullPage: true
    });

    console.log('Screenshot saved: test-results/fix-overall-dashboard.png');
  });

  test('Capture Opportunity Management - verify icon and no notification', async ({ page }) => {
    await page.goto('http://localhost:3000/management/opportunities');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait to verify no notification appears

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/fix-opportunity-management.png',
      fullPage: true
    });

    console.log('Screenshot saved: test-results/fix-opportunity-management.png');
  });

  test('Capture sidebar close-up - verify icons', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboards/overall');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take sidebar screenshot
    const sidebar = page.locator('nav').first();
    await sidebar.screenshot({
      path: 'test-results/fix-sidebar-icons.png'
    });

    console.log('Screenshot saved: test-results/fix-sidebar-icons.png');
  });
});
