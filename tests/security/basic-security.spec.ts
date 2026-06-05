import { test, expect } from '@playwright/test';

test.describe('Basic Security Testing', () => {
  test('HTTPS is enabled', async ({ page, baseURL }) => {
    // If testing against the live site, ensure baseURL starts with https
    if (baseURL) {
      expect(baseURL.startsWith('https://')).toBeTruthy();
    }
    
    await page.goto('/');
    expect(page.url().startsWith('https://')).toBeTruthy();
  });

  test('Password field is hidden', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.getByRole('textbox', { name: 'Password *' });
    
    if (await passwordInput.count() > 0) {
      // Ensure the type attribute is "password" to mask input
      expect(await passwordInput.first().getAttribute('type')).toBe('password');
    }
  });

  test('Session logout validity', async ({ page }) => {
    // Mocking a flow: Login -> Logout -> Try accessing protected route
    await page.goto('/login');
    const emailInput = page.getByRole('textbox', { name: 'Email *' });
    const passwordInput = page.getByRole('textbox', { name: 'Password *' });
    const submitButton = page.getByRole('button', { name: 'Sign In' });

    if (await emailInput.count() > 0) {
      await emailInput.fill('garv.patel.growlity@gmail.com');
      await passwordInput.fill('GnjA3UqKTN');
      await submitButton.click();
      
      await page.waitForLoadState('networkidle');
      
      const userMenuButton = page.getByRole('button', { name: 'GP Garv Patel' });
      if (await userMenuButton.count() > 0) {
        await userMenuButton.click();
        await page.getByRole('menuitem', { name: 'Sign Out' }).click();
        
        // Try going to dashboard after logout
        await page.goto('/dashboard');
        
        // Should be redirected to login
        await expect(page).toHaveURL(/.*login.*/);
      }
    }
  });

  test('Direct URL access to protected routes', async ({ page }) => {
    // Without logging in, go to a protected route
    await page.goto('/dashboard');
    // Expect redirect to login
    await expect(page).toHaveURL(/.*login.*/);
  });
});
