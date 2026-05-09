import { test, expect } from '@playwright/test';

test('Remember me login and dashboard username validation - SAT simple', async ({ page }) => {
    const testURL = 'https://sat.onesourcetax.com/';
    const username = 'akshay.vadde+test@tr.com';
    const password = '$Admin#1';
    const clientName = 'SYS_FIRM';

    await page.goto(testURL);

    const ciamTitle = page.getByText('Thomson Reuters sign-in');
    if (await ciamTitle.isVisible().catch(() => false)) {
        await ciamTitle.click();
    }

    await page.locator('#username').fill(username);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.locator('#password').fill(password);
    const rememberMe = page.getByLabel(/remember me/i).first();
    await rememberMe.check();
    await page.getByRole('button', { name: 'Sign in' }).click();

    await page.locator('#HomeProduct-CorporateTax').click();
    await page.locator('#SubClient-Search-Box').fill(clientName);
    await page.getByText(clientName).first().click();

    const currentUrl = page.url();
    const parsedUrl = new URL(currentUrl);
    const urlUser = parsedUrl.searchParams.get('username') || parsedUrl.searchParams.get('login_hint') || '';

    const expectedUserToken = (urlUser || username).split('@')[0].split(/[.+_\-]/)[0].toLowerCase();

    await page.getByRole('button', { name: /home/i }).first().click();
    const dashboardUserText = (await page.getByRole('button', { name: /my account/i }).first().textContent() || '').toLowerCase();

    expect(dashboardUserText).toContain(expectedUserToken);
});
