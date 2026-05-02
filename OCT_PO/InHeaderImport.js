import { expect } from '@playwright/test';

class InHeaderImport {
    constructor(page) {
            this.page = page;
            this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
            this.addButton =this.frame.getByRole('menuitem', { name: /Add/ });
            this.importNameInput = this.frame.locator("//input[@name='importName']"); // Locator for import name input in create import form
            this.datasetDropdown = this.frame.locator('input.form-control.bui-menu-item').first();// Stable locator for dataset dropdown
            this.importType=this.frame.locator('input.form-control.bui-menu-item').nth(1);// Stable locator for import type dropdown
            this.fileInput = this.frame.locator('input[type="file"]'); // Locator for file input in create import form
            this.nextButton = this.frame.getByText("Next"); // Locator for Next button in create import form
            this.headerRowInput = this.frame.locator("//div[@class='col-md-4']//input[@name='rowAndHeader']").nth(1); // Locator for header row input in preview
            this.firstDataRowCheckbox = this.frame.locator('table input[type="checkbox"]').first(); // Locator for first data row checkbox in preview
            this.Inaheaderrow= this.frame.getByRole('radio').nth(3); // Locator for In the header row radio button in preview
            this.importButton = this.frame.locator("//button[@id='importDetails']"); // Locator for button to open import details page after setup
            // Field Options page - Destination column dropdowns (stable locators by row position)
            this.firstDestinationDropdown = this.frame.locator('tbody tr').first().locator('input.form-control.bui-menu-item');
            this.secondDestinationDropdown = this.frame.locator('tbody tr').nth(1).locator('input.form-control.bui-menu-item');
            this.thirdDestinationDropdown = this.frame.locator('tbody tr').nth(2).locator('input.form-control.bui-menu-item');
        }   
    async inHeaderImport1(ImportName, DatasetName,ImportType,Importpath) {
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
  await this.fileInput.setInputFiles(Importpath);
 /*await this.entityradioButton.check();// Select entity in import setup
  await this.page.keyboard.press('Tab');
  await this.entityInput.pressSequentially(EntityName);
  await this.frame.locator('div.mb-1', { hasText: EntityName }).click(); */
  await this.nextButton.click();
  await  this.headerRowInput.check();// Select header row in preview
  await this.firstDataRowCheckbox.check();// Select first data row in preview
  await this.Inaheaderrow.check();
  await this.nextButton.click();
  await this.page.waitForTimeout(2000);
  await this.firstDestinationDropdown.click();// Select destination column for first source column
  await this.frame.getByRole('option', { name: 'Code' }).click();
await this.frame.getByRole('columnheader', { name: 'Destination' }).click(); // Close dropdown

  await this.secondDestinationDropdown.click();
    await this.frame.getByRole('option', { name: 'Description' }).click();
   await this.frame.getByRole('columnheader', { name: 'Destination' }).click(); // Close dropdown
  await this.thirdDestinationDropdown.click();// Select destination column for first source column
  await this.frame.getByRole('option', { name: 'Amount' }).click();
  await this.page.waitForTimeout(2000);
 await this.importButton.click();
 console.log("Import created successfully with name: " + ImportName);
 await this.page.waitForTimeout(2000);



       // Verify Import Creation
    await this.frame.getByLabel('Edit Filter for Column Name').nth(1).click();
    await this.frame.getByRole('textbox', { name: 'Search Item List' }).fill(ImportName);
    await this.page.waitForTimeout(1000);
    await this.frame.getByRole('button', { name: 'Apply' }).click();
    await this.page.waitForTimeout(2000);
    await expect(this.frame.getByRole('gridcell', { name: ImportName })).toHaveText(ImportName);
 

  
}
}
export { InHeaderImport };