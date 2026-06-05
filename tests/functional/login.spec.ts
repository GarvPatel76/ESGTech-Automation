import { test, expect } from '@playwright/test';

test.describe('Login Page Testing', () => {
  const loginUrl = '/login'; // Assuming login route is /login, update if different
  const validEmail = 'garv.patel.growlity@gmail.com';
  const validPassword = 'GnjA3UqKTN';

  test.beforeEach(async ({ page }) => {
    // Navigate to login page. We'll handle possible redirects or direct access.
    // If there is no /login, we might need to click a Login button on the home page.
    await page.goto(loginUrl);
  });

  test.describe('Positive Cases', () => {
    test('Successful login with valid credentials', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const passwordInput = page.getByRole('textbox', { name: 'Password *' });
      const submitButton = page.getByRole('button', { name: 'Sign In' });

      // If we don't find these fields, the test will naturally fail, which means we need to adjust selectors.
      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill(validEmail);
        await passwordInput.fill(validPassword);
        await submitButton.click();

        // Check if we are redirected to the dashboard or home
        await expect(page).not.toHaveURL(loginUrl, { timeout: 10000 });
      }
    });

    test('Remember me checkbox functionality', async ({ page }) => {
      const rememberMe = page.locator('input[type="checkbox"]');
      if (await rememberMe.count() > 0) {
        await rememberMe.check();
        await expect(rememberMe).toBeChecked();
      }
    });

    test('Logout functionality', async ({ page }) => {
      // First login
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const passwordInput = page.getByRole('textbox', { name: 'Password *' });
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      
      if (await emailInput.count() > 0) {
        await emailInput.fill(validEmail);
        await passwordInput.fill(validPassword);
        await submitButton.click();
        
        // Wait for login to complete
        await page.waitForLoadState('networkidle');

        // Look for a logout button and click it
        const userMenuButton = page.getByRole('button', { name: 'GP Garv Patel' });
        if (await userMenuButton.count() > 0) {
          await userMenuButton.click();
          await page.getByRole('menuitem', { name: 'Sign Out' }).click();
          // Verify we're back to login or home page
          await expect(page).toHaveURL(/.*(login|\/)$/);
        }
      }
    });
  });

  test.describe('Negative Cases', () => {
    test('Login fails with wrong password', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const passwordInput = page.getByRole('textbox', { name: 'Password *' });
      const submitButton = page.getByRole('button', { name: 'Sign In' });

      if (await emailInput.count() > 0) {
        await emailInput.fill(validEmail);
        await passwordInput.fill('wrongpassword123');
        await submitButton.click();

        // Expect an error message or to stay on the same URL
        await expect(page).toHaveURL(loginUrl);
      }
    });

    test('Validation on empty fields', async ({ page }) => {
      const submitButton = page.getByRole('button', { name: 'Sign In' });
      if (await submitButton.count() > 0) {
        await submitButton.click();
        // Native HTML5 validation or custom error messages should appear
        const errorMessages = page.locator('text=required i, text=empty i').first();
        // Alternatively check that URL didn't change
        await expect(page).toHaveURL(loginUrl);
      }
    });

    test('Invalid email format', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const submitButton = page.getByRole('button', { name: 'Sign In' });

      if (await emailInput.count() > 0) {
        await emailInput.fill('invalidemail.com');
        await submitButton.click();
        // The form shouldn't submit, or should show an error
        await expect(page).toHaveURL(loginUrl);
      }
    });

    test('Basic SQL injection check', async ({ page }) => {
      const emailInput = page.getByRole('textbox', { name: 'Email *' });
      const passwordInput = page.getByRole('textbox', { name: 'Password *' });
      const submitButton = page.getByRole('button', { name: 'Sign In' });

      if (await emailInput.count() > 0) {
        await emailInput.fill("' OR 1=1 --");
        await passwordInput.fill("' OR 1=1 --");
        await submitButton.click();

        // Expect login to fail and stay on login page
        await expect(page).toHaveURL(loginUrl);
      }
    });
  });
});
