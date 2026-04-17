class EntCreation{
    constructor(page){
        this.page=page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.EntNameCell =this.frame.locator('[id="athena-grid-cell-1-1:0"]'); // Locator for Entity Name cell in grid
        this.shortEntNamecell=this.frame.locator('[id="athena-grid-cell-1-1:1"]'); // Locator for Short Name cell in grid
        this.legalEntityTypeCell=this.frame.locator('[id="athena-grid-cell-1-1:3"]'); // Locator for Legal Entity type cell in grid
        this.entityIdentifierCell=this.frame.locator('[id="athena-grid-cell-1-1:4"]'); // Locator for Entity Identifier cell in grid
        this.jurisdictionCell=this.frame.locator('[id="athena-grid-cell-1-1:5"]'); // Locator for Jurisdiction cell in grid
        this.taxYearStartDateCell=this.frame.locator('[id="athena-grid-cell-1-1:6"]'); // Locator for Tax Year Start Date cell in grid
       // this.nameHeaderButton=this.frame.locator("//div[@id='athena-grid-cell-1-0:0']/button"); // Locator for Name header button in grid
       // this.filterInput=this.frame.locator('.wj-form-control'); // Locator for filter input
    }

    async createEntity(entityName,shortName,jurisdiction){
       
        await this.EntNameCell.click();// Entity Name cell
        await this.page.waitForTimeout(2000);
        await this.page.keyboard.type(entityName);// Type the unique entity name
        await this.page.keyboard.press('Tab');// Confirm with Tab key
        await this.shortEntNamecell.click(); // Short Name cell 
        await this.page.keyboard.type(shortName);// Type the unique short name
        console.log("Short Name for the entity: " + shortName);
        await this.page.keyboard.press('Tab');// Confirm with Tab key
        
        //await this.legalEntityTypeCell; // Click the Legal Entity type cell to open dropdown
        await this.frame.getByRole('option', { name: 'Company', exact: true }).click();
        //await this.frame.getByText('Company', { exact: true }).first().click();
        await this.page.keyboard.press('Tab');
        await this.entityIdentifierCell.click();// Entity Identifier cell
        await this.page.keyboard.type(entityName);// Type the unique entity identifier
        await this.page.keyboard.press('Tab');// Confirm with Tab key
       // await this.jurisdictionCell.click();// Click Jurisdiction cell to activate dropdown input
        await this.page.keyboard.type(jurisdiction);
        await this.frame.getByRole('option', { name: jurisdiction, exact: true }).click();// select Jurisdiction from dropdown
        await this.page.keyboard.press('Tab');// Confirm with Tab key
        await this.page.keyboard.press('Enter');// Save the entity
          // Wait for grid to refresh after entity creation
        await this.page.waitForTimeout(3000);
        /*await this.nameHeaderButton.click();// Click Name header to sort
        await this.filterInput.fill(entityName);// Filter the grid by the unique entity name
        await this.page.waitForTimeout(2000);
        await this.frame.getByText('Apply').click();
        console.log("Entity created successfully with name:" + entityName);
        */
    }
}

export { EntCreation };