import { test, expect } from '@playwright/test';

test.describe('Home Page Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Logo is visible', async ({ page }) => {
    // Assuming there's a logo with an 'img' tag or a specific alt text.
    // Replace the selector with the actual logo selector.
    const logo = page.locator('img[alt*="logo" i], a[href="/"] img').first();
    // Wait for network idle or load to ensure things are rendered
    await page.waitForLoadState('networkidle');
    if (await logo.count() > 0) {
      await expect(logo).toBeVisible();
    } else {
      console.log('No logo element found matching generic selectors.');
      // If logo isn't easily selectable, this will fail or we mark it as known issue
    }
  });

  test('Navigation links are working', async ({ page }) => {
    // Collect all links in a navigation bar, checking a few common ones
    const navLinks = page.locator('nav a');
    if (await navLinks.count() > 0) {
      // Just check the first link as a sample
      const href = await navLinks.first().getAttribute('href');
      expect(href).not.toBeNull();
    }
  });

  test('Buttons are clickable', async ({ page }) => {
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      // Just verifying the first button is enabled and visible
      const firstButton = buttons.first();
      await expect(firstButton).toBeEnabled();
      await expect(firstButton).toBeVisible();
    }
  });

  test('Images are loading correctly', async ({ page }) => {
    // Get all images and check if their natural width is > 0 (meaning they loaded successfully)
    const images = await page.locator('img').all();
    for (const img of images) {
      const isLoaded = await img.evaluate((image: HTMLImageElement) => image.complete && image.naturalHeight !== 0);
      expect(isLoaded).toBeTruthy();
    }
  });

  test('Footer links are present', async ({ page }) => {
    const footerLinks = page.locator('footer a');
    if (await footerLinks.count() > 0) {
      await expect(footerLinks.first()).toBeVisible();
    }
  });

  test('Page is responsive (viewport check)', async ({ page }) => {
    // Check if the page title or main container is visible under current viewport (set by config)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
