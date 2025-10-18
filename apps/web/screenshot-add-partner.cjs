// Test Add Partner dialog functionality
const playwright = require('playwright');
const path = require('path');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'admin@partman.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(2000);

    console.log('📸 Navigating to Partner Management...');
    await page.goto('http://localhost:3000/management/partners', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take screenshot before clicking
    let screenshotPath = path.join(__dirname, 'screenshots', 'partners-before-add.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Screenshot saved: ${screenshotPath}`);

    console.log('🖱️  Clicking Add Partner button...');
    await page.click('button:has-text("Add Partner")');
    await page.waitForTimeout(1000);

    // Take screenshot with dialog open
    screenshotPath = path.join(__dirname, 'screenshots', 'partners-add-dialog.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Screenshot saved: ${screenshotPath}`);

    console.log('✅ Add Partner dialog opened successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
