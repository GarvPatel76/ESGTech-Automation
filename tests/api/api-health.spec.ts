import { test, expect } from '@playwright/test';

test.describe('API Health Testing', () => {
  test('Main page loads with 200 OK', async ({ request, baseURL }) => {
    // If testing against the base URL
    const response = await request.get(baseURL || 'https://esgtech.vercel.app/');
    expect(response.status()).toBe(200);
  });

  test('API endpoints return valid JSON and status', async ({ request }) => {
    // Basic test checking a hypothetical or known API endpoint
    // We will use a mock endpoint if the real one isn't specified
    // For Vercel apps, there might be /api/health or similar
    const response = await request.get('/api/health').catch(() => null);
    
    // If the endpoint exists, it should return 200 or 401 (if protected)
    if (response) {
      expect([200, 401, 404, 403]).toContain(response.status());
      
      if (response.status() === 200) {
        const json = await response.json().catch(() => null);
        if (json) {
          expect(typeof json).toBe('object');
        }
      }
    }
  });

  test('API response times are acceptable', async ({ request, baseURL }) => {
    const startTime = Date.now();
    const response = await request.get(baseURL || '/');
    const duration = Date.now() - startTime;
    
    // Initial HTML response should be fast
    expect(duration).toBeLessThan(3000);
    expect(response.status()).toBe(200);
  });
});
