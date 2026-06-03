import { expect } from '@playwright/test';

class EntityGrouping {
    constructor(page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]'); // Locator for the iframe containing the grid
        this.refreshButton = this.frame.getByRole('button', { name: 'Refresh' }); // Locator for Refresh button
        this.checkboxSelector = this.frame.locator('[id="athena-grid-row-header-1:1:1"]').getByLabel('', { exact: true }); // Locator for the checkbox of the first entity in the grid
        this.searchInput = this.frame.getByRole('textbox', { name: 'Search' }); // Locator for the filter input in the grid header
        this.addToGroupButton = this.frame.getByRole('menuitem', { name: 'ADD TO GROUP' }); // Locator for Add to Group button
    }
        async entityGrouping(GrpEntityName, Tsid) {
            await this.refreshButton.click(); // Click the Refresh button to ensure the grid is up to date
            await this.page.waitForTimeout(2000);

            await this.checkboxSelector.check(); // Select the checkbox for the first entity in the grid

            // Verify the checkbox is actually checked; if not, click again until it is.
            if (!(await this.checkboxSelector.isChecked())) {
                await this.checkboxSelector.check({ force: true });
            }
            await expect(this.checkboxSelector).toBeChecked({ timeout: 10000 });

            await this.searchInput.fill(Tsid); // Type the unique entity name in the filter input to filter the grid
            await this.page.waitForTimeout(2000);
            await this.addToGroupButton.click(); // Click the Add to Group button to add the entity to a group
        }
    }

    export { EntityGrouping };