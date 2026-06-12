import { test, expect, type Page } from '@playwright/test';

// Use a shared authentication state or perform login before testing dashboard if it's protected
test.describe.serial('Dashboard Testing', () => {

  const dashboardUrl = '/dashboard'; // Replace with actual dashboard route
  const loginUrl = '/login';
  const validEmail = 'garv.patel.growlity@gmail.com';
  const validPassword = 'GnjA3UqKTN';
  
  let page: Page;

  test.beforeAll(async ({ browser }, testInfo) => {
    page = await browser.newPage();
    // Attempt to access dashboard directly.
    await page.goto(dashboardUrl);
    
    // If redirected to login, perform login
    if (page.url().includes(loginUrl)) {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const passwordInput = page.getByRole('textbox', { name: 'Password *' });
      
      // Wait for form inputs to be visible
      await emailInput.waitFor({ state: 'visible', timeout: 5000 });
      await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
      
      const browserName = testInfo.project.name;
      if (browserName === 'webkit' || browserName === 'Mobile Safari') {
        // Use pressSequentially for Safari to ensure onChange fires
        await emailInput.pressSequentially(validEmail, { delay: 30 });
        await passwordInput.pressSequentially(validPassword, { delay: 30 });
        await page.waitForTimeout(500);
        // Press Enter to submit
        await passwordInput.press('Enter');
      } else {
        await emailInput.fill(validEmail);
        await passwordInput.fill(validPassword);
        // Press Enter to submit (more reliable than clicking)
        await passwordInput.press('Enter');
      }
      
      // Wait for network to be idle after login attempt
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Check if we are redirected to the dashboard or home
      try {
        await expect(page).not.toHaveURL(/.*login/, { timeout: 15000 });
      } catch (e) {
        await page.screenshot({ path: 'login-timeout-debug.png', fullPage: true });
        throw e;
      }
    }
  });

  test.afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  test('Dashboard modules are visible', async () => {
    // Wait for the primary ESG dashboard module tabs to appear
    const ghgEmissionTab = page.getByRole('button', { name: 'GHG Emission' }).first();
    const dataManagementTab = page.getByRole('button', { name: 'ESG Data Management' }).first();
    const scoreCalculationTab = page.getByRole('button', { name: 'ESG Score Calculation' }).first();
    
    // This explicit expect forces Playwright to wait until the dashboard fully loads
    await expect(ghgEmissionTab).toBeVisible({ timeout: 15000 });
    await expect(dataManagementTab).toBeVisible();
    await expect(scoreCalculationTab).toBeVisible();
  });

  test('Module tabs are interactive', async () => {
    const dataManagementTab = page.getByRole('button', { name: 'ESG Data Management' }).first();
    // Ensure the dashboard is ready for user interaction
    await expect(dataManagementTab).toBeEnabled();
  });

  test('Navigation is correct from Dashboard', async () => {
    // Check sidebar or topbar links using precise locators
    const measureLink = page.getByRole('link', { name: 'Measure' }).first();
    const reportsButton = page.getByRole('button', { name: 'Reports' }).first();
    
    await expect(measureLink).toBeVisible();
    await expect(reportsButton).toBeVisible();
  });
});
