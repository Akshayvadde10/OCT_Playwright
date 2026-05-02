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
    async createDataset(DatasetName,UniqueEntityName)
    {
    
    await this.addButton.click();
    await this.page.waitForTimeout(5000);
    await this.DatasetNameInput.fill(DatasetName);
    await this.nextButton.click();
    await this.page.waitForTimeout(2000);// wait until all entities load in the list
    await this.entityFilterInput.pressSequentially(UniqueEntityName);
    await this.page.waitForTimeout(2000);
    //await this.frame.locator(`text=${UniqueEntityName}`).locator("..").locator(".entity-checkbox").click();
    await this.frame.getByRole('treeitem', { name: UniqueEntityName }).getByRole('checkbox').click();

    await this.nextButton.click();

    await this.finishButton.click();

    // Wait for dataset creation to complete
    await this.page.waitForTimeout(1000);

    // Switch to All Calculations view
    await this.frame.locator("//i[@class='bento-combobox-dropdown-button-icon bento-icon-caret-down-filled']").click();
    await this.frame.locator("//div[contains(text(),' All Calculations ')]").first().click();

    // Wait for grid to fully load after filter change
    await this.page.waitForTimeout(2000);

    // Find and click the dataset column header button to open filter
    const headerButton = this.frame.locator("//div[@class='wj-cell wj-header wj-filter-off']//button//span").first();
    await headerButton.waitFor({ state: "visible", timeout: 10000 });
    await headerButton.click();
    await this.page.waitForTimeout(2000);
    // Type dataset name in the filter input
    await this.frame.locator(".wj-form-control").pressSequentially(DatasetName);
    await this.frame.getByText("Apply").click();
    await this.page.waitForTimeout(2000);
    // Verify filtered dataset appears
    const datasetEntry = this.frame.locator("//div[@id='athena-grid-cell-82-2:1']");
    console.log("Dataset created successfully with name:" + DatasetName);
    await expect(datasetEntry).toHaveText(DatasetName);

// Locate by the row that contains the entity name and get the calculation name from gridcell
const calculationCell = this.frame.locator('div.wj-row').filter({ hasText: UniqueEntityName })
    .locator('div.wj-cell[role="gridcell"]').nth(3); // 4th cell is Calculation Name column

await calculationCell.waitFor({ state: 'visible', timeout: 2000 });
const CalculationName = await calculationCell.textContent();
console.log("Calculation created successfully with name:" + CalculationName);

    await this.frame.locator("//button[@ng-reflect-ngb-tooltip='Show/Hide Columns']").click();

  /*  await this.frame.locator("//label[contains(., 'Tax Year')]/bento-checkbox/input[@type='checkbox']").click();
    await this.frame.locator("//button[@ng-reflect-ngb-tooltip='Show/Hide Columns']").click();// Wait for grid to refresh with Tax Year column


      await this.frame.locator("//div[@id='athena-grid-cell-82-2:10']").scrollIntoViewIfNeeded();// Scroll into view before interacting
    let taxYear = await this.frame.locator("//div[@id='athena-grid-cell-82-2:10']").textContent();
    console.log("Tax Year for the dataset: " + taxYear);*/
    return { CalculationName };
}
}
export { CreateDS };