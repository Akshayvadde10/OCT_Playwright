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
    const datasetInput = this.frame.locator("#mapping_add_datasets");
    await datasetInput.click();
    await datasetInput.pressSequentially(DatasetName, { delay: 150 }); // slow typing so combobox filters properly
    await this.page.waitForTimeout(1000);
    const datasetOption = this.frame.getByRole('option', { name: DatasetName, exact: true });
    if (await datasetOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await datasetOption.click();
    } else {
        await datasetInput.press('Enter');
    }
    await this.page.keyboard.press('Tab');
     await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Tab');
   
    await this.page.waitForTimeout(3000);

    // Select COA from combobox. The listbox sometimes shows the full unfiltered list
    // (newly-created COA not yet indexed); if not found, clear and retype once.
    const coaInput = this.frame.locator("#mapping_add_coa");
    const coaOption = this.frame.getByRole('option', { name: COAName, exact: true });
    const coaOptionLoose = this.frame.locator('[role="option"]').filter({ hasText: COAName }).first();

    await coaInput.click();
    await coaInput.pressSequentially(COAName, { delay: 150 }); // slow typing so combobox filters properly
    await this.page.waitForTimeout(1500);

    let coaSelected = false;
    if (await coaOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await coaOption.click();
        coaSelected = true;
    } else if (await coaOptionLoose.isVisible({ timeout: 1000 }).catch(() => false)) {
        await coaOptionLoose.click();
        coaSelected = true;
    } else {
        console.log(`COA "${COAName}" not in dropdown. Clearing and retyping once.`);
        await coaInput.click();
        await coaInput.press('Control+A');
        await coaInput.press('Backspace');
        await this.page.waitForTimeout(500);
        await coaInput.pressSequentially(COAName, { delay: 200 }); // even slower on retry
        await this.page.waitForTimeout(2000);
        if (await coaOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await coaOption.click();
            coaSelected = true;
        } else if (await coaOptionLoose.isVisible({ timeout: 1000 }).catch(() => false)) {
            await coaOptionLoose.click();
            coaSelected = true;
        }
    }

    if (!coaSelected) {
        // Last-ditch: try the original div.mb-1 selector with a short timeout
        const legacy = this.frame.locator("div.mb-1", { hasText: COAName }).first();
        await legacy.click({ timeout: 5000 });
    }

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
   await this.page.waitForTimeout(1000);
   const importTypeOption = this.frame.getByRole('option', { name: ImportType, exact: true });
   if (await importTypeOption.isVisible({ timeout: 3000 }).catch(() => false)) {
       await importTypeOption.click();
   } else {
       await importTypeInput.press('Enter');
   }
    const mapDialog = this.frame.locator('ngb-modal-window[role="dialog"]');
    await this.okButton.click(); // Save the new Map

 
     await this.frame.locator("//div[@id='athena-grid-cell-44-0:2']//button").click();// Click the actions button for the created Map to open the dropdown
    await this.frame.locator(".wj-form-control").pressSequentially(MapName);
    await this.page.waitForTimeout(2000);
    await this.frame.getByText("Apply").click();
    await this.page.waitForTimeout(2000);
    await this.frame.locator(`//a[text()="${MapName}"]`).click(); // Click the created Map to open details page
    await this.page.waitForTimeout(10000);
    await this.frame.locator('input[type="file"]').setInputFiles("Test Data/BVT_UK_ImportMapping.xlsx");
    await this.page.waitForTimeout(2000);
    console.log("Map created successfully with name: " + MapName);
}
}
export { CreateMap1 };