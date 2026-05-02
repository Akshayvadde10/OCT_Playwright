class InsertSheet{
    constructor(page){
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.calculationsButton = this.frame.getByRole('button', { name: 'Calculations' });
        this.calculationsLink = this.frame.getByRole('link', { name: 'Calculations' });
        this.insertbutton = this.frame.locator('button').filter({ hasText: /^Insert$/ });
        this.insertSheetdropdown = this.frame.getByRole('button', { name: 'Insert Sheet' });
        this.searchbox = this.frame.getByRole('textbox', { name: 'Search' });
        this.okbutton = this.frame.getByRole('button', { name: 'OK' });
    }

    async insertSheet(CalculationName, sheetName){


          // Navigate to Calculations screen
        await this.calculationsButton.click();
        await this.calculationsLink.click();
        await this.page.waitForTimeout(2000);

        // Open the calculation
        await this.frame.getByRole('gridcell', { name: CalculationName }).click();
        await this.page.waitForTimeout(10000);
        await this.insertbutton.click();
        await this.insertSheetdropdown.click();
        await this.searchbox.click();
        await this.searchbox.pressSequentially(sheetName);
        await this.frame.getByRole('checkbox', { name: sheetName }).click();
        await this.frame.getByRole('button', { name: 'OK' }).click();
        await this.page.waitForTimeout(3000);
        await this.frame.locator('.btn.btn-default').first().click(); // save the calculation
        await this.page.waitForTimeout(3000);
        console.log(`Sheet "${sheetName}" inserted successfully into calculation "${CalculationName}".`);
    }
}

export { InsertSheet };
