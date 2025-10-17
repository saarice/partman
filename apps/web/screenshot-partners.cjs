// Take screenshot of Partner Management page
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

    console.log('📸 Taking Partner Management screenshot...');
    await page.goto('http://localhost:3000/management/partners', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const screenshotPath = path.join(__dirname, 'screenshots', 'partners-management.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log(`✓ Screenshot saved: ${screenshotPath}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
