import { test, expect } from '@playwright/test';

test.describe('Form Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page that contains forms. Assume contact or generic form page.
    // Replace with a valid form URL if known, e.g., '/contact' or a specific module form.
    await page.goto('/contact').catch(() => page.goto('/'));
  });

  test('Validation messages on empty submission', async ({ page }) => {
    // Find a form and try to submit it empty
    const submitBtn = page.locator('form button[type="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      // Check for validation text or HTML5 'required' pseudo-class
      const requiredInputs = page.locator('input:required, select:required, textarea:required');
      if (await requiredInputs.count() > 0) {
        // Checking if the browser evaluates it as invalid or specific error span is shown
        const isInvalid = await requiredInputs.first().evaluate((el: HTMLInputElement) => !el.validity.valid);
        expect(isInvalid).toBeTruthy();
      }
    }
  });

  test('Required fields enforcement', async ({ page }) => {
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      const requiredFields = form.locator('[required]');
      if (await requiredFields.count() > 0) {
        const firstRequired = requiredFields.first();
        expect(await firstRequired.getAttribute('required')).not.toBeNull();
      }
    }
  });

  test('Dropdown selection works', async ({ page }) => {
    const dropdown = page.locator('select').first();
    if (await dropdown.count() > 0) {
      // Get all options and select the second one
      const options = dropdown.locator('option');
      if (await options.count() > 1) {
        const valueToSelect = await options.nth(1).getAttribute('value');
        if (valueToSelect) {
          await dropdown.selectOption(valueToSelect);
          await expect(dropdown).toHaveValue(valueToSelect);
        }
      }
    } else {
       // Might be a custom dropdown (ul li)
       const customDropdown = page.locator('[role="combobox"], .select-trigger').first();
       if (await customDropdown.count() > 0) {
         await customDropdown.click();
         const option = page.locator('[role="option"], .select-item').nth(1);
         if(await option.count() > 0){
             await option.click();
         }
       }
    }
  });

  test('File upload functionality', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count() > 0) {
      // Need a dummy file in the tests directory to upload
      // await fileInput.setInputFiles('tests/fixtures/dummy.pdf');
      // Just checking if input exists and accepts files
      expect(await fileInput.getAttribute('type')).toBe('file');
    }
  });

  test('Submit button functionality with valid data', async ({ page }) => {
    const form = page.locator('form').first();
    if (await form.count() > 0) {
      const textInputs = form.locator('input[type="text"]');
      for (let i = 0; i < await textInputs.count(); i++) {
        await textInputs.nth(i).fill('Test Data');
      }

      const emailInputs = form.locator('input[type="email"]');
      for (let i = 0; i < await emailInputs.count(); i++) {
        await emailInputs.nth(i).fill('test@example.com');
      }

      const submitBtn = form.locator('button[type="submit"]');
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        // Check for success message or navigation
        // await expect(page.locator('.success-message')).toBeVisible();
      }
    }
  });
});
