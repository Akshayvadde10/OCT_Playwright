class COACreation {
  constructor(page) {
    this.page = page;
    this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
    this.addButton = this.frame.locator("//i[@class='bento-icon-add']");
    this.COANameInput = this.frame.locator(".col-sm-6");
     this.taxYearInput = this.frame.getByRole("textbox", {name: "Select here"});
; // Locator for tax year input in COA creation form
    this.okButton = this.frame.getByRole("button", { name: " Ok " });
    this.filterCOAheader = this.frame.locator(
      "//div[@id='athena-grid-cell-[object Object]-0:1']/button/span",
    );
    this.filterCOAname = this.frame.locator(".wj-form-control");
    this.applyButton = this.frame.getByText("Apply");
    // this.createdCOALink = this.frame.locator(`a:has-text("${COAName}")`); // Locator for the created COA in the grid, used to click and open details page
    this.fileInput = this.frame.locator("//input[@type='file']"); // Locator for file input in COA details page to upload chart of accounts template
  }

  async createCOA(COAName,taxYear) {
    await this.addButton.click(); // Click Add button to create new COA
    await this.page.waitForTimeout(2000);
    await this.COANameInput.fill(COAName); // Fill in the COA name
    await this.page.waitForTimeout(2000);
     const COAyear = (await this.taxYearInput.inputValue()).trim(); // Get the default value of the tax year input
     const expectedTaxYear = `${taxYear ?? ''}`.trim();
     console.log(COAyear);
    if (expectedTaxYear && COAyear !== expectedTaxYear) {
      await this.taxYearInput.click(); // Click to open the tax year dropdown
       await this.page.waitForTimeout(2000);
       await this.taxYearInput.pressSequentially(expectedTaxYear); // Update the tax year if it doesn't match the expected value
       await this.frame.getByRole('option', { name: expectedTaxYear }).click(); // Select the tax year from the dropdown
      }

    await this.okButton.click();
     console.log("COA created successfully with name:" + COAName);
    await this.filterCOAheader.click(); // Click the actions button for the created COA to open the dropdown
    await this.page.waitForTimeout(2000);
    await this.filterCOAname.pressSequentially(COAName);
    await this.page.waitForTimeout(2000);
    await this.applyButton.click();
    await this.page.waitForTimeout(2000);
    await this.frame.locator(`a:has-text("${COAName}")`).click(); // Click the created COA to open details page
    await this.page.waitForTimeout(2000);
    await this.fileInput.setInputFiles("C:\\Playwright_self\\playwright-OCT-Automation2\\Test Data\\Regression\\4689052\\UK_ImportCoA.xlsx");
    await this.frame.getByText("Save").click();
    await this.page.waitForTimeout(2000);
  }
}
export { COACreation };
