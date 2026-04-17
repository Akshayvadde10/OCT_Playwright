import {expect, test} from 'playwright/test';
import { POManager } from '../OCT_PO/POManager.js';
import { environments } from "../OCT_PO/Env.js";

test('BVT_UK', async ({ page }) => {

let EntityName=`PWEntity_${Date.now()}`
let ShortName=`PW_${Date.now()}`
let Jurisdiction="United Kingdom";
let DatasetName="PWDS_"+Date.now();
let CalculationName;
let taxYear;
let COAName=`PWCOA_${Date.now()}`;
let MapName=`PWMap_${Date.now()}`;
let ImportType="Trial balance";
let ImportName=`PWImport_${Date.now()}`;
let env = "SAT"; // Change this value to switch environments
const testURL = environments[env].url;

    const poManager = new POManager(page);
    if (env === "EMEA") {
        await page.goto(testURL);
        const login = new POManager(page);
        await login.loginToApplication("AkshayVadde.fim", "$Admin#135", "SYS_FIRM");
      } else if (env === "SAT") {
        await page.goto(testURL);
         const login = new POManager(page);
        await login.loginToLApp("akshay.vadde+test@tr.com","$Admin#1","SYS_FIRM");
      }

    const frame = page.frameLocator('iframe[title="Corporate Tax"]');


await page.waitForTimeout(3000);


   
   // Entity Creation
    await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Entity Manager').click();
    await poManager.createEntity(EntityName, ShortName, Jurisdiction);

    // creating Dataset
     await frame.getByRole('button', { name: 'Calculations' }).click();
    await frame.getByText('Calculations').nth(1).click();
   const result = await poManager.createDataset(DatasetName, EntityName);
   taxYear = result.taxYear;
   CalculationName = result.CalculationName;
    

    //  creating COA
    await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Chart of Accounts').click();
    await page.waitForTimeout(2000);
    await poManager.createCOA(COAName, taxYear);

   // creating Map
   await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Mapping').click();
    await poManager.createNewMap1(MapName, DatasetName, COAName, "United Kingdom Corporate Tax 2025 1.121", "Trial balance");
    
   // creating Import

     await frame.getByRole('button', { name: 'Imports' }).click();
     await page.waitForTimeout(2000);
    await frame.getByRole('link', { name: 'Import Details' }).click();
    await page.waitForTimeout(2000);
   await poManager.createNewImport1(ImportName, DatasetName, ImportType, EntityName);

      // Verify Import Creation
   await frame.getByLabel('Edit Filter for Column Name').nth(1).click();
   await frame.getByRole('textbox', { name: 'Search Item List' }).fill(ImportName);
   await page.waitForTimeout(1000);
   await frame.getByRole('button', { name: 'Apply' }).click();
   await page.waitForTimeout(2000);
   const importText = await frame.getByRole('gridcell', { name: ImportName }).textContent();
  expect(importText).toBe(ImportName);


// Navigate to CMS screen, open newly created calculation and verify the imported values

await frame.getByRole('button', { name: 'Calculations' }).click();
await frame.getByRole('link', { name: 'Calculations' }).click();   
await page.waitForTimeout(2000);

const expTurnoverValue = "58,032";
const expCostOfSalesValue = "(962,653)";

await frame.getByRole('gridcell', { name: CalculationName }).click();
await page.waitForTimeout(2000);

await frame.getByRole('treeitem', { name: 'expand <span class="nav-ref "></span><span class="nav-description">Comprehensive income analysis</span> Comprehensive income analysis', exact: true }).getByLabel('expand')
.click();
await page.waitForTimeout(2000);
await frame.getByText('Income statement', { exact: true }).click();

const Turnover= await frame.locator('[id="athena-worksheet-Cell-6:2"] > div:nth-child(3)').textContent();
console.log("Turnover value in Calculation after import: " + Turnover);
expect(Turnover).toBe(expTurnoverValue);

const costOfSales=await frame.locator("//div[@id='athena-worksheet-Cell-7:2']/div/span").textContent();
console.log("Cost of Sales value in Calculation after import: " + costOfSales);
expect(costOfSales).toBe(expCostOfSalesValue);

     await page.pause();
   
});
       

   


