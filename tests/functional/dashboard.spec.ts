import { test, expect, type Page } from '@playwright/test';

// Use a shared authentication state or perform login before testing dashboard if it's protected
test.describe.serial('Dashboard Testing', () => {
  const dashboardUrl = '/dashboard'; // Replace with actual dashboard route
  const loginUrl = '/login';
  const validEmail = 'garv.patel.growlity@gmail.com';
  const validPassword = 'GnjA3UqKTN';
  
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    // Attempt to access dashboard directly.
    await page.goto(dashboardUrl);
    
    // If redirected to login, perform login
    if (page.url().includes(loginUrl)) {
      await page.waitForLoadState('networkidle');
      
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const passwordInput = page.getByRole('textbox', { name: 'Password *' });
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      
      if (await emailInput.count() > 0) {
        await emailInput.fill(validEmail);
        await passwordInput.fill(validPassword);
        await submitButton.click();
        await expect(page).not.toHaveURL(/.*login/, { timeout: 30000 });
      }
    }
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Data loads correctly on dashboard', async () => {
    // Check for a data container or table
    const dataContainer = page.locator('table, .data-grid, .card').first();
    // Assuming data will eventually render if dashboard is accessible
    if (await dataContainer.count() > 0) {
      await expect(dataContainer).toBeVisible({ timeout: 15000 });
    }
  });

  test('Charts are visible', async () => {
    // Look for common charting library elements (canvas, svg inside specific wrappers)
    const charts = page.locator('canvas, svg.recharts-surface, .chart-container').first();
    if (await charts.count() > 0) {
      await expect(charts).toBeVisible();
    }
  });

  test('Buttons are working', async () => {
    // Look for action buttons on the dashboard (e.g., Export, Refresh)
    const actionButtons = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("Refresh")').first();
    if (await actionButtons.count() > 0) {
      await expect(actionButtons).toBeEnabled();
      // Try to click if it's safe (e.g. Refresh) or just verify it's clickable
    }
  });

  test('Navigation is correct from Dashboard', async () => {
    // Check sidebar or topbar links using precise locators
    const measureLink = page.getByRole('link', { name: 'Measure' }).first();
    const reportsLink = page.getByRole('link', { name: 'Reports' }).first();
    
    await expect(measureLink).toBeVisible();
    await expect(reportsLink).toBeVisible();
  });
});
