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

    // Close any leftover right-hand side panel (e.g. the Drilldown
    // comparable-picker combobox) that can linger from a previous iteration.
    // When it stays open the worksheet shifts, the line-item amount cell
    // moves, and drilldown click attempts land on the wrong target —
    // producing "Drilldown did not open" errors.
    async dismissSidePanel() {
        try {
            const sidePanelClose = this.frame.getByRole('button', { name: '×' }).last();
            if (await sidePanelClose.isVisible({ timeout: 800 }).catch(() => false)) {
                await sidePanelClose.click({ timeout: 2000 }).catch(() => {});
                await this.page.waitForTimeout(500);
            }
        } catch {
            // No side panel — nothing to do.
        }
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

        try {
            await clickAction();
        } catch {
            // The click attempt may fail if the in-frame drilldown already opened
            // (the target element gets detached). Swallow it and let the caller
            // detect the same-page drilldown.
        }

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
        await this.dismissSidePanel();
        await this.waitForWorksheetIdle();
        await amountCell.scrollIntoViewIfNeeded();

        // OCT drilldown is bound to code tokens (Q, Q1, B, ...). After an
        // append-existing import the cell can show MULTIPLE tokens — e.g.
        // "P Q £ 116,064" where P is the paste indicator and Q is the
        // drilldown trigger. Collect all token candidates and try them in
        // order, skipping the paste marker "P".
        const tokenLocator = amountCell
            .locator('xpath=.//*[self::span or self::div][normalize-space() and string-length(normalize-space()) <= 4]')
            .filter({ hasText: /^(?:[A-Z]{1,2}\d{0,2})$/ });

        const tokenCount = await tokenLocator.count().catch(() => 0);
        const tokenTargets = [];
        for (let i = 0; i < tokenCount; i++) {
            const token = tokenLocator.nth(i);
            const text = ((await token.textContent().catch(() => '')) || '').trim();
            // Skip the paste indicator — it never opens drilldown.
            if (text === 'P') {
                continue;
            }
            tokenTargets.push(token);
        }

        const amountTextTarget = amountCell.getByText(amountValue, { exact: true }).first();
        const hasAmountTextTarget = await amountTextTarget.isVisible().catch(() => false);

        // Build a prioritised list of click targets: drilldown tokens first
        // (Q/Q1/B/...), then the amount text, then the whole cell.
        const clickTargets = [...tokenTargets];
        if (hasAmountTextTarget) {
            clickTargets.push(amountTextTarget);
        }
        clickTargets.push(amountCell);

        const attempts = [];
        for (const target of clickTargets) {
            attempts.push(async () => target.click({ timeout: 2000 }));
            attempts.push(async () => target.dblclick({ timeout: 2000 }));
        }

        for (const attempt of attempts) {
            const drilldownPage = await this.clickAndCaptureNewPage(attempt);
            if (drilldownPage) {
                return { type: 'new-page', page: drilldownPage };
            }

            // Check same-page drilldown BEFORE retrying another click, since the
            // first click may have already opened the in-frame drilldown.
            if (await this.didInFrameDrilldownOpen(2000)) {
                return { type: 'same-page' };
            }

            await this.dismissRedBanner();
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
        // Pin to the "Target: ..." group row so we are not confused by header
        // rows. The Total Amount cell is the first gridcell in that row whose
        // text contains any number (with or without decimals); this is robust
        // against extra columns (e.g. Source Currency, Amount) appearing in
        // certain drilldown views.
        const groupRow = root
            .locator('role=treegrid >> role=row')
            .filter({ hasText: /Target:/i })
            .first();

        // Total Amount is reliably the SECOND gridcell of the group row
        // (right after the "Target: ... (N items)" label). Trailing cells
        // for non-aggregatable columns (e.g. Source Currency, Amount in
        // 8-column drilldowns) are empty, so `.last()` is unsafe.
        const groupedAmountCell = groupRow
            .locator('role=gridcell')
            .nth(1);

        // Fallback: first gridcell whose text contains a digit AND a comma
        // or a decimal point or a leading minus. This excludes the label
        // cell "(N items)" while matching real numeric totals like
        // "962,652.71" or "-58,032.17".
        const fallbackAmountCell = groupRow
            .locator('role=gridcell')
            .filter({ hasText: /[-]?\d[\d,]*\.\d+|\d{1,3}(?:,\d{3})+/ })
            .first();

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
        await this.dismissSidePanel();
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
            // Drilldown grids can take several seconds to populate, especially
            // on larger datasets. Use a generous primary timeout before
            // falling back to a structural locator.
            const primaryVisible = await totalAmountCell.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
            const resolvedAmountCell = primaryVisible ? totalAmountCell : fallbackAmountCell;

            if (!primaryVisible) {
                await resolvedAmountCell.waitFor({ state: 'visible', timeout: 5000 });
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
            // Same-page drilldown: exit the in-frame DrillDown view so the left
            // navigation tree (with "Income statement") is rendered again for
            // the next iteration. The back-arrow icon in the DrillDown toolbar
            // has no accessible name, so target it by structure: first clickable
            // element inside the toolbar that contains the "DrillDown" heading.
            const drilldownToolbar = this.frame
                .locator('[role="toolbar"]')
                .filter({ hasText: /^\s*DrillDown\s*$/ })
                .first();

            const candidateBackTargets = [
                drilldownToolbar.locator('button, [role="button"]').first(),
                drilldownToolbar.locator('a').first(),
                // Some builds render the back icon as a span with a click handler.
                drilldownToolbar.locator('span, i').first()
            ];

            let exited = false;
            for (const target of candidateBackTargets) {
                const visible = await target.isVisible({ timeout: 800 }).catch(() => false);
                if (!visible) {
                    continue;
                }
                await target.click({ timeout: 2000 }).catch(() => {});

                // We're back on the worksheet when the left navigation tree is
                // visible again.
                const treeBack = await this.frame
                    .getByRole('treeitem', { name: /Income statement/i })
                    .first()
                    .isVisible({ timeout: 3000 })
                    .catch(() => false);
                if (treeBack) {
                    exited = true;
                    break;
                }
            }

            if (!exited) {
                // Last resort: press Escape; harmless if it does nothing.
                await this.page.keyboard.press('Escape').catch(() => {});
            }

            await this.waitForWorksheetIdle();
            await this.dismissRedBanner();
        }
        await this.page.bringToFront();

    }

    

}

export { DrillDown };