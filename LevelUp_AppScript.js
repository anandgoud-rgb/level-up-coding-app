// ============================================================
// Level Up — Google Apps Script  (v2 — all via GET for reliability)
// Paste this entire file into your Apps Script editor,
// then click Deploy → New Deployment → Web App
// Set "Who has access" to "Anyone" → Deploy → copy the URL
// ============================================================

const SHEET_ID = '1cnPGP14eSovqZNklCqJkxdSeCHio6vIM6KEItC5ujB0';
const CAMPUSES = [
  'ADTU','CUH','SAGE Indore','SAGE Bhopal','DRK',
  'Hitech','IITM','SRMU','VGUJ','RBU','RGI','TIPS','RGU'
];
const HEADERS = [
  'Name','Email','Program','Batch',
  'HTML (0-10)','CSS (0-10)','JS (0-10)',
  'Instagram','Java Levels (0-9)','ATM',
  'XP','Last Updated'
];

function cors(output) {
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}
function ok(data)  { return cors(JSON.stringify({status:'ok', data:data})); }
function err(msg)  { return cors(JSON.stringify({status:'error', message:msg})); }

// ---- SETUP: run this once manually to create all campus tabs ----
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const def = ss.getSheetByName('Sheet1');
  if (def && ss.getSheets().length > 1) {
    try { ss.deleteSheet(def); } catch(e) {}
  }
  CAMPUSES.forEach(function(campus) {
    var sheet = ss.getSheetByName(campus);
    if (!sheet) sheet = ss.insertSheet(campus);
    if (!sheet.getRange('A1').getValue()) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setBackground('#1a1a2e')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);
      sheet.setColumnWidth(2, 220);
      sheet.setColumnWidth(12, 180);
    }
  });
  Logger.log('All campus sheets set up.');
}

function findRow(sheet, email) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase().trim() === email.toLowerCase().trim()) return i + 1;
  }
  return -1;
}

function getProgress(email, college) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(college);
  if (!sheet) return err('Campus not found: ' + college);
  var row = findRow(sheet, email);
  if (row === -1) return ok(null);
  var vals = sheet.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  return ok({
    name:        vals[0],
    email:       vals[1],
    program:     vals[2],
    batch:       vals[3],
    html_done:   Number(vals[4]) || 0,
    css_done:    Number(vals[5]) || 0,
    js_done:     Number(vals[6]) || 0,
    instagram:   vals[7] === '✅',
    java_levels: Number(vals[8]) || 0,
    atm_done:    vals[9] === '✅',
    xp:          Number(vals[10]) || 0,
    updated_at:  vals[11]
  });
}

function saveProgress(p) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var college = p.college;
  var sheet = ss.getSheetByName(college);
  if (!sheet) return err('Campus not found: ' + college);

  var row = [
    p.name        || '',
    p.email       || '',
    p.program     || '',
    p.batch       || '',
    Number(p.html_done)   || 0,
    Number(p.css_done)    || 0,
    Number(p.js_done)     || 0,
    (p.instagram === 'true' || p.instagram === true) ? '✅' : '❌',
    Number(p.java_levels) || 0,
    (p.atm_done === 'true' || p.atm_done === true) ? '✅' : '❌',
    Number(p.xp)          || 0,
    new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})
  ];

  var existing = findRow(sheet, p.email);
  if (existing === -1) {
    sheet.appendRow(row);
  } else {
    sheet.getRange(existing, 1, 1, row.length).setValues([row]);
  }
  return ok({saved: true});
}

// ---- SINGLE ENTRY POINT: everything via GET ----
function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === 'get') {
      return getProgress(e.parameter.email, e.parameter.college);
    }
    if (action === 'save') {
      return saveProgress(e.parameter);
    }
    return err('Unknown action. Use action=get or action=save');
  } catch(ex) {
    return err(ex.toString());
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.action === 'save') return saveProgress(payload);
    return err('Unknown action');
  } catch(ex) {
    return err(ex.toString());
  }
}
