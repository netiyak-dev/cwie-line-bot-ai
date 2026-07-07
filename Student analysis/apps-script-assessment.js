/**
 * AGSP Assessment Webhook — Google Apps Script
 *
 * วิธีใช้:
 *  1. ไปที่ Google Sheet เดียวกับ KAAG474_Chatbot หรือสร้างใหม่
 *  2. Extensions → Apps Script
 *  3. วางโค้ดนี้แทนที่ทั้งหมด
 *  4. Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy Web app URL → ใส่ใน ASSESSMENT_WEBHOOK_URL (Vercel + .env.local)
 *
 * Sheets ที่จะสร้างอัตโนมัติ:
 *   "Assessment_Results" — ผลประเมินรายครั้ง (anonymized)
 *   "FollowUp_OptIn"     — รายการที่กด opt-in รับแจ้งเตือน (เก็บ LINE ID, PDPA-compliant)
 */

const ASSESSMENT_SHEET = "Assessment_Results";
const FOLLOWUP_SHEET   = "FollowUp_OptIn";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type || "assessment"; // "assessment" หรือ "followup"

    if (type === "followup") {
      return handleFollowUp(data);
    }
    return handleAssessment(data);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── Assessment ──────────────────────────────────────────────────────────────

function handleAssessment(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(ASSESSMENT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(ASSESSMENT_SHEET);
    const headers = [
      "TakenAt", "StudentIdHash",
      "HardScore", "SoftScore", "OverallScore",
      "HS1","HS2","HS3","HS4","HS5",
      "SS1","SS2","SS3","SS4","SS5","SS6",
      "Recommendations"
    ];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold").setBackground("#003F88").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 180);
    sheet.setColumnWidth(18, 400);
  }

  // Parse scores
  const hardScores = typeof data.hardSkillScores === "string"
    ? JSON.parse(data.hardSkillScores)
    : (data.hardSkillScores || {});
  const softScores = typeof data.softSkillScores === "string"
    ? JSON.parse(data.softSkillScores)
    : (data.softSkillScores || {});
  const recs = typeof data.recommendations === "string"
    ? JSON.parse(data.recommendations)
    : (data.recommendations || []);

  sheet.appendRow([
    data.takenAt || new Date().toISOString(),
    data.studentIdHash || "",
    data.hardScore || "",
    data.softScore || "",
    data.overallScore || "",
    hardScores.HS1 || "", hardScores.HS2 || "", hardScores.HS3 || "",
    hardScores.HS4 || "", hardScores.HS5 || "",
    softScores.SS1 || "", softScores.SS2 || "", softScores.SS3 || "",
    softScores.SS4 || "", softScores.SS5 || "", softScores.SS6 || "",
    recs.join(" | "),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, saved: "assessment" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Follow-up Opt-in ─────────────────────────────────────────────────────────

function handleFollowUp(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(FOLLOWUP_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(FOLLOWUP_SHEET);
    const headers = ["OptInAt", "LineUserId", "AssessmentAt", "Sent2W", "Sent1M", "Sent3M", "LastSentAt", "OptIn"];
    sheet.appendRow(headers);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold").setBackground("#2D6A4F").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.lineUserId || "",
    data.assessmentAt || "",
    data.sent2w || false,
    data.sent1m || false,
    data.sent3m || false,
    data.lastSentAt || "",
    data.optIn !== undefined ? data.optIn : true,
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, saved: "followup" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── Test ─────────────────────────────────────────────────────────────────────

function testAssessment() {
  doPost({
    postData: {
      contents: JSON.stringify({
        type: "assessment",
        takenAt: new Date().toISOString(),
        studentIdHash: "abc123hash",
        hardScore: 72,
        softScore: 65,
        overallScore: 68,
        hardSkillScores: { HS1: 80, HS2: 70, HS3: 60, HS4: 75, HS5: 75 },
        softSkillScores: { SS1: 70, SS2: 60, SS3: 65, SS4: 70, SS5: 60, SS6: 65 },
        recommendations: ["HS3: ฝึกค้นงานวิจัยใน Google Scholar", "SS2: ลองใช้ Notion วางแผนงาน"],
      })
    }
  });
  Logger.log("Done — ตรวจสอบ sheet Assessment_Results ได้เลย");
}
