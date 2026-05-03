class EntToGroup{
    constructor(page){
        this.page=page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.checkboxSelector = this.frame.locator('[id="athena-grid-row-header-1:1:1"]').getByLabel('', { exact: true }); // Locator for the checkbox of the first entity in the grid
        this.addToGroupButton = this.frame.getByRole('menuitem', { name: 'ADD TO GROUP' }); // Locator for Add to Group button
   
}
async addEntityToGroup(GrpEntityName,entityName){

    // Only check if not already checked to avoid state change errors
    const isChecked = await this.checkboxSelector.isChecked();
    if (!isChecked) {
        await this.checkboxSelector.setChecked(true);
    }
    await this.page.waitForTimeout(2000);
    await this.addToGroupButton.click(); // Click the Add to Group button to add the entity to a group
    await this.page.waitForTimeout(2000);
    //console.log("Entity: " + entityName + " added to group successfully");
}
}
export { EntToGroup };