import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    storageState: {
      cookies: [],
      origins: []
    }
  });
  const page = await context.newPage();

  try {
    console.log('🌐 Opening application...');
    await page.goto('http://localhost:3003/login');
    await page.waitForTimeout(2000);

    // Login using demo credentials
    console.log('🔐 Logging in with demo account...');
    const emailField = await page.$('input[name="email"]');
    if (emailField) {
      await emailField.fill('vp@partman.com');
    }
    const passwordField = await page.$('input[name="password"]');
    if (passwordField) {
      await passwordField.fill('password');
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log('📸 Navigating to Opportunity Management...');
    await page.goto('http://localhost:3003/management/opportunities');
    await page.waitForTimeout(2000);

    console.log('✓ Screenshot 1: Table View');
    await page.screenshot({
      path: '/Users/saar/Partman/apps/web/screenshots/opportunities-table-view.png',
      fullPage: true
    });

    console.log('🔄 Switching to Kanban view...');
    // Click the Kanban toggle button
    const kanbanButton = await page.$('button[aria-label="kanban view"]');
    if (kanbanButton) {
      await kanbanButton.click();
      await page.waitForTimeout(1500);

      console.log('✓ Screenshot 2: Kanban View');
      await page.screenshot({
        path: '/Users/saar/Partman/apps/web/screenshots/opportunities-kanban-view.png',
        fullPage: true
      });

      console.log('🖱️  Clicking an opportunity card...');
      const opportunityCard = await page.$('div[draggable="true"]');
      if (opportunityCard) {
        await opportunityCard.click();
        await page.waitForTimeout(1000);

        console.log('✓ Screenshot 3: Edit Dialog from Kanban');
        await page.screenshot({
          path: '/Users/saar/Partman/apps/web/screenshots/kanban-edit-dialog.png',
          fullPage: false
        });
      }
    }

    console.log('✅ All screenshots captured!');
    console.log('📁 Location: /Users/saar/Partman/apps/web/screenshots/');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
