

import { expect } from '@playwright/test';
class ValidateGrpImportedValues {
    constructor(page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.calculationsButton = this.frame.getByRole('button', { name: 'Calculations' });
        this.calculationsLink = this.frame.getByRole('link', { name: 'Calculations' });
        
        this.lossSummaryLink = this.frame.getByText('Losses summary', { exact: true });
       this.Ent2cell = this.frame.locator('[id="athena-worksheet-Cell-5:2"] > div:nth-child(3)'); // Cell locator for Entity value in Loss summary sheet (first entity column)
        this.totalcell=this.frame.locator('[id="athena-worksheet-Cell-5:6"] > div:nth-child(2)'); // Cell locator for Total value in Loss summary sheet
     
    }

    async validateGrpImportedValues(GroupCalculation, EntityName, expEntityValue, expTotalValue) {
        // Navigate to Calculations screen
        await this.calculationsButton.click();
        await this.page.waitForTimeout(1000);

        // Click the Calculations link to open the list view
        await this.frame.getByText('Calculations').nth(1).click();
        await this.page.waitForTimeout(2000);

        // Open the calculation
        await this.frame.getByRole('gridcell', { name: GroupCalculation }).click();
        await this.page.waitForTimeout(5000);

        // Navigate to Losses summary
        await this.lossSummaryLink.click();
        await this.page.waitForTimeout(5000);

        // Dynamically find the entity column by searching for the entity name in the grid
        const entityHeaderCell = this.frame.locator(`[role="gridcell"]:has-text("${EntityName}")`).first();
        await entityHeaderCell.waitFor({ state: 'visible', timeout: 10000 });

        // Get the cell ID to extract column number (format: athena-worksheet-Cell-{row}:{column})
        const cellId = await entityHeaderCell.getAttribute('id');
        const columnNumber = cellId.split(':')[1]; // Extract column number from ID

        console.log(`Found entity "${EntityName}" in column ${columnNumber}`);

        // Construct locator for the value cell in row 5 with the same column number
        const entityValueCell = this.frame.locator(`[id="athena-worksheet-Cell-5:${columnNumber}"] > div:nth-child(3)`);

        // Click the refresh icon to trigger data update
        try {
            const dataUpdateButton = this.frame.locator('.UpdatesAvailable').first();
            await dataUpdateButton.waitFor({ state: 'visible', timeout: 3000 });
            await dataUpdateButton.click({ timeout: 2000 });
            console.log("Data update notification clicked, waiting for data to refresh...");
            await this.page.waitForTimeout(8000); // Wait for data to refresh
        } catch (error) {
            // No data update notification, continue
            console.log("No data update notification found");
        }

        
        // Validate Entity value
        const entityValue = await entityValueCell.textContent();
        console.log(`${EntityName} value in Group Calculation after import: ${entityValue.trim()}`);
        expect(entityValue.trim()).toBe(expEntityValue);
        /*
        // Dynamically find the Total column header in row 1 (header row)
        // Row 1 contains the entity names and Total header
        const totalHeaderCell = this.frame.locator(`[id^="athena-worksheet-Cell-1:"]:has-text("Total")`).first();
        await totalHeaderCell.waitFor({ state: 'visible', timeout: 10000 });

        // Get the Total column number
        const totalCellId = await totalHeaderCell.getAttribute('id');
        const totalColumnNumber = totalCellId.split(':')[1];

        console.log(`Found Total column at column ${totalColumnNumber}`);

        // Construct locator for the Total value cell in row 5
        const totalValueCell = this.frame.locator(`[id="athena-worksheet-Cell-5:${totalColumnNumber}"] > div:nth-child(3)`);

        // Validate Total value
        const totalValue = await totalValueCell.textContent();
        console.log(`Total value in Group Calculation after import: ${totalValue.trim()}`);
        expect(totalValue.trim()).toBe(expTotalValue);

        console.log("✓ Import validation successful for Group calculation - All values match expected results");
    */
        }


    }

export { ValidateGrpImportedValues };