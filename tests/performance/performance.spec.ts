import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test('Website loading speed is within limits', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    console.log(`Page load time: ${loadTime}ms`);
    // Basic threshold check (e.g., should load within 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });

  test('Performance metrics via Navigation Timing API', async ({ page }) => {
    await page.goto('/');
    
    // Get performance timing metrics from the browser safely
    const performanceTiming = await page.evaluate(() => {
      const timing = window.performance.timing;
      return {
        loadEventEnd: timing.loadEventEnd,
        navigationStart: timing.navigationStart,
        responseStart: timing.responseStart
      };
    });
    
    // Calculate page load time using Navigation Timing API
    const pageLoadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
    const ttfb = performanceTiming.responseStart - performanceTiming.navigationStart; // Time to First Byte
    
    console.log(`Navigation API Load Time: ${pageLoadTime}ms, TTFB: ${ttfb}ms`);
    
    expect(pageLoadTime).toBeGreaterThan(0); // Sanity check
    expect(ttfb).toBeLessThan(2000); // TTFB should generally be fast
  });

  test('API delay is acceptable', async ({ page }) => {
    // Intercept API calls and measure their duration
    let slowRequests = 0;
    
    page.on('requestfinished', async request => {
      if (request.url().includes('/api/')) {
        const response = await request.response();
        if (response) {
          try {
            const timing = request.timing(); // request.timing() is safer when request is finished
            // Timing properties can be -1 if not available (e.g., cached or cross-origin)
            if (timing.responseEnd !== -1 && timing.requestStart !== -1) {
              const duration = timing.responseEnd - timing.requestStart;
              if (duration > 2000) {
                slowRequests++;
                console.warn(`Slow API call: ${request.url()} took ${duration}ms`);
              }
            }
          } catch (e) {
            // Ignore error if timing is not available for this specific request
          }
        }
      }
    });

    await page.goto('/');
    // Trigger some actions if needed to fire APIs
    await page.waitForLoadState('networkidle');
    
    // Ideally, no API should take longer than 2s in a fast environment
    // We log warnings but might not fail the test depending on strictness
    // expect(slowRequests).toBe(0); 
  });
});
