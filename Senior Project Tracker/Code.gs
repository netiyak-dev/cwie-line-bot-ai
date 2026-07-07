/**
 * Code.gs — Entry point ของ Apps Script backend
 * Senior Project Tracker
 *
 * วิธีใช้: copy เนื้อหาไฟล์นี้ไปวางใน Apps Script editor (ไฟล์ Code.gs)
 * แล้ว deploy เป็น Web App (Execute as: Me, Who has access: Anyone)
 *
 * กฎสำคัญ (ดู docs/CLAUDE.md):
 * - ห้าม hardcode token/secret ในไฟล์นี้ ใช้ PropertiesService เท่านั้น
 * - Advisor ต้องเห็นแค่ลูกศิษย์ตัวเอง (filter by advisor_id)
 */

const SHEET_ID = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
const LINE_CHANNEL_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
const ANTHROPIC_API_KEY = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');

function getSheet_(name) {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(name);
}

/**
 * แปลง sheet เป็น array of object โดยใช้แถวแรกเป็น header
 */
function sheetToObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

/**
 * Web App entry point — GET
 * ตัวอย่าง:
 *   ?action=getDashboard&role=student&line_user_id=xxxx
 *   ?action=getDashboard&role=advisor&line_user_id=xxxx
 *   ?action=getDashboard&role=admin
 */
function doGet(e) {
  const action = e.parameter.action;
  let result;

  try {
    if (action === 'getDashboard') {
      result = getDashboard_(e.parameter.role, e.parameter.line_user_id);
    } else if (action === 'getRecommendation') {
      result = getRecommendation_(e.parameter.line_user_id);
    } else if (action === 'checkAssessmentStatus') {
      result = { completed: hasCompletedAssessment_(e.parameter.line_user_id) };
    } else {
      result = { error: 'unknown action' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web App entry point — POST
 * ใช้สำหรับ submitAssessment (เพราะเป็นการส่งข้อมูลเข้าระบบ ไม่ใช่แค่ขอข้อมูล)
 * Body ตัวอย่าง (JSON):
 *   { "action": "submitAssessment", "line_user_id": "xxxx", "answers": {...} }
 */
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  let result;

  try {
    if (body.action === 'submitAssessment') {
      result = submitAssessment_(body.line_user_id, body.answers);
    } else {
      result = { error: 'unknown action' };
    }
  } catch (err) {
    result = { error: err.message };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * คืนข้อมูล dashboard ตาม role
 * - student: เห็นแค่ assignment/submission ของตัวเอง
 * - advisor: เห็นแค่ลูกศิษย์ของตัวเอง (กรองด้วย advisor_id) — ห้ามตัดขั้นตอนนี้ทิ้ง
 * - admin: เห็นทั้งหมด
 */
function getDashboard_(role, lineUserId) {
  const students = sheetToObjects_('Students');
  const assignments = sheetToObjects_('Assignments');
  const submissions = sheetToObjects_('Submissions');

  if (role === 'student') {
    const student = students.find(s => s.line_user_id === lineUserId);
    if (!student) return { error: 'student not found' };

    // กฎ: ต้องทำแบบประเมินความพร้อมก่อน ถึงจะเข้า Dashboard หลักได้ (ดู PRD.md)
    if (!hasCompletedAssessment_(lineUserId)) {
      return { redirect: 'assessment', message: 'กรุณาทำแบบประเมินความพร้อมก่อนเข้าใช้งาน' };
    }

    const mySubs = submissions.filter(s => s.student_id === student.student_id);
    return { student, assignments, submissions: mySubs };
  }

  if (role === 'advisor') {
    const advisorStudents = students.filter(s => {
      // TODO: join กับแท็บ Advisors เพื่อหา advisor_id จาก line_user_id ก่อน
      return s.advisor_id === lineUserId; // placeholder logic — แก้ตอนเชื่อมจริง
    });
    const studentIds = advisorStudents.map(s => s.student_id);
    const theirSubs = submissions.filter(s => studentIds.includes(s.student_id));
    return { students: advisorStudents, assignments, submissions: theirSubs };
  }

  if (role === 'admin') {
    return { students, assignments, submissions };
  }

  return { error: 'invalid role' };
}

/* ============================================================
 * แบบประเมินความพร้อม + ระบบแนะนำหัวข้องาน/อาจารย์ที่ปรึกษาด้วย AI
 * ============================================================ */

/**
 * เช็คว่า line_user_id นี้ทำแบบประเมินแล้วหรือยัง (เก็บไว้ในแท็บ AssessmentResponses)
 */
function hasCompletedAssessment_(lineUserId) {
  const responses = sheetToObjects_('AssessmentResponses');
  return responses.some(r => r.line_user_id === lineUserId);
}

/**
 * บันทึกผลแบบประเมินของนักศึกษา (เรียกจาก doPost)
 * answers ตัวอย่าง: { lab_skill, writing_skill, interests: [...], interest_note, time_management, hours_per_week }
 */
function submitAssessment_(lineUserId, answers) {
  const sheet = getSheet_('AssessmentResponses');
  sheet.appendRow([
    'resp_' + new Date().getTime(),     // response_id
    lineUserId,                          // line_user_id
    answers.lab_skill,
    answers.writing_skill,
    (answers.interests || []).join(','), // เก็บเป็น comma-separated
    answers.interest_note || '',
    answers.time_management,
    answers.hours_per_week,
    new Date()                           // completed_at
  ]);
  return { success: true };
}

/**
 * ข้อมูล mock อาจารย์ + หัวข้องานที่เปิดรับ
 * TODO: แทนที่ฟังก์ชันนี้ด้วยการอ่านจากแท็บ "AdvisorTopics" จริง เมื่อมีข้อมูลแล้ว
 * (โครงสร้างคอลัมน์ดูได้ใน SheetSchema.md หัวข้อ AdvisorTopics)
 */
function getMockAdvisorTopics_() {
  return [
    { advisor_name: 'ดร. สมหญิง ใจดี', expertise: ['tissue_culture', 'plant_genetics'], topic_title: 'การขยายพันธุ์กล้วยไม้ป่าด้วยเทคนิคเพาะเลี้ยงเนื้อเยื่อ', topic_description: 'งานเน้นปฏิบัติการในห้อง Lab เหมาะกับคนที่มีพื้นฐานทักษะ Lab ดี' },
    { advisor_name: 'ดร. วิชัย เทคโนกิจ', expertise: ['data_software', 'plant_genetics'], topic_title: 'ระบบติดตามการเจริญเติบโตของพืชด้วยข้อมูลเซนเซอร์', topic_description: 'ผสมความรู้พืชกับซอฟต์แวร์ เหมาะกับคนที่สนใจทั้งสองด้าน' },
    { advisor_name: 'ดร. มาลี อาหารดี', expertise: ['food_science', 'microbiology'], topic_title: 'การควบคุมคุณภาพอาหารแปรรูปจากสมุนไพรท้องถิ่น', topic_description: 'เหมาะกับคนสนใจวิทยาศาสตร์การอาหารและงานวิเคราะห์คุณภาพ' },
    { advisor_name: 'ดร. ปิยะ สิ่งแวดล้อมดี', expertise: ['environment', 'microbiology'], topic_title: 'การบำบัดน้ำเสียด้วยจุลินทรีย์จากดิน', topic_description: 'งานวิจัยด้านสิ่งแวดล้อม เหมาะกับคนที่มีเวลาเก็บข้อมูลภาคสนามต่อเนื่อง' }
  ];
}

/**
 * เรียก AI (Claude) วิเคราะห์ผลประเมิน + รายชื่ออาจารย์/หัวข้อ แล้วคืน top 3 พร้อมเหตุผล
 */
function getRecommendation_(lineUserId) {
  const responses = sheetToObjects_('AssessmentResponses');
  const myResponse = responses
    .filter(r => r.line_user_id === lineUserId)
    .pop(); // เอาผลล่าสุด ถ้าทำซ้ำ

  if (!myResponse) return { error: 'ยังไม่พบผลแบบประเมิน' };

  const advisorTopics = getMockAdvisorTopics_(); // TODO: เปลี่ยนเป็นข้อมูลจริงเมื่อพร้อม

  const prompt = buildRecommendationPrompt_(myResponse, advisorTopics);
  return callClaudeForRecommendation_(prompt);
}

function buildRecommendationPrompt_(response, advisorTopics) {
  return `คุณเป็นผู้ช่วยแนะนำหัวข้องานวิจัยและอาจารย์ที่ปรึกษาให้นักศึกษา Senior Project
ผลแบบประเมินของนักศึกษา:
- ทักษะ Lab (1-5): ${response.lab_skill}
- ทักษะเขียนวิชาการ (1-5): ${response.writing_skill}
- ความสนใจ: ${response.interests}
- หมายเหตุเพิ่มเติม: ${response.interest_note}
- วินัย/ความตรงเวลา (1-5): ${response.time_management}
- เวลาที่มีต่อสัปดาห์ (1-4 ระดับ): ${response.hours_per_week}

รายชื่ออาจารย์และหัวข้องานที่เปิดรับ:
${JSON.stringify(advisorTopics, null, 2)}

โปรดเลือก 3 อันดับที่เหมาะสมที่สุด พร้อมเหตุผลสั้นๆ (2-3 บรรทัด) ที่อิงจากผลประเมินจริง
ตอบเป็น JSON array เท่านั้น รูปแบบ:
[{"rank":1,"advisor_name":"...","topic_title":"...","reason":"..."}, ...]`;
}

/**
 * เรียก Anthropic API จาก Apps Script
 * ต้องตั้งค่า ANTHROPIC_API_KEY ใน Script Properties ก่อน
 */
function callClaudeForRecommendation_(prompt) {
  const url = 'https://api.anthropic.com/v1/messages';
  const payload = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  const data = JSON.parse(response.getContentText());
  const text = (data.content || []).map(c => c.text || '').join('');

  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (e) {
    return { error: 'ไม่สามารถแปลงผลลัพธ์จาก AI ได้', raw: text };
  }
}
