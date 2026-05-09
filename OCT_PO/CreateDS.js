import { expect } from "@playwright/test" ;
class CreateDS
{
    constructor(page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]'); // Locator for the iframe containing the create dataflow form
        this.addButton = this.frame.locator('#addDataSet, button:has-text("Add")'); // Locator for Add button to start creating new dataflow
        this.DatasetNameInput = this.frame.locator("input").first();
        this.startDateInput = this.frame.getByRole('textbox', { name: 'm/d/yyyy' }).first();
        this.endDateInput = this.frame.getByRole('textbox', { name: 'm/d/yyyy' }).nth(1);
        this.nextButton = this.frame.getByText("Next");
        this.entityFilterInput = this.frame.locator("//input[@placeholder='Type to filter the entities']");
        this.finishButton = this.frame.getByText("Finish");

    }
    async createDataset(DatasetName, GrpEntityName = null, Entities = null)
    {

    await this.addButton.click();
    await this.page.waitForTimeout(5000);
    await this.DatasetNameInput.fill(DatasetName);
    const currentYear = new Date().getFullYear();
    await this.startDateInput.fill(`7/1/${currentYear - 1}`);
    await this.endDateInput.fill(`6/30/${currentYear}`);

    await this.nextButton.click();
    await this.page.waitForTimeout(5000);// wait until all entities load in the list

    // Use Group Entity if provided, otherwise use first entity from Entities array
    const entityToSelect = GrpEntityName || (Entities && Entities.length > 0 ? Entities[0] : null);

    if (!entityToSelect) {
        throw new Error("Either GrpEntityName or Entities array must be provided");
    }

    await this.entityFilterInput.pressSequentially(entityToSelect);
    await this.page.waitForTimeout(2000);
    //await this.frame.locator(`text=${entityToSelect}`).locator("..").locator(".entity-checkbox").click();
    await this.frame.getByRole('treeitem', { name: entityToSelect }).getByRole('checkbox').click();

    await this.nextButton.click();

    await this.finishButton.click();

    // Wait for dataset creation to complete
    await this.page.waitForTimeout(10000);

    // Switch to All Calculations view
    await this.frame.locator("#returns_more").click();
    await this.frame.locator("//div[contains(text(),' All Calculations ')]").first().click();

    // Verify Dataset creation notification with retry
    const result = await this.verifyDatasetCreationNotification(DatasetName);
    console.log(`Dataset Status: ${result.status}`);

    // Find and click the dataset column header button to open filter
    const headerButton = this.frame.locator("//div[@class='wj-cell wj-header wj-filter-off']//button//span").first();
    await headerButton.waitFor({ state: "visible", timeout: 10000 });
    await headerButton.click();
    await this.page.waitForTimeout(2000);
    // Type dataset name in the filter input
    await this.frame.locator(".wj-form-control").pressSequentially(DatasetName);
    await this.page.waitForTimeout(3000);
    await this.frame.getByText("Apply").click();
    await this.page.waitForTimeout(5000);
    // Verify filtered dataset appears
    const datasetEntry = this.frame.locator("//div[@id='athena-grid-cell-82-2:1']");
    console.log("Dataset created successfully with name:" + DatasetName);
    await expect(datasetEntry).toHaveText(DatasetName);

// Get all calculation names for the dataset
    await this.page.waitForTimeout(2000);

   

    let calculations = [];

    // Get group calculation if GrpEntityName is provided
    if (GrpEntityName) {
        const grpCalcCell = this.frame.locator('div.wj-row').filter({ hasText: GrpEntityName })
            .locator('div.wj-cell[role="gridcell"]').nth(3);
        const grpCalculationName = await grpCalcCell.textContent();
        calculations.push(grpCalculationName.trim());
        console.log(`Group Calculation: ${grpCalculationName.trim()}`);
    }

    // Get individual entity calculations if Entities array is provided
    if (Entities && Entities.length > 0) {
        for (let i = 0; i < Entities.length; i++) {
            const calcCell = this.frame.locator('div.wj-row').filter({ hasText: Entities[i] })
                .locator('div.wj-cell[role="gridcell"]').nth(3);
            const CalculationName = await calcCell.textContent();
            calculations.push(CalculationName.trim());
            console.log(`Entity Calculation ${i + 1}: ${CalculationName.trim()}`);
        }
    }


        // Show Tax Year column if hidden, then scroll right and read it from the dataset row.
    const showHideColumnsButton = this.frame.locator("//button[@ng-reflect-ngb-tooltip='Show/Hide Columns']");
    const taxYearColumnToggle = this.frame.locator("//label[contains(., 'Tax Year')]/bento-checkbox/input[@type='checkbox']");
    const headerRow = this.frame.locator('[role="treegrid"] [role="row"]').first();
    const taxYearHeader = headerRow.getByText('Tax Year', { exact: true }).first();
    const gridContainer = this.frame.locator('.wj-cells').first();
    const datasetRow = this.frame.locator('div.wj-row').filter({ hasText: DatasetName }).nth(1);

    const hasVisibleTaxYearHeader = await taxYearHeader.isVisible().catch(() => false);
    if (!hasVisibleTaxYearHeader) {
        await showHideColumnsButton.click();
        const isTaxYearChecked = await taxYearColumnToggle.isChecked().catch(() => false);
        if (!isTaxYearChecked) {
            await taxYearColumnToggle.click();
        }
        await showHideColumnsButton.click();
        await this.page.waitForTimeout(2000);
    }

    await gridContainer.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
    });
    await this.page.waitForTimeout(500);

    const visibleHeaders = await headerRow.locator('[role="columnheader"]').allTextContents();
    const taxYearColumnIndex = visibleHeaders.findIndex((text) => text.replace(/\s+/g, ' ').trim() === 'Tax Year');

    let taxYear = null;
    if (taxYearColumnIndex >= 0) {
        taxYear = await datasetRow.locator('div.wj-cell[role="gridcell"]').nth(taxYearColumnIndex).textContent();
    }

    if (!taxYear || !taxYear.trim()) {
        const firstCalculation = calculations[0] || '';
        const taxYearMatch = firstCalculation.match(/\/(\d{4})$/);
        taxYear = taxYearMatch ? taxYearMatch[1] : `${currentYear}`;
    }

    console.log("Tax Year for the dataset: " + taxYear);

    return { calculations, taxYear };
}

async verifyDatasetCreationNotification(DatasetName, maxRetries = 15) {
    // Check notification status and retry with refresh if still creating
    const toolbar = this.frame.getByRole('toolbar').first();
    const moreButton = toolbar.getByRole('button', { name: 'More', exact: true });
    const refreshMenuItem = this.frame.locator('#refreshCMSGrid').first();
    
    for (let i = 0; i < maxRetries; i++) {
        // Wait 5 seconds before checking (except first attempt)
        if (i > 0) {
            console.log('Waiting 5 seconds...');
            await this.page.waitForTimeout(5000);
        }
        
        // Read notification text without blocking when it is temporarily not present.
        const notificationTexts = await this.frame
            .locator("//div[contains(text(), 'Creating Dataset')]")
            .allTextContents();
        const notificationText = notificationTexts
            .map(text => text.replace(/\s+/g, ' ').trim())
            .find(text => text.includes(DatasetName)) || '';
        console.log(`Attempt ${i + 1}: ${notificationText}`);

        // No active notification for this dataset; stop refreshing.
        if (!notificationText) {
            console.log('No active creation notification found for this dataset. Stopping refresh loop.');
            return { status: 'Completed', message: 'No active creation notification for dataset' };
        }

        // Check if creation is complete
        if (notificationText.includes('Success')) {
            console.log('✓ Dataset created successfully');
            return { status: 'Success', message: notificationText };
        } else if (notificationText.includes('Failed') || notificationText.includes('failure')) {
            console.log('✗ Dataset creation failed');
            return { status: 'Failed', message: notificationText };
        }

        // Fallback: if notification vanished, confirm by checking dataset row visibility.
        const datasetRow = this.frame.locator('div.wj-row').filter({ hasText: DatasetName }).first();
        if (await datasetRow.isVisible()) {
            console.log('✓ Dataset row is visible; treating creation as successful');
            return { status: 'Success', message: 'Dataset row found in grid' };
        }

        // If still creating, click Refresh button
        if (i < maxRetries - 1) {
            console.log('Still creating... Clicking Refresh');
            await moreButton.waitFor({ state: 'visible', timeout: 10000 });
            await expect(moreButton).toBeEnabled({ timeout: 15000 });
            if (!(await refreshMenuItem.isVisible())) {
                await moreButton.click();
            }
            try {
                await refreshMenuItem.waitFor({ state: 'visible', timeout: 5000 });
            } catch {
                // Menu can close during loading; re-open once and retry.
                await moreButton.click();
                await refreshMenuItem.waitFor({ state: 'visible', timeout: 10000 });
            }
            await expect(refreshMenuItem).toBeEnabled({ timeout: 10000 });
            await refreshMenuItem.click();
            await this.page.waitForTimeout(2000);
        }
    }

    return { status: 'In Progress', message: 'Max retries reached' };
}
}
export { CreateDS };