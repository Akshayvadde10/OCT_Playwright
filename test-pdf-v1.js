import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('pdfParse type:', typeof pdfParse);

const pdfPath = 'C:/Playwright_self/playwright-OCT-Automation2/Test Data/Regression/4689052/Expected_ImportTb.pdf';

if (fs.existsSync(pdfPath)) {
    const pdfBuffer = fs.readFileSync(pdfPath);
    console.log('PDF buffer size:', pdfBuffer.length);

    pdfParse(pdfBuffer).then(data => {
        console.log('\n✓ PDF parsed successfully!');
        console.log('Pages:', data.numpages);
        console.log('Text length:', data.text.length);
        console.log('First 200 chars:', data.text.substring(0, 200));
    }).catch(err => {
        console.log('Error:', err.message);
    });
} else {
    console.log('Test PDF not found');
}
