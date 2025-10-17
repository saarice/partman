// Check browser console for actual errors
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const consoleLogs = [];

  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });

  try {
    console.log('Loading http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 10000 });

    await page.waitForTimeout(2000);

    console.log('\n=== CONSOLE LOGS ===');
    consoleLogs.forEach(log => console.log(log));

    console.log('\n=== ERRORS ===');
    if (errors.length > 0) {
      errors.forEach(err => console.log('ERROR:', err));
    } else {
      console.log('No errors found!');
    }

    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('\n=== BODY LENGTH ===');
    console.log(`Body HTML length: ${bodyHTML.length} characters`);

  } catch (error) {
    console.error('Failed to load page:', error.message);
  } finally {
    await browser.close();
  }
})();
