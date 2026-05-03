import { expect } from '@playwright/test';

class CreateImport1 {
    constructor(page) {
            this.page = page;
            this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
            this.addButton =this.frame.getByRole('menuitem', { name: /Add/ });
            this.importNameInput = this.frame.locator("//input[@name='importName']"); // Locator for import name input in create import form
            this.datasetDropdown = this.frame.locator('#bui-combobox-34-input');// Locator for dataset dropdown in create import form
            this.importType=this.frame.locator('#bui-combobox-50-input');
            this.fileInput = this.frame.locator('input[type="file"]'); // Locator for file input in create import form
            this.entityradioButton=this.frame.locator("//input[@name='entity']");
            this.entityInput = this.frame.locator('#bui-combobox-44-input'); // Locator for entity input in create import form
            //this.entityCheckbox = this.frame.locator("//input[@name='entity']"); // Locator for entity checkbox in create import form
            this.nextButton = this.frame.getByText("Next"); // Locator for Next button in create import form
            this.headerRowInput = this.frame.locator("//div[@class='col-md-4']//input[@name='rowAndHeader']").nth(1); // Locator for header row input in preview
            this.firstDataRowCheckbox = this.frame.locator('table input[type="checkbox"]').first(); // Locator for first data row checkbox in preview
            this.importButton = this.frame.locator("//button[@id='importDetails']"); // Locator for button to open import details page after setup
            this.refreshButton = this.frame.locator('button[title="Refresh"]'); // Locator for refresh button in import details page
        }   
    async createNewImport(ImportName, DatasetName,ImportType,EntityName) {
    await this.page.waitForTimeout(2000);    
   await this.addButton.click();
  await this.page.waitForTimeout(2000);
  await this.importNameInput.fill(ImportName);
  await this.page.keyboard.press('Tab');
 await this.page.waitForTimeout(2000);
  await this.datasetDropdown.pressSequentially(DatasetName);
  await this.page.waitForTimeout(2000);
  await this.frame.locator('div.mb-1',{hasText:DatasetName}).click();
  await this.page.waitForTimeout(2000);
  await this.page.keyboard.press('Tab');
  await this.page.keyboard.press('Tab');
  await this.page.keyboard.press('Tab');
  await this.page.keyboard.press('Enter');
  await this.page.waitForTimeout(2000);
  await this.importType.pressSequentially(ImportType);
  await this.frame.locator('div.mb-1', { hasText: ImportType }).click();
  await this.page.keyboard.press('Tab');
  await this.page.keyboard.press('Tab');
  await this.page.keyboard.press('Tab');
  await this.page.keyboard.press('Tab');
 
    //await frame.getByRole('label', { name: 'Press enter key to browse file' }).click();
  await this.fileInput.setInputFiles("C:/Playwright_self/playwright-OCT-Automation2/Test Data/BVT_UK_ImportTB.xlsx");
  await this.entityradioButton.check();// Select entity in import setup
  await this.page.keyboard.press('Tab');
  await this.entityInput.pressSequentially(EntityName);
  await this.frame.locator('div.mb-1', { hasText: EntityName }).click();
  await this.nextButton.click();
  await  this.headerRowInput.check();// Select header row in preview
  await this.firstDataRowCheckbox.check();// Select first data row in preview
 // await frame.locator("//label[contains(text(),'In the header row')]/preceding-sibling::input[@type='radio']").check();
  await this.nextButton.click();
  await this.page.waitForTimeout(2000);
 await this.importButton.click();
 //console.log("Import created successfully with name: " + ImportName);
 await this.page.waitForTimeout(2000);



       // Verify Import Creation
    await this.frame.getByLabel('Edit Filter for Column Name').nth(1).click();
    await this.frame.getByRole('textbox', { name: 'Search Item List' }).fill(ImportName);
    await this.page.waitForTimeout(1000);
    await this.frame.getByRole('button', { name: 'Apply' }).click();
    await this.page.waitForTimeout(2000);
    await expect(this.frame.getByRole('gridcell', { name: ImportName })).toHaveText(ImportName);
 

  
}

async getImportStatusWithRefresh(ImportName, maxRetries = 10) {
    const finalStatuses = ['Successful', 'Failed', 'Partially successful'];
    let currentStatus = '';
    let retryCount = 0;

    try {
        while (retryCount < maxRetries) {
            // Get the current status from Progress column
            const importRow = this.frame.locator(`div[role="row"]:has(div[role="gridcell"]:has-text("${ImportName}"))`);
            
            // Get the Progress badge/status (first visible cell with status)
            currentStatus = await importRow
                .locator('div[role="gridcell"]')
                .nth(1)  // Adjust index if needed based on column position
                .textContent();
            
            const status = currentStatus.trim();
            console.log(`Attempt ${retryCount + 1}: Import ${ImportName} - Status: ${status}`);

            // Check if status is one of the final statuses
            if (finalStatuses.some(finalStatus => status.includes(finalStatus))) {
                console.log(`✓ Import completed with status: ${status}`);
                return status;
            }

            // If not final status, click refresh and retry
            if (retryCount < maxRetries - 1) {
                console.log(`Status not final (${status}). Clicking refresh button...`);
                await this.refreshButton.click();
                await this.page.waitForTimeout(3000); // Wait for refresh to complete
                retryCount++;
            } else {
                console.log(`⚠ Max retries (${maxRetries}) reached. Final status: ${status}`);
                return status;
            }
        }
    } catch (error) {
        console.error(`Error while checking import status: ${error.message}`);
        throw error;
    }
}
}
export { CreateImport1 };