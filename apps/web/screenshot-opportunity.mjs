import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3003/login');
    await page.waitForSelector('input[name="email"]');

    // Clear autofill and type credentials
    await page.click('input[name="email"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="email"]', 'admin@partman.com');

    await page.click('input[name="password"]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type('input[name="password"]', 'admin123');

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('📸 Navigating to Opportunity Management...');
    await page.goto('http://localhost:3003/management/opportunities');
    await page.waitForTimeout(1500);

    console.log('✓ Screenshot 1: Opportunity List');
    await page.screenshot({
      path: '/Users/saar/Partman/apps/web/screenshots/opportunities-list.png',
      fullPage: true
    });

    console.log('🖱️  Clicking first opportunity row...');
    await page.click('tbody tr:first-child');
    await page.waitForTimeout(1000);

    console.log('✓ Screenshot 2: Edit Dialog');
    await page.screenshot({
      path: '/Users/saar/Partman/apps/web/screenshots/opportunities-edit-dialog.png',
      fullPage: false
    });

    console.log('📝 Modifying fields...');
    // Find amount field and change it
    const amountField = page.locator('input[type="number"]').first();
    await amountField.fill('600000');

    // Find probability field and change it
    const probabilityField = page.locator('input[type="number"]').nth(1);
    await probabilityField.fill('85');

    await page.waitForTimeout(500);

    console.log('✓ Screenshot 3: Modified Dialog');
    await page.screenshot({
      path: '/Users/saar/Partman/apps/web/screenshots/opportunities-edit-modified.png',
      fullPage: false
    });

    console.log('✅ All screenshots captured!');
    console.log('📁 Location: /Users/saar/Partman/apps/web/screenshots/');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
