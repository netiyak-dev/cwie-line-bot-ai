'use strict';

const { buildPdpaFlex } = require('../flex/pdpa');
const { upsertSession } = require('../db');

/**
 * ส่ง PDPA card และเปลี่ยน state เป็น pdpa_pending
 */
async function sendPdpaCard(client, replyToken, lineUserId, session) {
  await upsertSession({
    line_user_id:      lineUserId,
    state:             'pdpa_pending',
    student_id_hash:   session?.student_id_hash ?? null,
    pdpa_consent:      0,
    consent_timestamp: null,
    current_question:  0,
    answers:           '{}',
  });

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: 'สวัสดีน้อง 👋 AGSP จะช่วยให้น้องรู้จักตัวเองมากขึ้น ผ่านการประเมิน Hard Skill และ Soft Skill ของหลักสูตรวิทยาศาสตร์การเกษตร มหิดล 🌾\n\nก่อนเริ่ม ขอให้น้องอ่านและยืนยันข้อตกลงด้านล่างก่อนนะ',
      },
      buildPdpaFlex(),
    ],
  });
}

/**
 * จัดการเมื่อกด "ยอมรับ"
 */
async function handleAccept(client, replyToken, lineUserId, session) {
  await upsertSession({
    line_user_id:      lineUserId,
    state:             'id_input',
    student_id_hash:   session?.student_id_hash ?? null,
    pdpa_consent:      1,
    consent_timestamp: new Date().toISOString(),
    current_question:  0,
    answers:           '{}',
  });

  await client.replyMessage({
    replyToken,
    messages: [{
      type: 'text',
      text: '✅ ขอบคุณที่ยืนยันนะ!\n\nกรอกรหัสนักศึกษาของน้องได้เลย (ตัวเลข 8 หลัก)\n\n🔒 AGSP จะเก็บรหัสในรูปแบบเข้ารหัสเท่านั้น ไม่สามารถระบุตัวตนได้',
    }],
  });
}

/**
 * จัดการเมื่อกด "ไม่ยอมรับ"
 */
async function handleDecline(client, replyToken, lineUserId, session) {
  await upsertSession({
    line_user_id:      lineUserId,
    state:             'idle',
    student_id_hash:   session?.student_id_hash ?? null,
    pdpa_consent:      0,
    consent_timestamp: null,
    current_question:  0,
    answers:           '{}',
  });

  await client.replyMessage({
    replyToken,
    messages: [{
      type: 'text',
      text: 'ไม่เป็นไรนะ 😊 ถ้าน้องเปลี่ยนใจเมื่อไร พิมพ์ "ประเมิน" มาได้เลย AGSP ยังอยู่ที่นี่เสมอ',
    }],
  });
}

module.exports = { sendPdpaCard, handleAccept, handleDecline };
