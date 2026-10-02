/**
 * Vanta order receiver for Google Sheets.
 *
 * طريقة الاستخدام:
 * 1) أنشئ Google Sheet جديداً.
 * 2) من Extensions > Apps Script الصق هذا الملف.
 * 3) شغّل setupSheet مرة واحدة لمنح الصلاحيات وتجهيز العناوين.
 * 4) Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 5) انسخ رابط Web app وضعه في assets/js/config.js داخل googleScriptUrl.
 */

const SHEET_NAME = 'Vanta Orders';
const HEADERS = [
  'submittedAt',
  'orderId',
  'customerName',
  'phone',
  'businessName',
  'city',
  'productKey',
  'productName',
  'quantity',
  'size',
  'printSides',
  'colors',
  'finish',
  'rush',
  'designService',
  'deadline',
  'notes',
  'baseUnit',
  'sizeFee',
  'colorFee',
  'finishFee',
  'unitPrice',
  'itemsSubtotal',
  'setupFee',
  'designFee',
  'rushFee',
  'total',
  'totalQirsh',
  'currency',
  'calculationVersion'
];

function setupSheet() {
  const sheet = getOrdersSheet_();
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const data = parsePayload_(e);
    validatePayload_(data);

    const sheet = getOrdersSheet_();
    ensureHeaders_(sheet);
    const row = HEADERS.map((header) => data[header] || '');
    sheet.appendRow(row);

    return json_({ ok: true, orderId: data.orderId });
  } catch (error) {
    return json_({ ok: false, error: error.message });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: 'Vanta Orders API' });
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    const contents = e.postData.contents;
    try {
      return JSON.parse(contents);
    } catch (error) {
      throw new Error('Invalid JSON payload.');
    }
  }

  if (e && e.parameter) return e.parameter;
  throw new Error('Missing request payload.');
}

function validatePayload_(data) {
  const required = ['orderId', 'customerName', 'phone', 'businessName', 'quantity', 'total', 'totalQirsh'];
  required.forEach((field) => {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  });

  if (!/^\d+$/.test(String(data.totalQirsh))) {
    throw new Error('totalQirsh must be an integer string.');
  }
}

function getOrdersSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeaders_(sheet) {
  const range = sheet.getRange(1, 1, 1, HEADERS.length);
  const existing = range.getValues()[0];
  const sameHeaders = HEADERS.every((header, index) => existing[index] === header);
  if (!sameHeaders) {
    range.setValues([HEADERS]);
    range.setFontWeight('bold');
    range.setBackground('#09065f');
    range.setFontColor('#ffffff');
  }
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
