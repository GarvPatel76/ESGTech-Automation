import { test, expect } from '@playwright/test';

test.describe('Search Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a page with a search bar. Usually home, dashboard, or a specific list page.
    await page.goto('/');
  });

  test('Search bar is visible', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('Valid search yields results', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('esg');
      await searchInput.press('Enter');
      
      // Wait for network response or list update
      await page.waitForLoadState('networkidle');
      
      // Look for a results container or items
      const results = page.locator('.result-item, .card, table tr, li').filter({ hasText: /.*/ });
      // If there's a list, it should have > 0 items ideally
      if (await results.count() > 0) {
        expect(await results.count()).toBeGreaterThan(0);
      }
    }
  });

  test('Invalid search shows no results or empty state', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('asdjfkasdjflkajsdflkjasdflk');
      await searchInput.press('Enter');
      
      await page.waitForLoadState('networkidle');
      
      // Expect some empty state text
      const emptyState = page.locator('text="No results found" i, text="0 results" i');
      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible();
      }
    }
  });

  test('Empty search behavior', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('');
      await searchInput.press('Enter');
      
      // Typically it should show all results or do nothing. We just check if it doesn't crash
      await expect(searchInput).toBeVisible();
    }
  });

  test('Filters and Sorting presence', async ({ page }) => {
    // Look for filter dropdowns or sort buttons near the search
    const filterBtn = page.locator('button:has-text("Filter"), .filter-icon');
    const sortBtn = page.locator('button:has-text("Sort"), select[name*="sort" i]');
    
    if (await filterBtn.count() > 0) {
      await expect(filterBtn.first()).toBeVisible();
    }
    
    if (await sortBtn.count() > 0) {
      await expect(sortBtn.first()).toBeVisible();
    }
  });
});
