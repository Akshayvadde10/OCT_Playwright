import {test} from '@playwright/test';
import { POManager } from '../../OCT_PO/POManager.js';
import { environments } from "../../OCT_PO/Env.js";
import { updateEntityHeaders } from '../../utils/excelHeaderUpdater.js';
import { Printcalc } from '../../OCT_PO/Printcalc.js';

test('4689052_InHeaderImports05', async ({ page }) => {

let Tsid="2222249";
let GrpEntityName=`${Tsid}_Grp_${Date.now()}`
let GrpShortName=`${Tsid}_Grp_${Date.now()}`

let EntityName01=`${Tsid}_PWE01_${Date.now()}`
let ShortName01=`${Tsid}_PWE01_${Date.now()}`

let EntityName02=`${Tsid}_PWE02_${Date.now()}`
let ShortName02=`${Tsid}_PWE02_${Date.now()}`

let EntityName03=`${Tsid}_PWE03_${Date.now()}`
let ShortName03=`${Tsid}_PWE03_${Date.now()}`

let EntityName04=`${Tsid}_PWE04_${Date.now()}`
let ShortName04=`${Tsid}_PWE04_${Date.now()}`

let Jurisdiction="United Kingdom";
let DatasetName=`${Tsid}_PWDS_${Date.now()}`;
let CalculationName;
let taxYear;
let COAName=`${Tsid}_PWCOA_${Date.now()}`;
let MapName=`${Tsid}_PWMap_${Date.now()}`;
let ImportType="Trial balance";
let ImportName01=`${Tsid}_PWImport01_${Date.now()}`;
let ImportName02=`${Tsid}_PWImport02_${Date.now()}`;
let ImportName03=`${Tsid}_PWImport03_${Date.now()}`;

let Importpath1 = 'C:\\Playwright_self\\playwright-OCT-Automation2\\Test Data\\Regression\\4689052_InHeaderImports05\\UK_InHeader_ImportTb.xlsx';
let Importpath2 = 'C:\\Playwright_self\\playwright-OCT-Automation2\\Test Data\\Regression\\4689052_InHeaderImports05\\UK_InHeader_ImportTb02.xlsx';
let ExpectedPdfImport = 'C:\\Playwright_self\\playwright-OCT-Automation2\\Test Data\\Regression\\4689052_InHeaderImports05\\Expected_ImportTb.pdf';
let ExpectedPdfAppend = 'C:\\Playwright_self\\playwright-OCT-Automation2\\Test Data\\Regression\\4689052_InHeaderImports05\\Expected_AppendExistong_ImportTb.pdf';
let env = process.env.TEST_ENV || "SAT"; // Read from environment variable, default to SAT
const expTurnoverValue = "58,032";
const expCostOfSalesValue = "(962,653)";
const expEnt2value = "13,488,169";
const expTotalValue ="40,464,507";
const testURL = environments[env].url;

      // Read credentials from environment variables (for CI/CD) or use defaults (for local)
    const mailid = process.env.TEST_USERNAME || "akshay.vadde+test@tr.com";
    const password = process.env.TEST_PASSWORD || "$Admin#1";
    const EMEAusername = process.env.TEST_USERNAME || "Shilpa_Manchikatla_FIM";
    const emeaPassword = process.env.EMEA_PASSWORD || "Test@0112";
    const username = process.env.TEST_USERNAME || "AkshayAuto05.WAU";

 const poManager = new POManager(page);
    if (env === "EMEA") {
        await page.goto(testURL);
        await poManager.loginToApplication(EMEAusername, emeaPassword, "SYS_FIRM");
      } else if (env === "SAT") {
        await page.goto(testURL);

        await poManager.loginToLApp(mailid,password,username, "SYS_FIRM");
        
      }
    const frame = page.frameLocator('iframe[title="Corporate Tax"]');


await page.waitForTimeout(3000);


   
   // Entity Creation
    await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Entity Manager').click();
    await poManager.createEntity(GrpEntityName, GrpShortName, Jurisdiction);
    await poManager.createEntity(EntityName01, ShortName01, Jurisdiction);
    await poManager.createEntity(EntityName02, ShortName02, Jurisdiction);
    await poManager.createEntity(EntityName03, ShortName03, Jurisdiction);
    await poManager.createEntity(EntityName04, ShortName04, Jurisdiction);
    await poManager.filterEntity(GrpEntityName);
    await poManager.groupEntity(GrpEntityName,Tsid);
    await page.waitForTimeout(2000);
    

    // Find the group in the tree - target the treeitem role to avoid sr-only label
    const treeContainer = frame.locator('[role="tree"]');
    const groupElement = treeContainer.locator('[role="treeitem"]').filter({ hasText: GrpEntityName });

    try {
        // Try to click with short timeout (in case it's already visible)
        await groupElement.click({ timeout: 3000 });
    } catch (error) {
        // Not visible - scroll tree to the bottom (latest groups are at the end)
        await treeContainer.evaluate(el => {
            el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(500);

        // Now click the group
        await groupElement.click();
    }

   
    await poManager.filterEntity(EntityName01);
    await poManager.addEntityToGroup(GrpEntityName, EntityName01);
    await poManager.filterEntity(EntityName02);
    await poManager.addEntityToGroup(GrpEntityName, EntityName02);
    await poManager.filterEntity(EntityName03);
    await poManager.addEntityToGroup(GrpEntityName, EntityName03);
    await poManager.filterEntity(EntityName04);
    await poManager.addEntityToGroup(GrpEntityName, EntityName04);
    await frame.locator('#saveEntities').click(); // Click the save button to save the changes

    // Update Excel headers with created entity names
    const filepath01 = 'C:\\Playwright_self\\playwright-OCT-Automation2\\Test Data\\Regression\\4689052_InHeaderImports05\\UK_InHeader_ImportTb.xlsx';
    await updateEntityHeaders(filepath01, EntityName01, EntityName02, EntityName03);
    console.log('Excel headers updated with:', EntityName01, EntityName02, EntityName03);

   const filepath02 = 'C:\\Playwright_self\\playwright-OCT-Automation2\\Test Data\\Regression\\4689052_InHeaderImports05\\UK_InHeader_ImportTb02.xlsx';
    await updateEntityHeaders(filepath02, EntityName01, EntityName02, EntityName03);
    console.log('Excel headers updated with:', EntityName01, EntityName02, EntityName03);

      let Entities=[EntityName01, EntityName02, EntityName03, EntityName04];

    // creating Dataset
     await frame.getByRole('button', { name: 'Calculations' }).click();
    await frame.getByText('Calculations').nth(1).click();
    const result = await poManager.createDataset(DatasetName, GrpEntityName,Entities);
    const { calculations, taxYear: datasetTaxYear } = result;
  
   CalculationName = calculations;
     taxYear = datasetTaxYear;
   

    //  creating COA
    await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Chart of Accounts').click();
    await page.waitForTimeout(2000);
    await poManager.createCOA(COAName, taxYear);
    //await poManager.createCOA(COAName);



   // creating Map
   await frame.getByRole('button', { name: 'Configuration' }).click();
    await frame.getByText('Mapping').click();
   await poManager.createNewMap1(MapName, DatasetName, COAName, "United Kingdom Corporate Tax 2025 1.370", "Trial balance");
     
     //insert sheet
      for (let i=1; i<CalculationName.length-1; i++){
    await poManager.insertSheet(CalculationName[i], "Business - trade or property");
     await page.waitForTimeout(2000);
    
  }


   // creating Import

     // Click Imports button and wait for dropdown/submenu
     await frame.getByRole('button', { name: 'Imports' }).click();
     console.log("Clicked Imports button");
     await page.waitForTimeout(1000);

   await frame.locator("//a[@id='home.importOCT']").click();
    await page.waitForTimeout(2000);

    // Wait for Import Details page to be ready
    await frame.getByRole('menuitem', { name: 'Add' }).waitFor({ state: 'visible', timeout: 10000 });
    console.log("Add button is now visible");
    
   await poManager.inHeaderImport(ImportName01, DatasetName, ImportType,Importpath1);
      await page.waitForTimeout(2000); 

// Navigate to CMS screen, open newly created calculation and verify the imported values
for (let i=1; i<CalculationName.length-1; i++){
await poManager.validateImport(CalculationName[i], expTurnoverValue, expCostOfSalesValue);
const { buffer } = await poManager.printcalculation(CalculationName[i]);
await poManager.compareFiles(CalculationName[i], buffer, ExpectedPdfImport);
await poManager.drillDownPO.verifyDrilldown("58,032","Turnover", "-58,032.17");
await poManager.drillDownPO.verifyDrilldown("(962,653)","Cost of sales", "962,652.71");
    }


    const expgrpEnt2Value = "13,488,169";
    const expgrpTotalValue = "40,464,507";
 await poManager.validateGrpImportedValues(CalculationName[0], EntityName02, expgrpEnt2Value, expgrpTotalValue);



// creating Import2

     await frame.getByRole('button', { name: 'Imports' }).click();
     await page.waitForTimeout(2000);

     await frame.locator("//a[@id='home.importOCT']").click();

    // Wait for Import Details page to be ready
    await frame.getByRole('menuitem', { name: 'Add' }).waitFor({ state: 'visible', timeout: 10000 });
    
   await poManager.inHeaderImport(ImportName02, DatasetName, ImportType,Importpath2);
      await page.waitForTimeout(2000);

// Navigate to CMS screen, open newly created calculation and verify the imported values

for (let i=1; i<CalculationName.length-1; i++){
await poManager.validateImport(CalculationName[i], expTurnoverValue, expCostOfSalesValue);
const { buffer } = await poManager.printcalculation(CalculationName[i]);
await poManager.compareFiles(CalculationName[i], buffer, ExpectedPdfImport);
await poManager.drillDownPO.verifyDrilldown("58,032","Turnover", "-58,032.17");
await poManager.drillDownPO.verifyDrilldown("(962,653)","Cost of sales", "962,652.71");
}

 await poManager.validateGrpImportedValues(CalculationName[0], EntityName02, expgrpEnt2Value, expgrpTotalValue);



//await poManager.validateImport(GrpEntityName, grpexpTurnoverValue, grpexpCostOfSalesValue);

   // creating Import3- Append to existing import

     await frame.getByRole('button', { name: 'Imports' }).click();
     await page.waitForTimeout(2000);

   await frame.locator("//a[@id='home.importOCT']").click();

    // Wait for Import Details page to be ready
    await frame.getByRole('menuitem', { name: 'Add' }).waitFor({ state: 'visible', timeout: 10000 });
    
   await poManager.appendExistingImport(ImportName03, DatasetName, ImportType,Importpath1);
      await page.waitForTimeout(10000);

// Navigate to CMS screen, open newly created calculation and verify the imported values

// Expected values for append import (values should be doubled after appending)
const expTurnoverValueAppend = "116,064";
const expCostOfSalesValueAppend = "(1,925,305)";

for (let i=1; i<CalculationName.length-1; i++){
await poManager.validateImport(CalculationName[i], expTurnoverValueAppend, expCostOfSalesValueAppend);
const { buffer } = await poManager.printcalculation(CalculationName[i]);
await poManager.compareFiles(CalculationName[i], buffer, ExpectedPdfAppend);
await poManager.drillDownPO.verifyDrilldown("116,064","Turnover", "-116,064.34");
await poManager.drillDownPO.verifyDrilldown("(1,925,305)","Cost of sales", "1,925,305.42");

}

      const expgrpEnt2ValueAppend = "26,976,337";
    const expgrpTotalValueAppend = "80,929,011";
 await poManager.validateGrpImportedValues(CalculationName[0], EntityName02, expgrpEnt2ValueAppend, expgrpTotalValueAppend);



});
       

   


