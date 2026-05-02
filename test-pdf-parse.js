import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

console.log('PDFParse type:', typeof PDFParse);
console.log('PDFParse:', PDFParse);

// Try to create an instance and parse
try {
    // Try with options
    const parser = new PDFParse({});
    console.log('✓ PDFParse instantiated successfully');
    console.log('Parser methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));

    // Try with a real PDF file if exists
    const pdfPath = 'C:/Playwright_self/playwright-OCT-Automation2/Test Data/Regression/4689052/Expected_ImportTb.pdf';
    if (fs.existsSync(pdfPath)) {
        const pdfBuffer = fs.readFileSync(pdfPath);
        console.log('\nTrying to load and parse actual PDF...');

        // Try with data parameter
        parser.load({ data: pdfBuffer }).then(async () => {
            console.log('✓ PDF loaded successfully!');

            // Get text
            const text = await parser.getText();
            console.log('✓ Text extracted!');
            console.log('Text length:', text?.length || 0);
            console.log('First 200 chars:', text?.substring(0, 200));
        }).catch(err => {
            console.log('Error with data param:', err.message);

            // Try as Uint8Array
            console.log('\nTrying with Uint8Array...');
            parser.load(new Uint8Array(pdfBuffer)).then(async () => {
                const text = await parser.getText();
                console.log('✓ Text extracted with Uint8Array!');
                console.log('Text length:', text?.length || 0);
                console.log('First 200 chars:', text?.substring(0, 200));
            }).catch(err2 => {
                console.log('Error with Uint8Array:', err2.message);
            });
        });
    } else {
        console.log('Test PDF not found');
    }
} catch (error) {
    console.log('Error:', error.message);
    console.log('Stack:', error.stack);
}
