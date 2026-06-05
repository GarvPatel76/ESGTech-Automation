import { test, expect } from '@playwright/test';

test.describe('UI and Visual Responsive Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Page visual alignment and layout check', async ({ page }) => {
    // Wait for the fonts and images to be fully loaded for a stable screenshot
    await page.evaluate(() => document.fonts.ready);
    await page.waitForLoadState('networkidle');

    // To perform visual regression testing, we use page.screenshot() and compare it.
    // The first time it runs, it will save the baseline. Subsequent runs will compare against it.
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot('homepage-layout.png', { maxDiffPixelRatio: 0.1 });
  });

  test('Colors and Fonts are consistent', async ({ page }) => {
    // Check computed styles on a primary element like the body or header
    const body = page.locator('body');
    const computedStyle = await body.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontFamily: style.fontFamily,
        backgroundColor: style.backgroundColor,
      };
    });
    
    // We expect modern fonts and not default times new roman
    expect(computedStyle.fontFamily).not.toContain('Times New Roman');
  });

  test('Dark/Light mode toggle (if applicable)', async ({ page }) => {
    // Look for a theme toggle button
    const themeToggle = page.locator('button:has-text("Theme"), button:has-text("Dark"), .theme-switch, [aria-label*="theme" i]').first();
    
    if (await themeToggle.count() > 0) {
      const body = page.locator('body');
      const initialBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for transition
      
      const newBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
      expect(newBg).not.toBe(initialBg);
    }
  });

  test('Mobile menu toggles on small screens', async ({ page, isMobile }) => {
    // This test logic mostly applies if the current viewport is mobile (handled by playwright.config projects)
    if (isMobile) {
      const hamburgerMenu = page.locator('button[aria-label*="menu" i], .hamburger, .mobile-menu-btn').first();
      if (await hamburgerMenu.count() > 0) {
        await hamburgerMenu.click();
        
        // Wait for menu to appear
        const mobileNav = page.locator('nav, .mobile-nav-container').last();
        await expect(mobileNav).toBeVisible();
      }
    }
  });
});
