// Take screenshots after logging in
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  try {
    console.log('🔐 Logging in...');

    // Go to login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

    // Fill in login form
    await page.fill('input[type="email"]', 'admin@partman.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("Sign In")');

    // Wait for navigation to complete
    await page.waitForTimeout(2000);

    console.log('✓ Logged in successfully\n');

    const urls = [
      { name: 'home', url: 'http://localhost:3000/', title: 'Home Dashboard' },
      { name: 'opportunities', url: 'http://localhost:3000/dashboards/opportunities', title: 'Opportunities Dashboard' },
      { name: 'partnerships', url: 'http://localhost:3000/dashboards/partnerships', title: 'Partnerships Dashboard' },
      { name: 'financial', url: 'http://localhost:3000/dashboards/financial', title: 'Financial Dashboard' }
    ];

    console.log('📸 Taking screenshots of all dashboards...\n');

    for (const { name, url, title } of urls) {
      console.log(`📸 ${title}: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000); // Wait for data to load and animations

      const screenshotPath = path.join(screenshotDir, `${name}-authenticated.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const bodyText = await page.evaluate(() => document.body.innerText);

      console.log(`   ✓ Screenshot saved: ${screenshotPath}`);
      console.log(`   ✓ Content length: ${bodyText.length} characters`);
      console.log('');
    }

    console.log('✅ All screenshots taken successfully!');
    console.log('📂 Screenshots saved to:', screenshotDir);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
