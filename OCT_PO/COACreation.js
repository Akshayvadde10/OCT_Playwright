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

  async createCOA(COAName) {
    await this.addButton.click(); // Click Add button to create new COA
    await this.page.waitForTimeout(2000);
    await this.COANameInput.fill(COAName); // Fill in the COA name
    console.log("COA created successfully with name:" + COAName);
    await this.page.waitForTimeout(2000);
     const COAyear = await this.taxYearInput.inputValue(); // Get the default value of the tax year input
     console.log(COAyear);
   /* if (COAyear !== taxYear) {
       await this.taxYearInput.pressSequentially(taxYear); // Update the tax year if it doesn't match the expected value
       await this.frame.getByText(taxYear).click(); // Select the tax year from the dropdown
      }
*/
    await this.okButton.click();
    await this.filterCOAheader.click(); // Click the actions button for the created COA to open the dropdown
    await this.page.waitForTimeout(2000);
    await this.filterCOAname.pressSequentially(COAName);
    await this.page.waitForTimeout(2000);
    await this.applyButton.click();
    await this.page.waitForTimeout(2000);
    await this.frame.locator(`a:has-text("${COAName}")`).click(); // Click the created COA to open details page
    await this.page.waitForTimeout(2000);
    await this.fileInput.setInputFiles("C:/Playwright_self/playwright-OCT-Automation2/Test Data/BVT_UK_ImportCoA.xlsx");
    await this.frame.getByText("Save").click();
    await this.page.waitForTimeout(2000);
  }
}
export { COACreation };
