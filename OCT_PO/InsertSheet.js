import { expect } from '@playwright/test';

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
                await expect(this.frame.getByRole('gridcell', { name: CalculationName, exact: true }).first()).toBeVisible({ timeout: 15000 });

        // Open the calculation
                await this.frame.getByRole('gridcell', { name: CalculationName, exact: true }).first().click();
                await expect(this.insertbutton).toBeVisible({ timeout: 15000 });
        await this.insertbutton.click();
        await this.insertSheetdropdown.click();
                await this.searchbox.fill(sheetName);
                await expect(this.frame.getByRole('checkbox', { name: sheetName, exact: true }).first()).toBeVisible({ timeout: 15000 });
                await this.frame.getByRole('checkbox', { name: sheetName, exact: true }).first().check();
        await this.frame.getByRole('button', { name: 'OK' }).click();
                await expect(this.frame.locator('.btn.btn-default').first()).toBeVisible({ timeout: 15000 });
        await this.frame.locator('.btn.btn-default').first().click(); // save the calculation
        await this.page.waitForTimeout(3000);
        console.log(`Sheet "${sheetName}" inserted successfully into calculation "${CalculationName}".`);
    }
}

export { InsertSheet };
