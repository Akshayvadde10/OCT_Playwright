class EntFilter{

    constructor(page){
        this.page=page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.nameHeaderButton=this.frame.locator("//div[@id='athena-grid-cell-1-0:0']/button"); // Locator for Name header button in grid
        this.filterInput=this.frame.locator('.wj-form-control'); // Locator for filter input
    }
    async filterEntity(Tsid){
        await this.nameHeaderButton.click();// Click Name header to sort
        await this.filterInput.fill(Tsid);// Filter the grid by the unique entity name
        await this.page.waitForTimeout(2000);
        await this.frame.getByText('Apply').click();
         
    }
}
export { EntFilter };