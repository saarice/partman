import { test, expect } from '@playwright/test';

test.describe('Sidebar Verification Across All Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@partman.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboards/overall');
  });

  test('Capture sidebar on all 6 pages', async ({ page }) => {
    const pages = [
      { name: 'Overall Dashboard', url: '/dashboards/overall' },
      { name: 'Opportunities Dashboard', url: '/dashboards/opportunities' },
      { name: 'Partnerships Dashboard', url: '/dashboards/partnerships' },
      { name: 'Financial Dashboard', url: '/dashboards/financial' },
      { name: 'Opportunity Management', url: '/management/opportunities' },
      { name: 'Partnership Management', url: '/management/partnerships' },
    ];

    for (const pageInfo of pages) {
      console.log(`\n--- Testing ${pageInfo.name} ---`);
      await page.goto(`http://localhost:3000${pageInfo.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Take full page screenshot
      await page.screenshot({
        path: `test-results/sidebar-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: true
      });

      // Check if sidebar exists
      const sidebarExists = await page.locator('.MuiDrawer-root').count() > 0;
      console.log(`Sidebar exists: ${sidebarExists ? '✅' : '❌'}`);

      if (sidebarExists) {
        // Get sidebar width
        const sidebar = page.locator('.MuiDrawer-paper').first();
        const box = await sidebar.boundingBox();
        if (box) {
          console.log(`Sidebar width: ${box.width}px (expected 280px)`);
          console.log(`Sidebar height: ${box.height}px`);
        }

        // Check if "Partman" brand is visible
        const hasBrand = await page.locator('text=Partman').count() > 0;
        console.log(`Has brand: ${hasBrand ? '✅' : '❌'}`);

        // Check if user info is visible
        const hasUserInfo = await page.locator('text=/Welcome,/').count() > 0;
        console.log(`Has user info: ${hasUserInfo ? '✅' : '❌'}`);

        // Check active state
        const activeItems = await page.locator('.MuiListItemButton-root.Mui-selected').count();
        console.log(`Active navigation items: ${activeItems}`);
      }

      expect(sidebarExists).toBe(true);
    }

    console.log('\n✅ All 6 pages captured successfully!');
    console.log('Check test-results/ directory for screenshots');
  });

  test('Verify sidebar consistency', async ({ page }) => {
    const pages = [
      '/dashboards/overall',
      '/dashboards/opportunities',
      '/management/opportunities'
    ];

    const sidebarData: any[] = [];

    for (const url of pages) {
      await page.goto(`http://localhost:3000${url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const sidebar = page.locator('.MuiDrawer-paper').first();
      const box = await sidebar.boundingBox();

      const data = {
        url,
        width: box?.width || 0,
        height: box?.height || 0,
        hasBrand: await page.locator('text=Partman').count() > 0,
        hasUserInfo: await page.locator('text=/Welcome,/').count() > 0,
        navigationItems: await page.locator('.MuiListItemButton-root').count()
      };

      sidebarData.push(data);
      console.log(`\n${url}:`, JSON.stringify(data, null, 2));
    }

    // Verify consistency
    const firstWidth = sidebarData[0].width;
    const allSameWidth = sidebarData.every(d => d.width === firstWidth);
    console.log(`\n✅ All sidebars same width (${firstWidth}px): ${allSameWidth}`);

    expect(firstWidth).toBe(280);
    expect(allSameWidth).toBe(true);
  });
});
