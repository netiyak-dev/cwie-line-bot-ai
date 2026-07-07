'use strict';

const { QUESTIONS, TOTAL } = require('../data/questions');
const { upsertSession, getSession } = require('../db');
const { showResults } = require('./results');

/**
 * ส่งคำถามข้อที่ index
 * @param {object} client - LINE client
 * @param {string|null} replyToken - null = ใช้ pushMessage
 * @param {string} lineUserId
 * @param {number} index - index ของคำถาม (0-based)
 * @param {boolean} usePush - ถ้า true ใช้ push แทน reply
 */
async function sendQuestion(client, replyToken, lineUserId, index, usePush = false) {
  if (index >= TOTAL) {
    // ทำครบแล้ว → คำนวณและแสดงผล
    const session = getSession(lineUserId);
    const answers = JSON.parse(session.answers || '{}');
    await showResults(client, replyToken, lineUserId, session.student_id_hash, answers, usePush);
    return;
  }

  const q = QUESTIONS[index];
  const skillGroup = `${q.skillId.startsWith('H') ? 'Hard' : 'Soft'} Skill`;
  const progressText = `ข้อ ${index + 1}/${TOTAL} | ${skillGroup}: ${q.skillId}`;

  const message = {
    type: 'text',
    text: `${progressText}\n\n${q.text}`,
    quickReply: {
      items: q.options.map((opt) => ({
        type: 'action',
        action: {
          type: 'postback',
          label: opt.label,
          data: `action=answer&qid=${q.id}&value=${opt.value}`,
          displayText: opt.label,
        },
      })),
    },
  };

  if (usePush || !replyToken) {
    await client.pushMessage({ to: lineUserId, messages: [message] });
  } else {
    await client.replyMessage({ replyToken, messages: [message] });
  }
}

/**
 * จัดการเมื่อนักศึกษาตอบคำถาม (postback: action=answer)
 */
async function handleAnswer(client, replyToken, lineUserId, qid, value) {
  const session = getSession(lineUserId);
  if (!session || !['assessing', 'id_input'].includes(session.state) && session.state !== 'assessing') {
    // guard: state ไม่ถูกต้อง
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'พิมพ์ "ประเมิน" เพื่อเริ่มต้นใหม่นะ 😊' }],
    });
    return;
  }

  // บันทึกคำตอบ
  const answers = JSON.parse(session.answers || '{}');
  answers[qid] = parseInt(value, 10);

  const nextIndex = session.current_question + 1;

  await upsertSession({
    line_user_id:      lineUserId,
    state:             nextIndex >= TOTAL ? 'completing' : 'assessing',
    student_id_hash:   session.student_id_hash,
    pdpa_consent:      session.pdpa_consent,
    consent_timestamp: session.consent_timestamp,
    current_question:  nextIndex,
    answers:           JSON.stringify(answers),
  });

  // ส่งคำถามถัดไป (หรือแสดงผลถ้าครบแล้ว)
  await sendQuestion(client, replyToken, lineUserId, nextIndex);
}

/**
 * Resume การทำแบบประเมินที่ค้างไว้
 */
async function resumeAssessment(client, replyToken, lineUserId) {
  const session = getSession(lineUserId);
  if (!session || session.state !== 'assessing') return false;

  const idx = session.current_question || 0;
  await client.replyMessage({
    replyToken,
    messages: [{
      type: 'text',
      text: `น้องทำค้างไว้ที่ข้อ ${idx + 1}/${TOTAL} นะ ไปต่อกันเลย! 💪`,
    }],
  });

  await sendQuestion(client, null, lineUserId, idx, true);
  return true;
}

module.exports = { sendQuestion, handleAnswer, resumeAssessment };
