import {test, expect} from '@playwright/test';

let weblogin;

test.describe.serial('EVoke UI Tests', () => {



test('EVoke UI Test', async ({ browser }) => {

    const context=await browser.newContext();
    const page=await context.newPage();

    await page.goto('https://practicetestautomation.com/practice-test-login/');

    await page.locator('#username').fill("student");
    await page.locator('#password').fill("Password123");
    
    await page.locator('#submit').click();
	

const loginMessage= await page.locator('.has-text-align-center').textContent();

 expect(loginMessage).toContain('Congratulations student. You successfully logged in!')

await context.storageState({path:'auth.json'});

weblogin= await browser.newContext({storageState:'auth.json'});


});

test('EVoke UI Test_negative scenario', async ({ }) => {

    let page=await weblogin.newPage();

    await page.goto('https://practicetestautomation.com/practice/');
    await page.pause();


});

});







