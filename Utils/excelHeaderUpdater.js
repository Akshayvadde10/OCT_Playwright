import ExcelJS from 'exceljs';

/**
 * Updates the 3rd, 4th, and 5th column headers with entity names
 * @param {string} entityName1 - First entity name for column C
 * @param {string} entityName2 - Second entity name for column D
 * @param {string} entityName3 - Third entity name for column E
 */
async function updateEntityHeaders(filePath,entityName1, entityName2, entityName3) {
 
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet('Sheet1');

  // Update 3rd header (Column C)
  worksheet.getCell('C1').value = entityName1;

  // Update 4th header (Column D)
  worksheet.getCell('D1').value = entityName2;

  // Update 5th header (Column E)
  worksheet.getCell('E1').value = entityName3;

  await workbook.xlsx.writeFile(filePath);
  console.log('Headers updated successfully!');
}

export { updateEntityHeaders };