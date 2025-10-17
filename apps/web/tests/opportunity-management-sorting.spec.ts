import { test, expect } from '@playwright/test';

test.describe('Opportunity Management Page Sorting', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@partman.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboards/overall');
  });

  test('CRITICAL: Table sorting should NOT cause page reload', async ({ page }) => {
    // Navigate to Opportunity Management page
    await page.goto('http://localhost:3000/management/opportunities');
    await page.waitForLoadState('networkidle');

    console.log('✓ Navigated to Opportunity Management page');

    // Wait for table to load
    await page.waitForSelector('.virtualized-table-header', { timeout: 10000 });
    console.log('✓ Table loaded');

    // Monitor for page reloads (document requests)
    let documentRequests = 0;
    page.on('request', request => {
      if (request.resourceType() === 'document') {
        documentRequests++;
        console.log('❌ DOCUMENT REQUEST DETECTED:', request.url());
      }
    });

    // Get initial data order
    const getFirstOpportunityName = async () => {
      const firstCell = await page.locator('.virtualized-table-row').first().locator('.opportunity-cell__name').textContent();
      return firstCell;
    };

    const initialFirst = await getFirstOpportunityName();
    console.log('Initial first opportunity:', initialFirst);

    // Click the "Opportunity" column header to sort
    console.log('\n--- Testing Opportunity column sort ---');
    const beforeSortDocRequests = documentRequests;
    await page.click('.virtualized-table-header .virtualized-table-cell:nth-child(2)');
    await page.waitForTimeout(1000);

    const afterSortDocRequests = documentRequests;
    const afterSortFirst = await getFirstOpportunityName();

    console.log('Document requests before sort:', beforeSortDocRequests);
    console.log('Document requests after sort:', afterSortDocRequests);
    console.log('First opportunity after sort:', afterSortFirst);

    // Verify NO new document requests (no page reload)
    expect(afterSortDocRequests).toBe(beforeSortDocRequests);
    console.log('✅ NO page reload detected!');

    // Check if sorting indicator appeared (arrow)
    const hasSortIndicator = await page.locator('.virtualized-table-header .virtualized-table-cell:nth-child(2)').textContent();
    const hasArrow = hasSortIndicator?.includes('↑') || hasSortIndicator?.includes('↓');
    console.log('Sort indicator text:', hasSortIndicator);
    console.log('Has arrow:', hasArrow);

    if (hasArrow) {
      console.log('✅ Sorting indicator (arrow) appeared!');
    } else {
      console.log('⚠️ No sorting arrow visible, but no page reload occurred');
    }

    // Test another column - Partner
    console.log('\n--- Testing Partner column sort ---');
    const beforePartnerSort = documentRequests;
    await page.click('.virtualized-table-header .virtualized-table-cell:nth-child(3)');
    await page.waitForTimeout(1000);

    const afterPartnerSort = documentRequests;
    expect(afterPartnerSort).toBe(beforePartnerSort);
    console.log('✅ Partner sort - NO page reload!');

    // Test Stage column
    console.log('\n--- Testing Stage column sort ---');
    const beforeStageSort = documentRequests;
    await page.click('.virtualized-table-header .virtualized-table-cell:nth-child(4)');
    await page.waitForTimeout(1000);

    const afterStageSort = documentRequests;
    expect(afterStageSort).toBe(beforeStageSort);
    console.log('✅ Stage sort - NO page reload!');

    console.log('\n✅✅✅ ALL OPPORTUNITY MANAGEMENT SORTING TESTS PASSED - NO PAGE RELOADS! ✅✅✅');
  });

  test('Network tab verification: NO HTML document loads during sorting', async ({ page }) => {
    await page.goto('http://localhost:3000/management/opportunities');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.virtualized-table-header', { timeout: 10000 });

    // Track all network requests
    const requests: { type: string; url: string }[] = [];
    page.on('request', request => {
      requests.push({
        type: request.resourceType(),
        url: request.url()
      });
    });

    // Clear initial requests
    requests.length = 0;

    // Perform multiple sorts
    await page.click('.virtualized-table-header .virtualized-table-cell:nth-child(2)');
    await page.waitForTimeout(500);

    await page.click('.virtualized-table-header .virtualized-table-cell:nth-child(3)');
    await page.waitForTimeout(500);

    await page.click('.virtualized-table-header .virtualized-table-cell:nth-child(4)');
    await page.waitForTimeout(500);

    // Check for any document requests
    const documentRequests = requests.filter(r => r.type === 'document');

    console.log('Total requests during sorting:', requests.length);
    console.log('Document requests during sorting:', documentRequests.length);

    if (documentRequests.length > 0) {
      console.log('❌ UNEXPECTED DOCUMENT REQUESTS:');
      documentRequests.forEach(req => console.log('  -', req.url));
    }

    expect(documentRequests.length).toBe(0);
    console.log('✅ Network verification passed - NO HTML document loads!');
  });
});
