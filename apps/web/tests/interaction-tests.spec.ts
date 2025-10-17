import { test, expect } from '@playwright/test';

test.describe('Dashboard Interactions - Priority 2', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@partman.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboards/overall');
  });

  test('Issue 1: All 5 table columns should be sortable', async ({ page }) => {
    // Helper to get all partner names in order
    const getAllPartnerNames = async () => {
      return await page.locator('table tbody tr td:first-child').allTextContents();
    };

    const initialOrder = await getAllPartnerNames();
    console.log('Initial order:', initialOrder.map(s => s.split('\n')[0]));

    // Test each column sorting
    const testSort = async (columnIndex: number, columnName: string) => {
      console.log(`\n--- Testing ${columnName} column sort ---`);

      // Click the sort label
      await page.click(`table thead th:nth-child(${columnIndex}) .MuiTableSortLabel-root`);
      await page.waitForTimeout(500);

      // Get order after first click (ascending)
      const afterFirstClick = await getAllPartnerNames();
      console.log(`After ${columnName} sort (asc):`, afterFirstClick.map(s => s.split('\n')[0]));

      // Click again to toggle to descending
      await page.click(`table thead th:nth-child(${columnIndex}) .MuiTableSortLabel-root`);
      await page.waitForTimeout(500);

      // Get order after second click (descending)
      const afterSecondClick = await getAllPartnerNames();
      console.log(`After ${columnName} sort (desc):`, afterSecondClick.map(s => s.split('\n')[0]));

      // Verify sorting changed the order
      const orderChanged = JSON.stringify(afterFirstClick) !== JSON.stringify(afterSecondClick);
      expect(orderChanged).toBe(true);
      console.log(`✓ ${columnName} column sorting works!`);
    };

    // Test all 5 columns
    await testSort(1, 'Partner');
    await testSort(2, 'Activity');
    await testSort(3, 'Date');
    await testSort(4, 'Impact');
    await testSort(5, 'Status');

    console.log('\n✅ All 5 columns are sortable!');
  });

  test('Issue 2: Opportunities navigation should NOT reload page', async ({ page, context }) => {
    // Monitor for navigation events
    let navigationCount = 0;
    page.on('framenavigated', () => {
      navigationCount++;
    });

    // Click "View opportunities" link in the KPI card
    await page.click('text=View opportunities');
    await page.waitForURL('**/management/opportunities');

    // Verify we navigated client-side (should only be 1 navigation to the new route)
    console.log('Navigation count:', navigationCount);
    expect(navigationCount).toBeLessThanOrEqual(2); // Initial load + client-side navigation

    // Verify page content changed
    const pageTitle = await page.locator('h4').first().textContent();
    console.log('New page title:', pageTitle);
    expect(pageTitle).toContain('Opportunities');

    console.log('\n✅ Opportunities navigation works without page reload!');
  });

  test('Issue 3: Generate Report button should log to console', async ({ page }) => {
    const consoleLogs: string[] = [];

    // Listen for console messages
    page.on('console', msg => {
      consoleLogs.push(msg.text());
      console.log('Console:', msg.text());
    });

    // Click Generate Report button
    await page.click('button:has-text("Generate Report")');
    await page.waitForTimeout(500);

    // Verify console.log was called
    const hasGenerateReportLog = consoleLogs.some(log => log.includes('Generate Report clicked'));
    console.log('All console logs:', consoleLogs);
    expect(hasGenerateReportLog).toBe(true);

    console.log('\n✅ Generate Report button logs to console!');
  });

  test('Complete interaction test: No page reloads for any interaction', async ({ page }) => {
    let documentRequests = 0;

    // Monitor network for HTML document requests
    page.on('request', request => {
      if (request.resourceType() === 'document' && !request.url().includes('login')) {
        documentRequests++;
        console.log('Document request:', request.url());
      }
    });

    // Test sorting (should not cause document load)
    await page.click('table thead th:nth-child(1) .MuiTableSortLabel-root');
    await page.waitForTimeout(300);

    // Test button click (should not cause document load)
    await page.click('button:has-text("Generate Report")');
    await page.waitForTimeout(300);

    // Test navigation link (should not cause NEW document load, just client-side routing)
    const beforeNavigationCount = documentRequests;
    await page.click('text=View opportunities');
    await page.waitForURL('**/management/opportunities');
    const afterNavigationCount = documentRequests;

    console.log('Document requests before navigation:', beforeNavigationCount);
    console.log('Document requests after navigation:', afterNavigationCount);

    // Client-side navigation should not cause additional document loads
    expect(afterNavigationCount).toBe(beforeNavigationCount);

    console.log('\n✅ All interactions are client-side only!');
  });
});
