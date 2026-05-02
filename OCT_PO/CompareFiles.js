import { createRequire } from 'module';
import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Create require function for CommonJS modules
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

class CompareFiles {
    constructor(page) {
        this.page = page;
        this.frame = page.frameLocator('iframe[title="Corporate Tax"]');
        this.baselinePath = 'C:/Playwright_self/playwright-OCT-Automation2/BaselinePDFs';
    }

    /**
     * Extracts all account line items and their numeric values from PDF text
     * Returns an object with account names as keys and values as strings
     */
    extractAllValues(pdfText) {
        const values = {};

        // Split text into lines
        const lines = pdfText.split('\n');

        // Pattern to match lines with account names followed by numeric values
        // Matches: "Account Name" followed by numbers with commas, parentheses, or hyphens
        const linePattern = /^(.+?)\s+([0-9,\-()]+)\s*$/;

        for (const line of lines) {
            const trimmedLine = line.trim();
            const match = trimmedLine.match(linePattern);

            if (match) {
                const accountName = match[1].trim();
                const value = match[2].trim();

                // Filter out non-account lines (page numbers, headers, etc.)
                // Only include lines that look like account entries
                if (accountName && value && accountName.length > 2) {
                    values[accountName] = value;
                }
            }
        }

        return values;
    }

    async compareFiles(calculationName, actualBuffer, expectedPdfPath) {
        // Parse the actual PDF buffer
        const actualData = await pdfParse(actualBuffer);
        const actualText = actualData.text;

        console.log('\n=== PDF Comparison ===');
        console.log(`Validating calculation: ${calculationName}`);

        // Check if expected PDF exists
        if (!fs.existsSync(expectedPdfPath)) {
            const errorMessage = `Expected PDF not found: ${expectedPdfPath}`;
            console.log(`\n❌ ${errorMessage}\n`);
            expect.fail(errorMessage);
        }

        // Load and parse expected PDF
        console.log(`\n📄 Comparing against expected PDF: ${expectedPdfPath}`);
        const expectedBuffer = fs.readFileSync(expectedPdfPath);
        const expectedData = await pdfParse(expectedBuffer);
        const expectedText = expectedData.text;

        // Extract all values from both PDFs
        const actualValues = this.extractAllValues(actualText);
        const expectedValues = this.extractAllValues(expectedText);

        console.log('\n--- Extracted Values (Actual PDF) ---');
        for (const [account, value] of Object.entries(actualValues)) {
            console.log(`  ${account}: ${value}`);
        }
        console.log('--- End Extracted Values ---\n');

        console.log('--- Extracted Values (Expected PDF) ---');
        for (const [account, value] of Object.entries(expectedValues)) {
            console.log(`  ${account}: ${value}`);
        }
        console.log('--- End Extracted Values ---\n');

        // Compare values
        const mismatches = [];
        const allAccounts = new Set([...Object.keys(actualValues), ...Object.keys(expectedValues)]);

        console.log('--- Comparison Results ---');
        for (const account of allAccounts) {
            const actualValue = actualValues[account];
            const expectedValue = expectedValues[account];

            if (!actualValue && expectedValue) {
                const mismatch = `Missing in actual PDF: ${account} (Expected: ${expectedValue})`;
                mismatches.push(mismatch);
                console.log(`  ✗ ${mismatch}`);
            } else if (actualValue && !expectedValue) {
                const mismatch = `Extra in actual PDF: ${account} = ${actualValue} (not in expected)`;
                mismatches.push(mismatch);
                console.log(`  ✗ ${mismatch}`);
            } else if (actualValue !== expectedValue) {
                const mismatch = `${account}: Expected ${expectedValue}, Got ${actualValue}`;
                mismatches.push(mismatch);
                console.log(`  ✗ ${mismatch}`);
            } else {
                console.log(`  ✓ ${account}: ${actualValue}`);
            }
        }
        console.log('--- End Comparison ---\n');

        // Use Playwright assertions to fail the test if there are mismatches
        if (mismatches.length > 0) {
            const errorMessage = `PDF validation failed for calculation "${calculationName}":\n${mismatches.join('\n')}`;
            console.log(`\n❌ ${errorMessage}\n`);
            expect(mismatches.length, errorMessage).toBe(0);
        } else {
            console.log(`\n✅ PDF validation successful - All values match expected PDF\n`);
        }

        return {
            actualValues: actualValues,
            expectedValues: expectedValues,
            fullText: actualText,
            isValid: mismatches.length === 0,
            mismatches: mismatches
        };
    }
}

export { CompareFiles };
