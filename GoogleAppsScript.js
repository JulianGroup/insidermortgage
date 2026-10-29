/**
 * Google Apps Script Webhook for Insider Mortgage Consultation Forms
 *
 * Logs leads to a Google Sheet AND emails formatted consultation details
 * internally to DSRJ@InsiderMtg.com (ideal if DSRJ@InsiderMtg.com is restricted
 * to internal Google Workspace senders).
 *
 * Setup (Optional — only needed if not using FormSubmit or if restricting group email):
 * 1. Open a Google Sheet under your @InsiderMtg.com Google Workspace account.
 * 2. Go to Extensions > Apps Script, paste this script, and save.
 * 3. Click Deploy > New deployment > Type: "Web app".
 * 4. Execute as: "Me" | Who has access: "Anyone".
 * 5. Copy the Web App URL and set NEXT_PUBLIC_GOOGLE_SCRIPT_URL in .env.local.
 */

var GROUP_EMAIL = 'DSRJ@InsiderMtg.com';

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Profile',
        'Preferred Day(s)',
        'Preferred Time (PT)',
        'SMS Consent',
        'Source'
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    }

    var preferredDay =
      data.preferredDay ||
      (Array.isArray(data.preferredDays) && data.preferredDays.length > 0
        ? data.preferredDays.join(', ')
        : 'Flexible');
    var preferredTime = data.preferredTime || "I'm flexible";
    var smsText = data.smsConsent ? 'Yes, you may text me' : 'No';

    sheet.appendRow([
      new Date(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.category || '',
      preferredDay,
      preferredTime,
      smsText,
      data.source || ''
    ]);

    var recipient = data.notifyEmail || GROUP_EMAIL;
    var subject =
      'New Consultation Request: ' +
      (data.name || 'Website Lead') +
      (data.category ? ' (' + data.category + ')' : '');

    var htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 600px; color: #1e293b;">' +
      '<h2 style="color: #060a2d; margin-bottom: 16px;">New Consultation Request</h2>' +
      '<table style="width: 100%; border-collapse: collapse;">' +
      rowHtml('Full Name', data.name) +
      rowHtml('Email Address', data.email) +
      rowHtml('Phone Number', data.phone) +
      rowHtml('Borrower Profile', data.category) +
      rowHtml('Preferred Day(s)', preferredDay) +
      rowHtml('Preferred Time (Pacific Time)', preferredTime) +
      rowHtml('SMS Text Consent', smsText) +
      rowHtml('Submitted From', data.source) +
      '</table>' +
      '</div>';

    MailApp.sendEmail({
      to: recipient,
      replyTo: data.email || recipient,
      subject: subject,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'success' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function rowHtml(label, value) {
  return (
    '<tr>' +
    '<td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold; background: #f8fafc; width: 42%;">' +
    escapeHtml(label) +
    '</td>' +
    '<td style="padding: 8px 12px; border: 1px solid #cbd5e1;">' +
    escapeHtml(value || '—') +
    '</td>' +
    '</tr>'
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
