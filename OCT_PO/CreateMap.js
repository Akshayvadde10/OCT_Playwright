class CreateMap {
    constructor(page) {
        this.page = page;   
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.addButton = this.frame.locator("//button[@id='addNewMap']");
        this.mapNameInput = this.frame.locator("#mapping_add_mapName");
        //this.datasetDropdown = this.frame.locator("//input[@id='bui-combobox-0-input']");
        this.COAdropdown = this.frame.locator("//input[@id='bui-combobox-4-input']");
        this.Mapped_to_Dropdown = this.frame.locator("//input[@id='bui-combobox-6-input']");
        this.ImportTypeDropdown = this.frame.locator("//input[@id='bui-combobox-8-input']");
        this.okButton = this.frame.getByRole("button", { name: "OK" });
    }   
    async createNewMap(mapName, DatasetName, COAName, template, ImportType) {  
         
    await this.addButton.click(); // Click Add button to create new Map
    await this.page.waitForTimeout(2000);
    await this.mapNameInput.fill(mapName);
    await this.page.waitForTimeout(2000);
    
    //await this.frame.locator('#bui-combobox-16-input').pressSequentially(DatasetName);
    //await this.page.locator('iframe[title="Corporate Tax"]').contentFrame().locator('#bui-combobox-16-input').pressSequentially(DatasetName);
   // await this.frame.locator("//input[@id='bui-combobox-0-input']").pressSequentially(DatasetName);
   await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.frame.locator('#bui-combobox-2-input').pressSequentially(DatasetName);
   
   await this.frame.locator("div.mb-1", { hasText: DatasetName }).click();
    await this.page.waitForTimeout(2000);
    await this.COAdropdown.pressSequentially(COAName);
    // Sometimes the COA option list does not populate after the first type;
    // if the option is not visible, clear the input and retype to force refresh.
    const coaOption = this.frame.getByText(COAName);
    if (!(await coaOption.first().isVisible({ timeout: 5000 }).catch(() => false))) {
        console.log(`COA "${COAName}" not listed — clearing dropdown and retrying.`);
        await this.COAdropdown.click();
        await this.COAdropdown.press('Control+A');
        await this.COAdropdown.press('Backspace');
        await this.page.waitForTimeout(1000);
        await this.COAdropdown.pressSequentially(COAName);
        await coaOption.first().waitFor({ state: 'visible', timeout: 15000 });
    }
    await coaOption.click();
    await this.page.waitForTimeout(2000);
    await this.Mapped_to_Dropdown.pressSequentially("United Kingdom Corporate Tax");
    await this.frame.getByText(template).click();
    await this.page.waitForTimeout(2000);
    await this.ImportTypeDropdown.pressSequentially(ImportType);
    await this.frame.locator("div.mb-1", { hasText: ImportType }).click();
    await this.frame.getByRole("button", { name: "OK" }).click(); // Save the new Map
    
    await this.frame.locator("//div[@id='athena-grid-cell-44-0:2']//button").click();// Click the actions button for the created Map to open the dropdown
    await this.frame.locator(".wj-form-control").pressSequentially(mapName);
    await this.page.waitForTimeout(2000);
    await this.frame.getByText("Apply").click();
    await this.page.waitForTimeout(2000);
    await this.frame.locator(`//a[text()="${mapName}"]`).click(); // Click the created Map to open details page
    await this.page.waitForTimeout(5000);
    await this.frame.locator('input[type="file"]').setInputFiles("C:/Playwright_self/playwright-OCT-Automation2/Test Data/BVT_UK_ImportMapping.xlsx");
    await this.page.waitForTimeout(2000);
    console.log("Map created successfully with name: " + mapName);
}
}
export { CreateMap };