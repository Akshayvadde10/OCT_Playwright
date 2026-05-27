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

    // Finds the editable "insert" row's first cell. After a previous save
    // the grid may be re-sorted/scrolled so the hard-coded id locator
    // (athena-grid-cell-1-1:0) no longer points at the blank row. Fall
    // back to a structural locator that targets the first row whose
    // Short Name cell is empty.
    async resolveBlankRowFirstCell(timeout = 15000) {
        // Fast path: the original id-based locator if it's there.
        try {
            await this.EntNameCell.waitFor({ state: 'visible', timeout: 3000 });
            return this.EntNameCell;
        } catch {
            // fall through to structural fallback
        }

        // Make sure we're looking at the top of the grid where a blank
        // insert row typically appears.
        await this.frame.getByRole('button', { name: /Go to first page/i })
            .click({ timeout: 2000 })
            .catch(() => {});

        const blankRow = this.frame
            .getByRole('row')
            .filter({ has: this.frame.getByRole('gridcell', { name: '', exact: true }) })
            .first();

        await blankRow.waitFor({ state: 'visible', timeout });
        return blankRow.getByRole('gridcell').first();
    }

    async createEntity(entityName,shortName,jurisdiction){

        const firstCell = await this.resolveBlankRowFirstCell();
        await firstCell.click();// Entity Name cell
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
        await this.page.keyboard.type(entityName);// Type the unique entity identifier
        await this.page.keyboard.press('Tab');// Confirm with Tab key
       // await this.jurisdictionCell.click();// Click Jurisdiction cell to activate dropdown input
        await this.page.waitForTimeout(1000);
       await this.page.keyboard.type(jurisdiction);
       await this.page.waitForTimeout(1000);
        await this.frame.getByRole('option', { name: jurisdiction, exact: true }).click();// select Jurisdiction from dropdown
        await this.page.keyboard.press('Tab');// Confirm with Tab key
        await this.page.keyboard.press('Enter');// Save the entity
          // Wait for grid to refresh after entity creation
        await this.page.waitForTimeout(2000);
        /*await this.nameHeaderButton.click();// Click Name header to sort
        await this.filterInput.fill(entityName);// Filter the grid by the unique entity name
        await this.page.waitForTimeout(2000);
        await this.frame.getByText('Apply').click();
        console.log("Entity created successfully with name:" + entityName);
        */
    }
}

export { EntCreation };