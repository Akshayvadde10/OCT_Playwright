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

        // Close any leftover side panel (e.g. Drilldown comparable picker) from a
        // previous iteration. If it remains open, the worksheet layout shifts and
        // virtualized cells like athena-worksheet-Cell-6:2 may not render.
        try {
            const sidePanelClose = this.frame.getByRole('button', { name: '×' }).last();
            if (await sidePanelClose.isVisible({ timeout: 1000 }).catch(() => false)) {
                await sidePanelClose.click({ timeout: 2000 });
                console.log("Closed leftover side panel from previous iteration.");
                await this.page.waitForTimeout(1000);
            }
        } catch {
            // No side panel open — proceed
        }


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


    await this.page.waitForTimeout(3000); // Additional wait to ensure data is loaded after refresh

     // Keep validation deterministic: bring worksheet back to top before reading fixed cell ids.
     const anyWorksheetCell = this.frame.locator('[id^="athena-worksheet-Cell-"]').first();
     await anyWorksheetCell.click();
     await this.page.keyboard.press('Control+Home');
     await this.page.waitForTimeout(800);

     // Locate Turnover/Cost of sales by their label text rather than by a
     // positional cell id (athena-worksheet-Cell-6:2). Row indices shift
     // when virtualized rows haven't fully rendered after an import refresh
     // (rows 6-8 can be missing for several seconds while the worksheet
     // finishes painting). The text-anchored locator survives that.
     const turnoverLabel = this.frame
         .locator('div.athena-worksheet-cell-inner-default')
         .filter({ hasText: /^Turnover$/i })
         .first();
     const costOfSalesLabel = this.frame
         .locator('div.athena-worksheet-cell-inner-default')
         .filter({ hasText: /^Cost of sales$/i })
         .first();

     // Wait up to 30s for Turnover row to render; if still missing, re-trigger
     // the data-update notification once and wait again.
     let turnoverVisible = await turnoverLabel
         .waitFor({ state: 'visible', timeout: 30000 })
         .then(() => true)
         .catch(() => false);

     if (!turnoverVisible) {
         console.log('Turnover row not rendered yet — re-clicking data update notification...');
         await this.frame.locator('.UpdatesAvailable').first().click({ timeout: 2000 }).catch(() => {});
         await this.page.waitForTimeout(8000);
         turnoverVisible = await turnoverLabel
             .waitFor({ state: 'visible', timeout: 15000 })
             .then(() => true)
             .catch(() => false);
     }

     if (!turnoverVisible) {
         // Last-resort recovery: the worksheet painted before the imported
         // rows arrived from the server (Gross profit is shown but the
         // Turnover/Cost-of-sales rows are missing entirely). Re-navigate
         // to the Income statement sheet to force a clean re-render.
         console.log('Turnover row still missing — re-navigating to Income statement to force re-render...');
         const incomeStatementTreeItem = this.frame
             .getByRole('treeitem', { name: /Income statement/i })
             .first();
         await incomeStatementTreeItem.click({ timeout: 5000 }).catch(() => {});
         await this.page.waitForTimeout(5000);
         await this.frame.locator('.UpdatesAvailable').first()
             .click({ timeout: 2000 })
             .catch(() => {});
         await this.page.waitForTimeout(8000);
         turnoverVisible = await turnoverLabel
             .waitFor({ state: 'visible', timeout: 20000 })
             .then(() => true)
             .catch(() => false);
     }

     if (!turnoverVisible) {
         throw new Error('Turnover row never rendered on Income statement after data refresh.');
     }

     // Turnover and Cost of sales sit within the top 20 rows of the Income
     // statement — no scrolling required. Just wait for the Cost of sales
     // label to be visible in the already-rendered viewport.
     await costOfSalesLabel.waitFor({ state: 'visible', timeout: 10000 });

     // Amount cell is the gridcell sibling immediately after the label's gridcell.
     const turnoverAmountCell = turnoverLabel.locator(
         'xpath=ancestor::div[@role="gridcell"][1]/following-sibling::div[@role="gridcell"][1]'
     );
     const costOfSalesAmountCell = costOfSalesLabel.locator(
         'xpath=ancestor::div[@role="gridcell"][1]/following-sibling::div[@role="gridcell"][1]'
     );

        // Validate Turnover value
        const turnoverRaw = ((await turnoverAmountCell.textContent()) || '').replace(/\u00a0/g, ' ').trim();
        const turnoverMatches = [...turnoverRaw.matchAll(/\(?-?\d[\d,]*(?:\.\d+)?\)?/g)];
        const turnover = turnoverMatches.length > 0 ? turnoverMatches[turnoverMatches.length - 1][0] : turnoverRaw;
        console.log("Turnover value in Calculation after import: " + turnover);
        expect(turnover).toBe(expTurnoverValue);

        // Validate Cost of Sales value
        const costRaw = ((await costOfSalesAmountCell.textContent()) || '').replace(/\u00a0/g, ' ').trim();
        const costMatches = [...costRaw.matchAll(/\(?-?\d[\d,]*(?:\.\d+)?\)?/g)];
        const costOfSales = costMatches.length > 0 ? costMatches[costMatches.length - 1][0] : costRaw;
        console.log("Cost of Sales value in Calculation after import: " + costOfSales);
        expect(costOfSales).toBe(expCostOfSalesValue);

        console.log("✓ Import validation successful - All values match expected results");
    }

    /*async validateMultipleEntitiesImport(entityCalculations) {
        /**
         * Validates imported values for multiple entities
         * @param {Array} entityCalculations - Array of objects with structure:
         * [
         *   { calculationName: 'Name', turnover: '58,032', costOfSales: '(962,653)' },
         *   { calculationName: 'Name2', turnover: '...' }
         * ]
         
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
    }*/
}

export { ValidateImportedValues };
