import { expect } from '@playwright/test';
import { POManager } from '../OCT_PO/POManager.js';
import { environments } from "../OCT_PO/Env.js";
import{ testDataForBVT_UK } from '../Utils/test-base.js';





testDataForBVT_UK('BVT_UK', async ({ testDataForBVT_UK, page }) => {

const normalizeUiText = (value) => value.replace(/\u00a0/g, " ").trim();

const testURL = environments[testDataForBVT_UK.env].url;

    const poManager = new POManager(page);
    if (testDataForBVT_UK.env === "EMEA" || testDataForBVT_UK.env === "APAC") {
        await page.goto(testURL);
        //const login = new POManager(page);
        await poManager.loginToApplication("AkshayVadde.fim", "$Admin#136", "SYS_FIRM");
      } else if (testDataForBVT_UK.env === "QA" || testDataForBVT_UK.env === "SAT") {
        await page.goto(testURL);
        
        await poManager.loginToLApp("akshay.vadde+test@tr.com","$Admin#1","SYS_FIRM");
      }

    const frame = page.frameLocator('iframe[title="Corporate Tax"]');


await page.waitForTimeout(3000);


   
   // Entity Creation
    await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Entity Manager').click();
    await poManager.createEntity(testDataForBVT_UK.EntityName, testDataForBVT_UK.ShortName, testDataForBVT_UK.Jurisdiction);

    // creating Dataset
     await frame.getByRole('button', { name: 'Calculations' }).click();
    await frame.getByText('Calculations').nth(1).click();
   const result = await poManager.createDataset(testDataForBVT_UK.DatasetName, testDataForBVT_UK.EntityName);
   testDataForBVT_UK.taxYear = result.taxYear;
   testDataForBVT_UK.CalculationName = result.CalculationName;
    

    //  creating COA
    await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Chart of Accounts').click();
    await page.waitForTimeout(2000);
    await poManager.createCOA(testDataForBVT_UK.COAName, testDataForBVT_UK.taxYear);
   // creating Map
   await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Mapping').click();
    await poManager.createNewMap1(testDataForBVT_UK.MapName, testDataForBVT_UK.DatasetName, testDataForBVT_UK.COAName, "United Kingdom Corporate Tax 2025 1.121", "Trial balance");
    
   // creating Import
     await frame.getByRole('button', { name: 'Imports' }).click();
     await page.waitForTimeout(2000);
    await frame.getByText('ImportDetails').click();
    //await frame.getByRole('link', { name: 'Import Details' }).click();
    await page.waitForTimeout(2000);
   await poManager.createNewImport1(testDataForBVT_UK.ImportName, testDataForBVT_UK.DatasetName, testDataForBVT_UK.ImportType, testDataForBVT_UK.EntityName);

   /*   // Verify Import Creation
   await frame.getByLabel('Edit Filter for Column Name').nth(1).click();
   await frame.getByRole('textbox', { name: 'Search Item List' }).fill(testDataForBVT_UK.ImportName);
   await page.waitForTimeout(1000);
   await frame.getByRole('button', { name: 'Apply' }).click();
   await page.waitForTimeout(2000);
   const importText = await frame.getByRole('gridcell', { name: testDataForBVT_UK.ImportName }).textContent();
  expect(importText).toBe(testDataForBVT_UK.ImportName); */


// Navigate to CMS screen, open newly created calculation and verify the imported values

await frame.getByRole('button', { name: 'Calculations' }).click();
await frame.getByRole('link', { name: 'Calculations' }).click();   
await page.waitForTimeout(2000);

const expTurnoverValue = "58,032";
const expCostOfSalesValue = "(962,653)";

await frame.getByRole('gridcell', { name: testDataForBVT_UK.CalculationName }).click();
await page.waitForTimeout(2000);

await frame.getByRole('treeitem', { name: 'expand <span class="nav-ref "></span><span class="nav-description">Comprehensive income analysis</span> Comprehensive income analysis', exact: true }).getByLabel('expand').click();
await page.waitForTimeout(2000);
await frame.getByText('Income statement', { exact: true }).click();

const Turnover= await frame.locator('[id="athena-worksheet-Cell-6:2"] > div:nth-child(3)').innerText();
console.log("Turnover value in Calculation after import:" +Turnover);
expect(normalizeUiText(Turnover)).toBe(expTurnoverValue);

const costOfSales=await frame.locator("//div[@id='athena-worksheet-Cell-7:2']/div/span").innerText();
console.log("Cost of Sales value in Calculation after import:" +costOfSales);
expect(normalizeUiText(costOfSales)).toBe(expCostOfSalesValue);
   
});
       

   


