'use strict';

const { isValidStudentId, hashStudentId } = require('../utils/hash');
const { upsertSession, countAssessments, getLastAssessment } = require('../db');
const { sendQuestion } = require('./assessment');

/**
 * จัดการ input รหัสนักศึกษา
 */
async function handleStudentId(client, replyToken, lineUserId, text) {
  const input = text.trim();

  // validate format
  if (!isValidStudentId(input)) {
    await client.replyMessage({
      replyToken,
      messages: [{
        type: 'text',
        text: '⚠️ รหัสนักศึกษาต้องเป็นตัวเลข 8 หลักนะ เช่น 66500001\n\nลองใส่ใหม่ได้เลย 😊',
      }],
    });
    return;
  }

  const hash = hashStudentId(input);
  const prevCount = countAssessments(hash);

  // อัปเดต session: บันทึก student_id_hash แล้วถามต่อ
  await upsertSession({
    line_user_id:      lineUserId,
    state:             prevCount > 0 ? 'returning' : 'assessing',
    student_id_hash:   hash,
    pdpa_consent:      1,
    consent_timestamp: new Date().toISOString(),
    current_question:  0,
    answers:           '{}',
  });

  if (prevCount > 0) {
    // นักศึกษาเคยทำมาแล้ว → ถามว่าจะทำใหม่หรือดูผลเดิม
    const last = getLastAssessment(hash);
    const lastDate = last ? new Date(last.taken_at).toLocaleDateString('th-TH') : '-';

    await client.replyMessage({
      replyToken,
      messages: [{
        type: 'text',
        text: `น้องเคยทำแบบประเมินแล้ว ${prevCount} ครั้ง (ล่าสุด: ${lastDate}) 📋\n\nน้องต้องการอะไร?`,
        quickReply: {
          items: [
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '🔄 ทำแบบประเมินใหม่',
                data: 'action=start_new',
                displayText: 'ทำแบบประเมินใหม่',
              },
            },
            {
              type: 'action',
              action: {
                type: 'postback',
                label: '📊 ดูผลเดิม',
                data: 'action=view_previous',
                displayText: 'ดูผลการประเมินครั้งก่อน',
              },
            },
          ],
        },
      }],
    });
  } else {
    // นักศึกษาใหม่ → เริ่มประเมินทันที
    await client.replyMessage({
      replyToken,
      messages: [{
        type: 'text',
        text: '🎉 ได้เลย! เริ่มแบบประเมินเลยนะ\n\nมีทั้งหมด 23 ข้อ แบ่งเป็น Hard Skill 11 ข้อ และ Soft Skill 12 ข้อ\nตอบตามความเป็นจริงของน้องเลย ไม่มีผิดถูก 😊\n\n💡 ถ้าออกไปกลางทาง กลับมาต่อได้ภายใน 24 ชั่วโมง',
      }],
    });

    // ส่งคำถามแรก
    await sendQuestion(client, null, lineUserId, 0, true);
  }
}

module.exports = { handleStudentId };
