

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

        // Group calculations may show a "pending updates" confirmation modal.
        // Click NO so the calculation opens (we'll trigger refresh from inside).
        try {
            const pendingUpdatesNo = this.frame.getByRole('button', { name: 'NO', exact: true });
            await pendingUpdatesNo.waitFor({ state: 'visible', timeout: 5000 });
            await pendingUpdatesNo.click({ timeout: 2000 });
            console.log('Pending updates popup detected — clicked NO to proceed.');
            await this.page.waitForTimeout(8000);
        } catch {
            // No popup — group calc opened directly
        }

        // Wait for the Losses summary link to be ready (calc may still be loading)
        await this.lossSummaryLink.waitFor({ state: 'visible', timeout: 30000 });

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

        // Click the "N Data updates available" indicator → opens Refresh dialog → click Refresh.
        // After Refresh, the app reloads the grid (sometimes twice). Use a web-first
        // assertion below that auto-retries until the cell shows the expected value.
        try {
            const dataUpdateButton = this.frame.locator('.UpdatesAvailable').first();
            await dataUpdateButton.waitFor({ state: 'visible', timeout: 3000 });
            await dataUpdateButton.click({ timeout: 2000 });
            console.log('Data updates indicator clicked — opening refresh dialog...');

            const refreshBtn = this.frame.getByRole('button', { name: 'Refresh', exact: true });
            await refreshBtn.waitFor({ state: 'visible', timeout: 5000 });
            await refreshBtn.click({ timeout: 2000 });
            console.log('Clicked Refresh — waiting for grid to reload with updated values...');

            // Wait for the data-update indicator to disappear (means refresh applied)
            await dataUpdateButton.waitFor({ state: 'hidden', timeout: 180000 }).catch(() => {});
        } catch {
            console.log('No data update notification found — values may already be current.');
        }

        // Re-locate the entity column AFTER refresh — column order may have changed.
        // Use expect.poll to keep re-reading until the value updates or times out.
        await expect.poll(async () => {
            const headerCell = this.frame.locator(`[role="gridcell"]:has-text("${EntityName}")`).first();
            if (!(await headerCell.isVisible().catch(() => false))) return null;
            const id = await headerCell.getAttribute('id');
            const col = id?.split(':')[1];
            if (!col) return null;
            const cell = this.frame.locator(`[id="athena-worksheet-Cell-5:${col}"] > div:nth-child(3)`);
            return ((await cell.textContent().catch(() => '')) || '').trim();
        }, { timeout: 60000, intervals: [1000, 2000, 3000] }).toBe(expEntityValue);

        // Final read for logging
        const finalHeader = this.frame.locator(`[role="gridcell"]:has-text("${EntityName}")`).first();
        const finalCol = (await finalHeader.getAttribute('id')).split(':')[1];
        const entityValue = await this.frame.locator(`[id="athena-worksheet-Cell-5:${finalCol}"] > div:nth-child(3)`).textContent();
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