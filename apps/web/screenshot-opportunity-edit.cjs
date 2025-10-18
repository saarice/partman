const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    // Login
    await page.type('input[name="email"]', 'admin@partman.com');
    await page.type('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('📸 Navigating to Opportunity Management...');
    await page.goto('http://localhost:5173/management/opportunities', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    console.log('✓ Screenshot 1: Opportunity List');
    await page.screenshot({
      path: '/Users/saar/Partman/apps/web/screenshots/opportunities-before-edit.png',
      fullPage: true
    });

    console.log('🖱️  Clicking first opportunity row...');
    // Wait for table rows and click the first one
    await page.waitForSelector('tbody tr');
    await page.click('tbody tr:first-child');

    // Wait for dialog to open
    await page.waitForTimeout(1000);

    console.log('✓ Screenshot 2: Edit Dialog Open');
    await page.screenshot({
      path: '/Users/saar/Partman/apps/web/screenshots/opportunities-edit-dialog.png',
      fullPage: true
    });

    console.log('📝 Modifying opportunity fields...');
    // Clear and update amount
    await page.click('input[label="Amount ($)"]');
    await page.keyboard.press('End');
    for (let i = 0; i < 10; i++) await page.keyboard.press('Backspace');
    await page.type('input[type="number"]', '600000');

    // Update probability
    const probabilityInputs = await page.$$('input[type="number"]');
    if (probabilityInputs.length > 1) {
      await probabilityInputs[1].click();
      await page.keyboard.press('End');
      for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace');
      await probabilityInputs[1].type('85');
    }

    await page.waitForTimeout(500);

    console.log('✓ Screenshot 3: Modified Fields');
    await page.screenshot({
      path: '/Users/saar/Partman/apps/web/screenshots/opportunities-edit-modified.png',
      fullPage: true
    });

    console.log('✅ All screenshots captured successfully!');
    console.log('📁 Screenshots saved to: /Users/saar/Partman/apps/web/screenshots/');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();
