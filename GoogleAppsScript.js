/**
 * Google Apps Script Webhook for Insider Mortgage Consultation Forms
 *
 * Works standalone (https://script.new) OR attached to a Google Sheet!
 * Emails formatted consultation results to rjain@insidermtg.com and dsider@insidermtg.com
 * including the exact page where the visitor filled out the form.
 *
 * 60-Second Setup:
 * 1. Go to https://script.new (signed into your Google account).
 * 2. Delete the placeholder code, paste this entire file, and press Ctrl+S to save.
 * 3. Click "Deploy" (top right) > "New deployment".
 * 4. Click the gear icon next to "Select type" > choose "Web app".
 * 5. Set "Execute as" to "Me" and "Who has access" to "Anyone".
 * 6. Click "Deploy" (authorize once when prompted) and copy the "Web app URL".
 */

var RECIPIENT_EMAILS = 'rjain@insidermtg.com,dsider@insidermtg.com';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var preferredDay =
      data.preferredDay ||
      (Array.isArray(data.preferredDays) && data.preferredDays.length > 0
        ? data.preferredDays.join(', ')
        : '');
    var preferredTime = data.preferredTime || '';
    var hasSms = typeof data.smsConsent === 'boolean';
    var smsText = data.smsConsent ? 'Yes, you may text me' : 'No';
    var pageInfo = data.pageName || data.source || 'Website';
    var shortPage = data.shortPageName || pageInfo;

    // Optional: if attached to a Google Sheet, also append a row
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) {
      var sheet = ss.getActiveSheet();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Timestamp',
          'Page',
          'Page URL',
          'Name',
          'Email',
          'Phone',
          'Profile',
          'Preferred Day(s)',
          'Preferred Time (PT)',
          'SMS Consent'
        ]);
        sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
      }
      sheet.appendRow([
        new Date(),
        pageInfo,
        data.pageUrl || '',
        data.name || '',
        data.email || '',
        data.phone || '',
        data.category || '',
        preferredDay || '—',
        preferredTime || '—',
        hasSms ? smsText : '—'
      ]);
    }

    var recipient = Array.isArray(data.notifyEmails)
      ? data.notifyEmails.join(',')
      : RECIPIENT_EMAILS;

    var subject =
      'New Lead [' +
      shortPage +
      ']: ' +
      (data.name || 'Website Lead') +
      (data.category ? ' (' + data.category + ')' : '');

    var rows =
      rowHtml('Submitted From Page', pageInfo) +
      rowHtml('Page URL', data.pageUrl) +
      rowHtml('Full Name', data.name) +
      rowHtml('Email Address', data.email) +
      rowHtml('Phone Number', data.phone) +
      rowHtml('Borrower Profile / Form', data.category);

    if (preferredDay) {
      rows += rowHtml('Preferred Day(s)', preferredDay);
    }
    if (preferredTime) {
      rows += rowHtml('Preferred Time (Pacific Time)', preferredTime);
    }
    if (hasSms) {
      rows += rowHtml('SMS Text Consent', smsText);
    }
    if (data.extraFields) {
      for (var label in data.extraFields) {
        if (Object.prototype.hasOwnProperty.call(data.extraFields, label) && data.extraFields[label]) {
          rows += rowHtml(label, data.extraFields[label]);
        }
      }
    }
    if (data.submittedAtPacific) {
      rows += rowHtml('Submitted At (PT)', data.submittedAtPacific + ' PT');
    }

    var htmlBody =
      '<div style="font-family: Arial, sans-serif; max-width: 620px; color: #1e293b;">' +
      '<h2 style="color: #060a2d; margin-bottom: 16px;">New Website Consultation Request</h2>' +
      '<table style="width: 100%; border-collapse: collapse;">' +
      rows +
      '</table>' +
      '</div>';

    MailApp.sendEmail({
      to: recipient,
      replyTo: data.email || 'rjain@insidermtg.com',
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
