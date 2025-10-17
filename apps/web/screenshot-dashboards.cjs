// Take screenshots of all dashboards to verify they're working
const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await playwright.chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const errors = [];
  const consoleLogs = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(text);
    }
  });

  page.on('pageerror', error => {
    errors.push(`PageError: ${error.message}\n${error.stack}`);
  });

  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const urls = [
    { name: 'home', url: 'http://localhost:3000/', waitFor: '#root' },
    { name: 'opportunities', url: 'http://localhost:3000/dashboards/opportunities', waitFor: '#root' },
    { name: 'partnerships', url: 'http://localhost:3000/dashboards/partnerships', waitFor: '#root' },
    { name: 'financial', url: 'http://localhost:3000/dashboards/financial', waitFor: '#root' }
  ];

  console.log('🔍 Taking screenshots of all dashboards...\n');

  for (const { name, url, waitFor } of urls) {
    try {
      console.log(`📸 Loading ${name}: ${url}`);

      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForSelector(waitFor, { timeout: 5000 });
      await page.waitForTimeout(2000); // Wait for any animations/data loading

      const screenshotPath = path.join(screenshotDir, `${name}-dashboard.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      // Check if page has content
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasContent = bodyText.length > 100;

      console.log(`   ✓ Screenshot saved: ${screenshotPath}`);
      console.log(`   ✓ Page has content: ${hasContent} (${bodyText.length} chars)`);

      if (!hasContent) {
        console.log(`   ⚠️  WARNING: Page appears empty!`);
        errors.push(`${name} dashboard appears empty (only ${bodyText.length} characters)`);
      }

    } catch (error) {
      console.log(`   ✗ Failed: ${error.message}`);
      errors.push(`${name}: ${error.message}`);
    }
    console.log('');
  }

  console.log('\n=== CONSOLE LOGS ===');
  if (consoleLogs.length > 0) {
    consoleLogs.slice(-50).forEach(log => console.log(log));
  } else {
    console.log('No console logs captured');
  }

  console.log('\n=== ERRORS SUMMARY ===');
  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} error(s):\n`);
    errors.forEach((err, i) => console.log(`${i + 1}. ${err}\n`));
    process.exit(1);
  } else {
    console.log('✅ All dashboards loaded successfully with no errors!');
    process.exit(0);
  }

  await browser.close();
})();
