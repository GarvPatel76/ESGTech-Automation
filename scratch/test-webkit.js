const { webkit } = require('playwright');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('https://esgtech.vercel.app/login');
    await page.waitForLoadState('networkidle'); // for debugging
    
    const emailInput = page.getByRole('textbox', { name: 'Email *' });
    const passwordInput = page.getByRole('textbox', { name: 'Password *' });
    const submitButton = page.getByRole('button', { name: 'Sign In' });
    
    await emailInput.waitFor({ state: 'visible' });
    await page.waitForTimeout(2000);
    
    await emailInput.fill('garv.patel.growlity@gmail.com');
    await passwordInput.fill('GnjA3UqKTN');
    await submitButton.click();
    
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'scratch/webkit-login.png' });
    console.log('Current URL:', page.url());
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
