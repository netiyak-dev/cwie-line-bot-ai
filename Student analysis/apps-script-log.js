/**
 * AGSP Log Webhook — Google Apps Script
 *
 * วิธีใช้:
 *  1. ไปที่ Google Sheet ที่ต้องการเก็บ log
 *  2. Extensions → Apps Script
 *  3. วางโค้ดนี้แทนที่ทั้งหมด
 *  4. Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy Web app URL → ใส่ใน LOG_WEBHOOK_URL (Vercel + .env.local)
 *
 * Sheet ที่ต้องมี: "FAQ_Log" (หรือปรับชื่อในบรรทัด SHEET_NAME)
 * Columns: Timestamp | Question | Reply | FinishReason | Answered
 */

const SHEET_NAME = "FAQ_Log";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // สร้าง sheet + header ถ้ายังไม่มี
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Timestamp", "Question", "Reply", "FinishReason", "Answered"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#003F88").setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.question || "",
      data.reply || "",
      data.finishReason || "",
      data.answered === true ? "YES" : "NO",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ทดสอบ: รันฟังก์ชันนี้จาก Apps Script IDE เพื่อตรวจสอบว่า sheet สร้างถูกต้อง
function testSetup() {
  doPost({
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        question: "ทดสอบ",
        reply: "ตอบทดสอบ",
        finishReason: "STOP",
        answered: true
      })
    }
  });
  Logger.log("Done — ตรวจสอบ sheet FAQ_Log ได้เลย");
}
