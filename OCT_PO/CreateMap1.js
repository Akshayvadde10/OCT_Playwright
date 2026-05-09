class CreateMap1 {
    constructor(page) {
        this.page = page;   
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.addButton = this.frame.locator("//button[@id='addNewMap']");
        this.mapNameInput = this.frame.locator("#mapping_add_mapName");
        this.datasetDropdown = this.frame.locator('#bui-combobox-16-input');
        this.COAdropdown = this.frame.locator('#bui-combobox-20-input');
        this.Mapped_to_Dropdown = this.frame.locator('#bui-combobox-22-input');
        this.ImportTypeDropdown = this.frame.locator('#bui-combobox-24-input');
        this.okButton = this.frame.getByRole("button", { name: "OK" });
    }   
    async createNewMap(MapName, DatasetName, COAName, template, ImportType) { 
       
         
    await this.addButton.click(); // Click Add button to create new Map
    await this.page.waitForTimeout(2000);
    await this.mapNameInput.fill(MapName);
    await this.page.waitForTimeout(2000);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
   
    
    //await this.datasetDropdown.pressSequentially(DatasetName);
    await this.frame.locator("#mapping_add_datasets").pressSequentially(DatasetName);
    await this.frame.locator("div.mb-1", { hasText: DatasetName }).click();
    await this.page.keyboard.press('Tab');
     await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Tab');
   
    await this.page.waitForTimeout(2000);
    
   // await this.COAdropdown.pressSequentially(COAName);
        await this.frame.locator("#mapping_add_coa").pressSequentially(COAName);
    await this.frame.locator("div.mb-1", { hasText: COAName }).click();
    await this.page.waitForTimeout(2000);
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    // await this.Mapped_to_Dropdown.pressSequentially(template);
    await this.frame.locator("#mapping_add_templates").pressSequentially(template);
    await this.frame.locator("div.mb-1", { hasText: template }).click();
    await this.page.waitForTimeout(2000);
     await this.page.keyboard.press('Tab');
     await this.page.keyboard.press('Tab');
   // await this.ImportTypeDropdown.pressSequentially(ImportType);
   await this.frame.locator("#mapping_add_importTypes").pressSequentially(ImportType);
    await this.frame.locator("div.mb-1", { hasText: ImportType }).click();
    await this.okButton.click(); // Save the new Map
    await this.frame.locator("//div[@id='athena-grid-cell-44-0:2']//button").click();// Click the actions button for the created Map to open the dropdown
    await this.frame.locator(".wj-form-control").pressSequentially(MapName);
    await this.page.waitForTimeout(2000);
    await this.frame.getByText("Apply").click();
    await this.page.waitForTimeout(2000);
    await this.frame.locator(`//a[text()="${MapName}"]`).click(); // Click the created Map to open details page
    await this.page.waitForTimeout(5000);
    await this.frame.locator('input[type="file"]').setInputFiles("C:/Playwright_self/playwright-OCT-Automation2/Test Data/Regression/4689052/UK_ImportMapping.xlsx");
    await this.page.waitForTimeout(5000);
    console.log("Map created successfully with name: " + MapName);
    }
}
export { CreateMap1 };