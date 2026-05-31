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

        // Open the calculation — use exact match so we don't accidentally
        // re-click the previously opened calculation's header banner (which
        // also contains the calc name). The Wijmo grid's `role="row"` element
        // is reported as hidden by Playwright's visibility heuristics, so we
        // target the gridcell directly (it renders normally).
        const escapedName = calculationName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const targetCell = this.frame
            .getByRole('gridcell', { name: calculationName, exact: true })
            .first();
        await targetCell.waitFor({ state: 'visible', timeout: 20000 });
        await targetCell.dblclick();

        // Verify the worksheet header (breadcrumb) reflects the requested
        // calculation before continuing. Use ` : ` suffix to disambiguate from
        // the sidebar calc-item links (which are hidden but match the name).
        const calcHeader = this.frame
            .getByText(new RegExp(`${escapedName}[\\s\\S]*:`))
            .first();
        await calcHeader.waitFor({ state: 'visible', timeout: 30000 });
        await this.page.waitForTimeout(5000);

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

    // Click Refresh button (if confirmation dialog appears) to ensure latest data is loaded.
    // Use getByRole to avoid strict-mode ambiguity with the dialog message text.
    const refreshBtn = this.frame.getByRole('button', { name: 'Refresh', exact: true });
    if (await refreshBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await refreshBtn.click();
        await this.page.waitForTimeout(5000); // Wait for refresh to complete and data to load
    }

     // Locate Turnover/Cost of sales by their label text rather than by a
     // positional cell id (athena-worksheet-Cell-6:2). Row indices shift
     // when virtualized rows haven't fully rendered after an import refresh.
     const turnoverLabel = this.frame
         .locator('div.athena-worksheet-cell-inner-default')
         .filter({ hasText: /^Turnover$/i })
         .first();
     const costOfSalesLabel = this.frame
         .locator('div.athena-worksheet-cell-inner-default')
         .filter({ hasText: /^Cost of sales$/i })
         .first();

     // Helper: force the virtualised worksheet to repaint rows starting at row 1.
     // Wijmo only re-virtualises on real scroll events, so we wheel down a bit
     // then back to the top — this guarantees rows 1-10 get re-painted even if
     // the scroller was already at top but Wijmo skipped rendering some rows.
     const scrollWorksheetToTop = async () => {
         const grid = this.frame.locator('[role="grid"]').first();
         await grid.waitFor({ state: 'visible', timeout: 10000 });
         const box = await grid.boundingBox();
         if (box) {
             const cx = box.x + box.width / 2;
             const cy = box.y + box.height / 2;
             await this.page.mouse.move(cx, cy);
             // Wheel down to force re-virtualisation, then back to the top.
             await this.page.mouse.wheel(0, 600);
             await this.page.waitForTimeout(400);
             await this.page.mouse.wheel(0, -2000);
             await this.page.waitForTimeout(400);
         }
         // Final keyboard nudge to ensure caret + viewport are at A1.
         await grid.locator('[role="gridcell"]').first().click({ timeout: 3000 }).catch(() => {});
         await this.page.keyboard.press('Control+Home');
         await this.page.waitForTimeout(800);
     };

     await scrollWorksheetToTop();
     let turnoverVisible = await turnoverLabel
         .waitFor({ state: 'visible', timeout: 10000 })
         .then(() => true)
         .catch(() => false);

     // If still missing, do one more wheel scroll-up burst — Wijmo sometimes
     // needs a second nudge after a data refresh.
     if (!turnoverVisible) {
         console.log('Turnover row missing after first scroll — wheel-scrolling again.');
         await scrollWorksheetToTop();
         turnoverVisible = await turnoverLabel
             .waitFor({ state: 'visible', timeout: 10000 })
             .then(() => true)
             .catch(() => false);
     }

     if (!turnoverVisible) {
         throw new Error('Turnover row never rendered on Income statement after scrolling to top.');
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
