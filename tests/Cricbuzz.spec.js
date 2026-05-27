import {test,expect} from '@playwright/test';

test("cricbuzz home page validation",async({page})=>{

    await page.goto("https://www.cricbuzz.com/");

   const team = await page.getByText("KKR").first();
   const teamScore = await team.locator('span.font-medium').textContent();
console.log("KKR Score: ", teamScore);
});