import { expect } from "@playwright/test" ;
class CreateDS
{
    constructor(page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]'); // Locator for the iframe containing the create dataflow form
        this.addButton = this.frame.locator('#addDataSet, button:has-text("Add")'); // Locator for Add button to start creating new dataflow
        this.DatasetNameInput = this.frame.locator("input").first();
        this.nextButton = this.frame.getByText("Next");
        this.entityFilterInput = this.frame.locator("//input[@placeholder='Type to filter the entities']");
        this.finishButton = this.frame.getByText("Finish");

    }
    async createDataset(DatasetName, GrpEntityName = null, Entities = null)
    {

    await this.addButton.click();
    await this.page.waitForTimeout(5000);
    await this.DatasetNameInput.fill(DatasetName);
    await this.nextButton.click();
    await this.page.waitForTimeout(2000);// wait until all entities load in the list

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
    await this.frame.locator("//i[@class='bento-combobox-dropdown-button-icon bento-icon-caret-down-filled']").click();
    await this.frame.locator("//div[contains(text(),' All Calculations ')]").first().click();

    // Wait for grid to fully load after filter change
    await this.page.waitForTimeout(30000);
    await this.page.waitForTimeout(30000);

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

   /* await this.frame.getByRole('toolbar').getByRole('button', { name: 'More' }).click();
    await this.frame.locator("#refreshCMSGrid").click(); // Refresh grid to ensure all calculations are visible
    await this.page.waitForTimeout(5000);*/

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

    return calculations;
}
}
export { CreateDS };