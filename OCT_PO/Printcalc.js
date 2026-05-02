class Printcalc {

    constructor(page) {
        this.page = page;
        this.frame=page.frameLocator('iframe[title="Corporate Tax"]');
        // Try to find print button by icon class
        this.printcalcButton=this.frame.locator("//span[@class='athena-toolbar-menu-icon bento-icon-print toolbar-icon-space-adjust']");
        // Find Print Style dropdown in the dialog
        this.printStyle=this.frame.locator('#printStyles').getByRole('button');
        this.printButton=this.frame.getByRole('button', { name: 'Print' });
        this.latestPrintdropdown=this.frame.getByRole('listitem').filter({ hasText: 'PrintDownload Latest' }).getByLabel('Options');
        this.downloadLatestPrint=this.frame.getByRole('button', { name: 'Download Latest Print' });
    }
    async printcalculation(CalculationName){
        await this.printcalcButton.click();
        await this.printStyle.click();
        await this.printStyle.pressSequentially('Automation');
        await this.frame.getByRole('option', { name: 'Automation' }).click();
        await this.page.waitForTimeout(5000);
        await this.printButton.click();
        await this.page.waitForTimeout(5000); // Wait for the print dialog to open and the file to be generated
        await this.latestPrintdropdown.click();

        // Wait for download to start
        const downloadPromise = this.page.waitForEvent('download');
        await this.downloadLatestPrint.click();
        const download = await downloadPromise;

        // Read download content into buffer
        const buffer = await this.downloadToBuffer(download);

        // Clean the calculation name to remove invalid path characters
        const cleanCalcName = CalculationName.replace(/[/\\:*?"<>|]/g, '_');

        // Save the downloaded file with a clean name directly in DownloadPrint folder
        const downloadPath = `C:/Playwright_self/playwright-OCT-Automation2/DownloadPrint/${cleanCalcName}_${Date.now()}.pdf`;
        await download.saveAs(downloadPath);

        console.log(`File downloaded successfully: ${downloadPath}`);
        console.log(`Buffer size: ${buffer.length} bytes`);

        return { downloadPath, buffer };
    }

    async downloadToBuffer(download) {
        const stream = await download.createReadStream();
        const chunks = [];

        return new Promise((resolve, reject) => {
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    }

}

export {Printcalc};