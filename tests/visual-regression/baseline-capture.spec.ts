import { test, expect } from '@playwright/test';

/**
 * Baseline Screenshot Capture for Static HTML Pages
 * Phase 1: Capture APPROVED BASELINE for all 6 pages
 *
 * These screenshots will be the "source of truth" that React must match pixel-perfect.
 */

test.describe('BASELINE CAPTURE - Static HTML Pages', () => {
  // Configure test timeout for slower page loads
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Wait for any animations to complete
    await page.waitForTimeout(500);
  });

  test('1. Main Dashboard (index.html) - APPROVED BASELINE', async ({ page }) => {
    await page.goto('/');

    // Wait for navigation to load
    await page.waitForSelector('.app-sidebar', { state: 'visible' });

    // Wait for KPI cards to be visible
    await page.waitForSelector('.kpi-card', { state: 'visible' });

    // Wait for charts to render
    await page.waitForSelector('.chart-container', { state: 'visible' });

    // Capture full page screenshot
    await expect(page).toHaveScreenshot('01-main-dashboard.png', {
      fullPage: true,
    });
  });

  test('2. Opportunities Dashboard', async ({ page }) => {
    await page.goto('/opportunities-dashboard-enterprise.html');

    // Wait for page-specific elements
    await page.waitForSelector('.app-sidebar', { state: 'visible' });
    await page.waitForSelector('.kpi-card', { state: 'visible' });

    // Capture full page screenshot
    await expect(page).toHaveScreenshot('02-opportunities-dashboard.png', {
      fullPage: true,
    });
  });

  test('3. Partnerships Dashboard', async ({ page }) => {
    await page.goto('/partnerships-dashboard-enterprise.html');

    // Wait for page-specific elements
    await page.waitForSelector('.app-sidebar', { state: 'visible' });
    await page.waitForSelector('.kpi-card', { state: 'visible' });

    // Capture full page screenshot
    await expect(page).toHaveScreenshot('03-partnerships-dashboard.png', {
      fullPage: true,
    });
  });

  test('4. Financial Dashboard', async ({ page }) => {
    await page.goto('/financial-dashboard-enterprise.html');

    // Wait for page-specific elements
    await page.waitForSelector('.app-sidebar', { state: 'visible' });
    await page.waitForSelector('.kpi-card', { state: 'visible' });

    // Capture full page screenshot
    await expect(page).toHaveScreenshot('04-financial-dashboard.png', {
      fullPage: true,
    });
  });

  test('5. Partnership Manager', async ({ page }) => {
    await page.goto('/partnership-manager-enterprise.html');

    // Wait for page-specific elements
    await page.waitForSelector('.app-sidebar', { state: 'visible' });
    await page.waitForSelector('.data-table', { state: 'visible' });

    // Capture full page screenshot
    await expect(page).toHaveScreenshot('05-partnership-manager.png', {
      fullPage: true,
    });
  });

  test('6. Opportunities Manager', async ({ page }) => {
    await page.goto('/opportunities-enterprise.html');

    // Wait for page-specific elements
    await page.waitForSelector('.app-sidebar', { state: 'visible' });

    // Capture full page screenshot
    await expect(page).toHaveScreenshot('06-opportunities-manager.png', {
      fullPage: true,
    });
  });
});

test.describe('BASELINE CAPTURE - Component-Level Screenshots', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
  });

  test('Component: KPI Card', async ({ page }) => {
    const kpiCard = page.locator('.kpi-card').first();
    await expect(kpiCard).toHaveScreenshot('component-kpi-card.png');
  });

  test('Component: Data Table', async ({ page }) => {
    await page.goto('/partnership-manager-enterprise.html');
    const dataTable = page.locator('.data-table-container').first();
    await expect(dataTable).toHaveScreenshot('component-data-table.png');
  });

  test('Component: Chart Container', async ({ page }) => {
    const chart = page.locator('.chart-container').first();
    await expect(chart).toHaveScreenshot('component-chart-container.png');
  });

  test('Component: Navigation Sidebar', async ({ page }) => {
    const sidebar = page.locator('.app-sidebar');
    await expect(sidebar).toHaveScreenshot('component-sidebar.png');
  });

  test('Component: Header', async ({ page }) => {
    const header = page.locator('.app-header');
    await expect(header).toHaveScreenshot('component-header.png');
  });
});

test.describe('BASELINE CAPTURE - Responsive Breakpoints', () => {
  test.setTimeout(60000);

  test('Main Dashboard - Tablet View (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('responsive-tablet-1024px.png', {
      fullPage: true,
    });
  });

  test('Main Dashboard - Mobile View (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('responsive-mobile-768px.png', {
      fullPage: true,
    });
  });

  test('Main Dashboard - Mobile View (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('responsive-mobile-390px.png', {
      fullPage: true,
    });
  });
});
