/**
 * Google Apps Script Webhook for Mortgage Broker Website
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any code in the editor and paste this entire script.
 * 4. Click the "Deploy" button at the top right > "New deployment".
 * 5. Select type: "Web app".
 * 6. Execute as: "Me".
 * 7. Who has access: "Anyone".
 * 8. Click "Deploy" (you may need to authorize permissions).
 * 9. Copy the "Web app URL" and paste it into src/components/LeadCapture.jsx 
 *    replacing the GOOGLE_SCRIPT_URL variable.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the JSON payload sent from the website
    var data = JSON.parse(e.postData.contents);
    
    // If the sheet is completely empty, add headers in the first row
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Category']);
      
      // Make headers bold
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
    
    // Append the incoming data as a new row
    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.category || ''
    ]);
    
    // Return a success response
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // If something fails, return an error
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
