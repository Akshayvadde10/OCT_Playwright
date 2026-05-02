import { expect } from '@playwright/test';

class ValidateImportedValues {
    constructor(page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.calculationsButton = this.frame.getByRole('button', { name: 'Calculations' });
        this.calculationsLink = this.frame.getByRole('link', { name: 'Calculations' });
        this.comprehensiveIncomeTreeItem = this.frame.getByRole('treeitem', {
            name: 'expand <span class="nav-ref "></span><span class="nav-description">Comprehensive income analysis</span> Comprehensive income analysis',
            exact: true
        });
        this.incomeStatementLink = this.frame.getByText('Income statement', { exact: true });
        this.turnoverCell = this.frame.locator('[id="athena-worksheet-Cell-6:2"] > div:nth-child(4)');
        this.costOfSalesCell = this.frame.locator("//div[@id='athena-worksheet-Cell-7:2']/div/span");
    }

    async validateImportedValues(calculationName, expTurnoverValue, expCostOfSalesValue) {
        // Navigate to Calculations screen
        await this.calculationsButton.click();
        await this.calculationsLink.click();
        await this.page.waitForTimeout(2000);

        // Open the calculation
        await this.frame.getByRole('gridcell', { name: calculationName }).click();
        await this.page.waitForTimeout(10000);


        // Expand Comprehensive income analysis section if collapsed
        try {
            // Wait for the section to be present
            const comprehensiveIncomeSection = this.frame.getByText('Comprehensive income analysis', { exact: true });
            await comprehensiveIncomeSection.waitFor({ state: 'visible', timeout: 10000 });

            // Check if section is collapsed and needs expansion
            const expandButton = this.frame.locator('[role="treeitem"]:has-text("Comprehensive income analysis")').getByRole('button', { name: 'expand' });

            if (await expandButton.count() > 0) {
                console.log("Expanding Comprehensive income analysis section...");
                await expandButton.click();
                await this.page.waitForTimeout(1000); // Wait for expansion animation
            }
        } catch (error) {
            console.log("Comprehensive income analysis section already expanded or not found");
        }

        // Wait for Income statement link to be visible and click it
        await this.incomeStatementLink.waitFor({ state: 'visible', timeout: 15000 });
        await this.incomeStatementLink.click();
        await this.page.waitForTimeout(5000);

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


       

        // Validate Turnover value
        const turnover = await this.turnoverCell.textContent();
        console.log("Turnover value in Calculation after import: " + turnover.trim());
        expect(turnover.trim()).toBe(expTurnoverValue);

        // Validate Cost of Sales value
        const costOfSales = await this.costOfSalesCell.textContent();
        console.log("Cost of Sales value in Calculation after import: " + costOfSales.trim());
        expect(costOfSales.trim()).toBe(expCostOfSalesValue);

        console.log("✓ Import validation successful - All values match expected results");
    }

    async validateMultipleEntitiesImport(entityCalculations) {
        /**
         * Validates imported values for multiple entities
         * @param {Array} entityCalculations - Array of objects with structure:
         * [
         *   { calculationName: 'Name', turnover: '58,032', costOfSales: '(962,653)' },
         *   { calculationName: 'Name2', turnover: '...' }
         * ]
         */
        for (const entity of entityCalculations) {
            console.log(`\nValidating calculation: ${entity.calculationName}`);
            await this.validateImportedValues(
                entity.calculationName,
                entity.turnover,
                entity.costOfSales
            );

            // Navigate back to calculations list
            await this.calculationsButton.click();
            await this.calculationsLink.click();
            await this.page.waitForTimeout(1000);
        }
    }
}

export { ValidateImportedValues };
