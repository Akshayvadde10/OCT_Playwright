import { expect } from '@playwright/test';

class DrillDown {
    constructor(page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
    }

    async waitForWorksheetIdle() {
        const busyLoader = this.frame.locator('div.bento-busyloader-blocker').first();
        await busyLoader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => null);
    }

    async didInFrameDrilldownOpen(timeout = 2000) {
        const drilldownHeader = this.frame.getByText('DrillDown', { exact: true }).first();
        const treegrid = this.frame.locator('[role="treegrid"]').first();

        const headerVisible = await drilldownHeader.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
        if (headerVisible) {
            return true;
        }

        return treegrid.waitFor({ state: 'visible', timeout }).then(() => true).catch(() => false);
    }

    async clickAndCaptureNewPage(clickAction) {
        const context = this.page.context();
        const existingPages = new Set(context.pages());

        const popupPromise = this.page.waitForEvent('popup', { timeout: 2000 }).catch(() => null);
        const pagePromise = context.waitForEvent('page', { timeout: 2000 }).catch(() => null);

        await clickAction();

        const [popupPage, eventPage] = await Promise.all([popupPromise, pagePromise]);
        return popupPage
            || eventPage
            || context.pages().find((candidatePage) => !existingPages.has(candidatePage))
            || null;
    }

    async dismissRedBanner(timeout = 2000) {
        const banner = this.frame.locator('[role="alert"]').filter({ hasText: /Linked calculation not found/i }).first();
        const alertIconClose = this.frame
            .getByRole('alert')
            .filter({ hasText: /Linked calculation not found/i })
            .locator('i')
            .last();
        const endTime = Date.now() + timeout;

        while (Date.now() < endTime) {
            const isVisible = await banner.isVisible().catch(() => false);
            if (!isVisible) {
                return true;
            }

            const closeTargets = [
                alertIconClose,
                banner.getByRole('button', { name: /close|dismiss|ok|x/i }).first(),
                banner.locator('[aria-label*="close" i]').first(),
                banner.getByText(/^×$/).first(),
                banner.getByText(/^x$/i).first(),
                banner.locator('button').last(),
                banner.locator('xpath=.//*[normalize-space()=""]').last(),
                banner.locator('> *').last()
            ];

            let clicked = false;
            for (const target of closeTargets) {
                const canUseTarget = await target.count().then((c) => c > 0).catch(() => false);
                if (!canUseTarget) {
                    continue;
                }

                const didClick = await target.click({ timeout: 1000, force: true }).then(() => true).catch(() => false);
                if (didClick) {
                    clicked = true;
                    break;
                }
            }

            if (!clicked) {
                // Some in-app toast alerts render the close icon as a non-semantic glyph.
                const box = await banner.boundingBox().catch(() => null);
                if (box) {
                    const x = box.x + Math.max(6, box.width - 14);
                    const y = box.y + Math.max(6, Math.min(box.height - 6, box.height / 2));
                    await this.page.mouse.click(x, y).catch(() => null);
                }
                await this.page.keyboard.press('Escape').catch(() => null);
            }

            const closed = await banner.waitFor({ state: 'hidden', timeout: 600 }).then(() => true).catch(() => false);
            if (closed) {
                return true;
            }

            await this.page.waitForTimeout(150);
        }

        return !(await banner.isVisible().catch(() => false));
    }

    async openDrilldownPage(amountCell, amountValue) {
        await this.waitForWorksheetIdle();
        await amountCell.scrollIntoViewIfNeeded();

        // OCT drilldown is usually bound to code tokens (Q, Q1, B, etc.), not the amount text.
        const drilldownToken = amountCell
            .locator('xpath=.//*[self::span or self::div][normalize-space() and string-length(normalize-space()) <= 4]')
            .filter({ hasText: /^(?:[A-Z]{1,2}\d{0,2})$/ })
            .first();
        const amountTextTarget = amountCell.getByText(amountValue, { exact: true }).first();
        const hasDrilldownToken = await drilldownToken.isVisible().catch(() => false);
        const hasAmountTextTarget = await amountTextTarget.isVisible().catch(() => false);

        const clickTarget = hasDrilldownToken
            ? drilldownToken
            : (hasAmountTextTarget ? amountTextTarget : amountCell);

        const attempts = [
            async () => clickTarget.click({ timeout: 2000 }),
            async () => clickTarget.dblclick({ timeout: 2000 }),
            async () => amountCell.click({ timeout: 2000 }),
            async () => amountCell.dblclick({ timeout: 2000 })
        ];

        for (const attempt of attempts) {
            const drilldownPage = await this.clickAndCaptureNewPage(attempt);
            if (drilldownPage) {
                return { type: 'new-page', page: drilldownPage };
            }

            await this.dismissRedBanner();

            const inFrameOpened = await this.didInFrameDrilldownOpen(2000);
            if (inFrameOpened) {
                return { type: 'same-page' };
            }

            await this.waitForWorksheetIdle();
        }

        const inFrameOpened = await this.didInFrameDrilldownOpen(2000);
        if (inFrameOpened) {
            return { type: 'same-page' };
        }

        await this.dismissRedBanner();

        throw new Error('Drilldown did not open. No popup/new page or in-page drilldown signal was detected.');
    }

    getDrilldownAmountCell(root) {
        const groupedAmountCell = root
            .locator('role=treegrid >> role=row')
            .filter({ hasText: /Target:/i })
            .first()
            .locator('role=gridcell')
            .filter({ hasText: /-?\d[\d,]*\.\d{2}/ })
            .first();

        const fallbackAmountCell = root
            .locator('role=treegrid >> role=row')
            .nth(0)
            .locator('role=gridcell')
            .last();

        return { groupedAmountCell, fallbackAmountCell };
    }

    async ensureIncomeStatementSheet() {
        const lineItemProbe = this.frame.locator('div.athena-worksheet-cell-inner-default').filter({ hasText: 'Turnover' }).first();
        const alreadyOnIncomeStatement = await lineItemProbe.isVisible().catch(() => false);
        if (alreadyOnIncomeStatement) {
            return;
        }

        const incomeStatementTreeItem = this.frame
            .getByRole('treeitem', { name: /Income statement/i })
            .first();

        await incomeStatementTreeItem.waitFor({ state: 'visible', timeout: 10000 });
        await incomeStatementTreeItem.click();

        await this.waitForWorksheetIdle();
        await lineItemProbe.waitFor({ state: 'visible', timeout: 10000 });
    }

    async verifyDrilldown(LineItemAmount, LineitemName, DrillDownAmount = null) {
        await this.ensureIncomeStatementSheet();

        const lineItemCell = this.frame.locator('div.athena-worksheet-cell-inner-default').filter({ hasText: LineitemName }).first();
        const amountCell = lineItemCell.locator('xpath=ancestor::div[@role="gridcell"][1]/following-sibling::div[@role="gridcell"][1]');

        await lineItemCell.waitFor({ state: 'visible', timeout: 10000 });

        const actualAmount = ((await amountCell.textContent()) || '').replace(/\u00a0/g, ' ').trim();
        const actualAmountMatches = [...actualAmount.matchAll(/\(?-?\d[\d,]*(?:\.\d+)?\)?/g)];
        const comparableActualAmount = actualAmountMatches.length > 0 ? actualAmountMatches[actualAmountMatches.length - 1][0] : actualAmount;

        console.log('Line item in Income Statement: ' + LineitemName);
        console.log('Value in LineitemName: ' + actualAmount);
        console.log('Comparable value in LineitemName: ' + comparableActualAmount);
        expect(comparableActualAmount).toBe(LineItemAmount);
        console.log('✓ Drilldown validation successful - Value matches expected result');

        await this.waitForWorksheetIdle();
        await amountCell.waitFor({ state: 'visible', timeout: 10000 });

        const drilldownTarget = await this.openDrilldownPage(amountCell, comparableActualAmount);
        let totalAmountCell;
        let fallbackAmountCell;

        if (drilldownTarget.type === 'new-page') {
            const drilldownPage = drilldownTarget.page;
            await drilldownPage.waitForLoadState('domcontentloaded');
            await drilldownPage.bringToFront();

            const amountCells = this.getDrilldownAmountCell(drilldownPage);
            totalAmountCell = amountCells.groupedAmountCell;
            fallbackAmountCell = amountCells.fallbackAmountCell;
        } else {
            const amountCells = this.getDrilldownAmountCell(this.frame);
            totalAmountCell = amountCells.groupedAmountCell;
            fallbackAmountCell = amountCells.fallbackAmountCell;
        }

        if (DrillDownAmount !== null && DrillDownAmount !== undefined) {
            const primaryVisible = await totalAmountCell.waitFor({ state: 'visible', timeout: 2000 }).then(() => true).catch(() => false);
            const resolvedAmountCell = primaryVisible ? totalAmountCell : fallbackAmountCell;

            if (!primaryVisible) {
                await resolvedAmountCell.waitFor({ state: 'visible', timeout: 2000 });
            }

            const drillDownActualAmount = ((await resolvedAmountCell.textContent()) || '')
                .replace(/\u00a0/g, ' ')
                .trim();
            const drillDownAmountMatches = [...drillDownActualAmount.matchAll(/\(?-?\d[\d,]*(?:\.\d+)?\)?/g)];
            const comparableDrillDownAmount = drillDownAmountMatches.length > 0 ? drillDownAmountMatches[drillDownAmountMatches.length - 1][0] : drillDownActualAmount;

            console.log('Drilldown total amount value: ' + drillDownActualAmount);
            console.log('Comparable drilldown total amount value: ' + comparableDrillDownAmount);
            expect(comparableDrillDownAmount).toBe(DrillDownAmount);
            console.log('✓ Drilldown amount validation successful - Value matches expected result');
        }

        if (drilldownTarget.type === 'new-page') {
            await drilldownTarget.page.close();
        } else {
            await this.page.goBack().catch(() => null);
            await this.waitForWorksheetIdle();
            await this.dismissRedBanner();
        }
        await this.page.bringToFront();

    }

    

}

export { DrillDown };