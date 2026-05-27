class Printcalc {

    constructor(page) {
        this.page = page;
        this.frame=page.frameLocator('iframe[title="Corporate Tax"]');
        // Try to find print button by icon class
        this.printcalcButton=this.frame.locator("//span[@class='athena-toolbar-menu-icon bento-icon-print toolbar-icon-space-adjust']");
        this.printSheets=this.frame.locator('#printSheets');
        this.printStyle=this.frame.locator('#printStyles');
        this.printButton=this.frame.getByRole('button', { name: 'Print' });
        this.latestPrintdropdown=this.frame.getByRole('listitem').filter({ hasText: 'PrintDownload Latest' }).getByLabel('Options');
        this.downloadLatestPrint=this.frame.getByRole('button', { name: 'Download Latest Print' });
        this.printDialogTitle = this.frame.getByRole('heading', { name: 'Print Calculation' });
        this.activePrintNotifications = this.frame
            .locator("//div[contains(., 'Print') and (contains(., 'Creating') or contains(., 'creating') or contains(., 'Generating') or contains(., 'generating'))]");
        this.notificationCenter = this.frame.locator("//*[contains(normalize-space(.), 'Close All Notifications')]").first();
    }

    async waitForVisible(locator, timeout = 5000) {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return true;
        } catch {
            return false;
        }
    }

    escapeRegex(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async waitForNewPrintCompletion({ completionRow, failureRow, baselineSuccessCount, baselineFailureCount, timeout = 120000 }) {
        const deadline = Date.now() + timeout;
        while (Date.now() < deadline) {
            const failureCount = await failureRow.count().catch(() => 0);
            if (failureCount > baselineFailureCount) {
                return 'failed';
            }

            const successCount = await completionRow.count().catch(() => 0);
            if (successCount > baselineSuccessCount) {
                return 'success';
            }

            await this.page.waitForTimeout(1000);
        }
        return 'timeout';
    }

    async hasVisiblePrintNotification() {
        return await this.activePrintNotifications.evaluateAll((elements) =>
            elements.some((element) => {
                if (!(element instanceof HTMLElement)) {
                    return false;
                }

                const styles = window.getComputedStyle(element);
                return styles.display !== 'none' && styles.visibility !== 'hidden' && element.offsetParent !== null;
            })
        ).catch(() => false);
    }

    async waitForLatestPrintReady(timeout = 30000) {
        const startedAt = Date.now();
        const hasLatestMenu = await this.waitForVisible(this.latestPrintdropdown, timeout);

        if (!hasLatestMenu) {
            console.log('Latest print menu did not become visible within timeout.');
            return false;
        }

        const deadline = Date.now() + timeout;
        let hasActiveNotification = await this.hasVisiblePrintNotification();

        while (hasActiveNotification && Date.now() < deadline) {
            await this.page.waitForTimeout(250);
            hasActiveNotification = await this.hasVisiblePrintNotification();
        }

        console.log(`Print readiness confirmed after ${Date.now() - startedAt}ms: active=${hasActiveNotification}, latestMenu=true`);
        return !hasActiveNotification;
    }

    async openLatestPrintActions(maxRetries = 3, menuTimeout = 3000) {
        if (await this.downloadLatestPrint.isVisible().catch(() => false)) {
            return true;
        }

        for (let i = 0; i < maxRetries; i++) {
            const hasLatestMenu = await this.latestPrintdropdown.isVisible().catch(() => false);
            if (!hasLatestMenu) {
                continue;
            }

            await this.latestPrintdropdown.click({ timeout: 3000 }).catch(() => {});
            const canDownloadLatest = await this.waitForVisible(this.downloadLatestPrint, menuTimeout);
            if (canDownloadLatest) {
                return true;
            }
        }

        return false;
    }

    async waitForLatestDownloadAction(timeout = 30000) {
        const deadline = Date.now() + timeout;

        while (Date.now() < deadline) {
            const hasDownloadAction = await this.openLatestPrintActions(1, 1000);
            if (hasDownloadAction) {
                return true;
            }

            await this.page.waitForTimeout(500);
        }

        return false;
    }

    async openNotificationCenter() {
        const isNotificationCenterOpen = await this.notificationCenter.isVisible().catch(() => false);
        if (isNotificationCenterOpen) {
            return true;
        }

        const notificationToggle = this.frame.locator("//*[contains(normalize-space(.), '') and contains(normalize-space(.), '')]").first();
        const hasNotificationToggle = (await notificationToggle.count().catch(() => 0)) > 0;

        if (!hasNotificationToggle) {
            return false;
        }

        await notificationToggle.click({ timeout: 3000 }).catch(() => {});
        return await this.notificationCenter.isVisible().catch(() => false);
    }

    async getPrintStatusMessage(calculationName) {
        const isNotificationCenterOpen = await this.openNotificationCenter();
        if (!isNotificationCenterOpen) {
            return null;
        }

        // Use getByText so we hit the deepest text node containing the printing
        // marker for THIS calculation, instead of the topmost ancestor (which
        // would otherwise return the whole iframe text and pick up "Success" /
        // "Failed" keywords from unrelated notifications).
        const printStatusLabel = this.frame
            .getByText(`Printing ${calculationName}`, { exact: false })
            .last();

        const isStatusVisible = await printStatusLabel.isVisible().catch(() => false);
        if (!isStatusVisible) {
            return null;
        }

        // The status word ("In progress" / "Success" / "Failed") is rendered as
        // a sibling element of the label. Read the closest enclosing row's text
        // instead of just the label so we see the full "Printing X - Success".
        const rowText = await printStatusLabel
            .evaluate((el) => {
                const row = el.closest('li, tr, [role="listitem"], .notification-item') || el.parentElement;
                return (row?.textContent || el.textContent || '').replace(/\s+/g, ' ').trim();
            })
            .catch(() => '');

        return rowText || null;
    }

    getPrintNotificationState(statusMessage) {
        if (!statusMessage) {
            return 'missing';
        }

        const normalizedStatus = statusMessage.toLowerCase();

        if (normalizedStatus.includes('fail')) {
            return 'failed';
        }

        if (
            normalizedStatus.includes('success') ||
            normalizedStatus.includes('completed') ||
            normalizedStatus.includes('complete')
        ) {
            return 'success';
        }

        if (
            normalizedStatus.includes('printing') ||
            normalizedStatus.includes('creating') ||
            normalizedStatus.includes('generating') ||
            normalizedStatus.includes('in progress')
        ) {
            return 'running';
        }

        return 'unknown';
    }

    async waitForPrintNotificationResult(calculationName, timeout = 60000) {
        const deadline = Date.now() + timeout;
        let lastStatusMessage = null;
        let hasSeenNotification = false;

        while (Date.now() < deadline) {
            const statusMessage = await this.getPrintStatusMessage(calculationName);
            if (statusMessage) {
                hasSeenNotification = true;
                lastStatusMessage = statusMessage;
            }

            const status = this.getPrintNotificationState(statusMessage || lastStatusMessage);

            if (status === 'success') {
                console.log(`Print notification completed successfully: ${lastStatusMessage}`);
                return { status: 'success', message: lastStatusMessage };
            }

            if (status === 'failed') {
                return { status: 'failed', message: statusMessage || lastStatusMessage };
            }

            if (hasSeenNotification) {
                console.log(`Waiting for print notification: ${lastStatusMessage}`);
            }

            await this.page.waitForTimeout(1000);
        }

        return {
            status: 'timeout',
            message: lastStatusMessage || `Timed out waiting for print notification for \"${calculationName}\"`
        };
    }

    async resetLatestDownloadAction(timeout = 3000) {
        const isDownloadActionVisible = await this.downloadLatestPrint.isVisible().catch(() => false);

        if (!isDownloadActionVisible) {
            return;
        }

        await this.page.keyboard.press('Escape').catch(() => {});
        await this.downloadLatestPrint.waitFor({ state: 'hidden', timeout }).catch(() => {});
    }

    async ensurePrintDialogOpen() {
        const isDialogOpen = await this.printDialogTitle.isVisible().catch(() => false);
        if (!isDialogOpen) {
            await this.printcalcButton.click();
            await this.printDialogTitle.waitFor({ state: 'visible', timeout: 10000 });
        }
    }

    async waitForComboReady(comboTarget, timeout = 5000) {
        const busyOverlay = comboTarget.locator('.bento-busyloader-front-blocker').first();
        const hasBusyOverlay = (await busyOverlay.count().catch(() => 0)) > 0;

        if (!hasBusyOverlay) {
            return;
        }

        await busyOverlay.waitFor({ state: 'hidden', timeout }).catch(() => {});
    }

    async setComboValue(comboTarget, value) {
        await this.waitForComboReady(comboTarget);

        const opener = comboTarget
            .locator('.bento-combobox-dropdown-button-icon, .bento-combobox-dropdown-button, .btn, [role="button"]')
            .first();
        const textBox = comboTarget.locator('input[role="textbox"], input').first();

        const option = this.frame.getByRole('option', { name: value, exact: true });
        await opener.click({ timeout: 3000, force: true });

        if (await this.waitForVisible(option, 1500)) {
            await option.click();
            return;
        }

        if ((await textBox.count().catch(() => 0)) === 0) {
            throw new Error(`Option "${value}" was not visible after opening the combo box.`);
        }

        await textBox.click({ timeout: 1500 }).catch(() => {});
        await textBox.press('Control+A').catch(() => {});
        await textBox.fill(value, { timeout: 1500 });

        if (await this.waitForVisible(option, 1500)) {
            await option.click();
            return;
        }

        await textBox.press('Enter');
    }

    async triggerPrintJob() {
        await this.ensurePrintDialogOpen();
        await this.resetLatestDownloadAction();
        await this.setComboValue(this.printSheets, 'Current');
        await this.setComboValue(this.printStyle, 'Automation');
        await this.printButton.click();
    }

    async printcalculation(CalculationName){
        const maxPrintAttempts = 3;
        let download;

        // The "Download Latest Print" action is reused across print jobs in
        // this session: once any print has been generated, the menu item is
        // ALWAYS visible. So waiting for the menu alone is not enough to know
        // whether a *new* print is ready — we'd otherwise download the prior
        // job's PDF.
        //
        // We use the per-calculation completion notification rendered inside
        // the iframe (e.g. "Printing <calc> ... - Success") as the trustworthy
        // signal. We snapshot how many such "completed" rows exist BEFORE
        // triggering the print, then wait for the count to increase.
        const completionRow = this.frame
            .getByText(new RegExp(`Printing ${this.escapeRegex(CalculationName)}[\\s\\S]*?-\\s*Success`));
        const failureRow = this.frame
            .getByText(new RegExp(`Printing ${this.escapeRegex(CalculationName)}[\\s\\S]*?-\\s*Fail`, 'i'));

        for (let attempt = 1; attempt <= maxPrintAttempts; attempt++) {
            console.log(`Print attempt ${attempt}/${maxPrintAttempts}`);

            const baselineSuccessCount = await completionRow.count().catch(() => 0);
            const baselineFailureCount = await failureRow.count().catch(() => 0);

            try {
                await this.triggerPrintJob();
            } catch (error) {
                console.log(`Print attempt ${attempt} failed while configuring print dialog: ${error.message}`);
                await this.page.keyboard.press('Escape').catch(() => {});
                continue;
            }

            // Wait for a NEW success (or failure) row to appear for THIS calc.
            const printOutcome = await this.waitForNewPrintCompletion({
                completionRow,
                failureRow,
                baselineSuccessCount,
                baselineFailureCount,
                timeout: 120000,
            });

            if (printOutcome === 'failed') {
                console.log(`Print attempt ${attempt}: server reported print failure for "${CalculationName}".`);
                await this.page.keyboard.press('Escape').catch(() => {});

                // Server-side print queue is occasionally locked after a
                // burst of jobs. Back off before retrying — and on the last
                // retry, also reload the worksheet to flush any stale
                // session state. Doing this *before* the next attempt has
                // proven to recover the "Fail/Fail/Fail" pattern.
                if (attempt < maxPrintAttempts) {
                    const backoffMs = 5000 * attempt; // 5s, then 10s
                    console.log(`Waiting ${backoffMs / 1000}s before retrying print...`);
                    await this.page.waitForTimeout(backoffMs);

                    if (attempt === maxPrintAttempts - 1) {
                        console.log('Reloading page to clear stale print-session state...');
                        await this.page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
                        await this.page.waitForTimeout(5000);
                    }
                }
                continue;
            }

            if (printOutcome !== 'success') {
                console.log(`Print attempt ${attempt}: timed out waiting for a new "Printing ${CalculationName} - Success" notification.`);
                await this.page.keyboard.press('Escape').catch(() => {});
                continue;
            }

            // New print is ready — make sure the Download Latest Print action
            // is reachable, then trigger the download.
            const hasDownloadAction = await this.waitForLatestDownloadAction(15000);
            if (!hasDownloadAction) {
                console.log(`Print attempt ${attempt}: "Download Latest Print" did not become available.`);
                await this.page.keyboard.press('Escape').catch(() => {});
                continue;
            }

            try {
                [download] = await Promise.all([
                    this.page.waitForEvent('download', { timeout: 30000 }),
                    this.downloadLatestPrint.click()
                ]);
                break;
            } catch (error) {
                console.log(`Print attempt ${attempt}: clicking Download Latest Print did not produce a download: ${error.message}`);
                await this.page.keyboard.press('Escape').catch(() => {});
                continue;
            }
        }

        if (!download) {
            throw new Error(`Print failed for calculation "${CalculationName}" after ${maxPrintAttempts} attempts. Download was skipped.`);
        }

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