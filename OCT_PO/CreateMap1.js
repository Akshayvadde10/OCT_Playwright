class CreateMap1 {
    constructor(page) {
        this.page = page;   
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.addButton = this.frame.locator("//button[@id='addNewMap']");
        this.mapNameInput = this.frame.locator("#mapping_add_mapName");
        this.datasetDropdown = this.frame.locator('#bui-combobox-16-input');
        this.COAdropdown = this.frame.locator('#bui-combobox-20-input');
        this.Mapped_to_Dropdown = this.frame.locator('#mapping_add_templates input[type="text"]');
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
    await this.page.waitForTimeout(2000);
    const templateInput = this.Mapped_to_Dropdown;
    await templateInput.click();
    const selectedTemplate = await templateInput.inputValue();
    if (selectedTemplate !== template) {
        await templateInput.press('Control+A');
        await templateInput.press('Backspace');
        await templateInput.pressSequentially(template);
    }
    await templateInput.press('Enter');
    await this.page.waitForTimeout(2000);
     await this.page.keyboard.press('Tab');
     await this.page.keyboard.press('Tab');
     await this.page.waitForTimeout(2000);
   // await this.ImportTypeDropdown.pressSequentially(ImportType);
   const importTypeInput = this.frame.locator('#mapping_add_importTypes input[type="text"]');
   await importTypeInput.click();
   const selectedImportType = await importTypeInput.inputValue();
   if (selectedImportType !== ImportType) {
       await importTypeInput.press('Control+A');
       await importTypeInput.press('Backspace');
       await importTypeInput.pressSequentially(ImportType);
   }
   await this.frame.locator("div.mb-1", { hasText: ImportType }).click();
    const mapDialog = this.frame.locator('ngb-modal-window[role="dialog"]');
    await this.okButton.click(); // Save the new Map

 
     await this.frame.locator("//div[@id='athena-grid-cell-44-0:2']//button").click();// Click the actions button for the created Map to open the dropdown
    await this.frame.locator(".wj-form-control").pressSequentially(MapName);
    await this.page.waitForTimeout(2000);
    await this.frame.getByText("Apply").click();
    await this.page.waitForTimeout(2000);
    await this.frame.locator(`//a[text()="${MapName}"]`).click(); // Click the created Map to open details page
    await this.page.waitForTimeout(10000);
    await this.frame.locator('input[type="file"]').setInputFiles("C:/Playwright_self/playwright-OCT-Automation2/Test Data/BVT_UK_ImportMapping.xlsx");
    await this.page.waitForTimeout(2000);
    console.log("Map created successfully with name: " + MapName);
}
}
export { CreateMap1 };