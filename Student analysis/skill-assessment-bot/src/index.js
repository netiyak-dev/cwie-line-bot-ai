'use strict';
require('dotenv').config();

const express  = require('express');
const line     = require('@line/bot-sdk');

// ── Config ────────────────────────────────────────────────────────────────────
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret:      process.env.LINE_CHANNEL_SECRET,
};

if (!lineConfig.channelAccessToken || !lineConfig.channelSecret) {
  console.error('❌ LINE_CHANNEL_ACCESS_TOKEN และ LINE_CHANNEL_SECRET ต้องตั้งค่าใน .env');
  process.exit(1);
}

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: lineConfig.channelAccessToken,
});

// ── Handlers ──────────────────────────────────────────────────────────────────
const { getSession, upsertSession } = require('./db');
const { sendPdpaCard, handleAccept, handleDecline } = require('./handlers/pdpa');
const { handleStudentId } = require('./handlers/id');
const { handleAnswer, resumeAssessment, sendQuestion } = require('./handlers/assessment');
const { showPreviousResults } = require('./handlers/results');

// ── Trigger keywords ──────────────────────────────────────────────────────────
const START_KEYWORDS = ['ประเมิน', 'assessment', 'skill', 'ทักษะ', 'เริ่ม', 'start', 'สวัสดี', 'hello', 'hi'];

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();

// Health check
app.get('/', (_req, res) => res.json({ status: 'ok', service: 'AGSP Skill Assessment Bot' }));

// Webhook
app.post(
  '/webhook',
  line.middleware(lineConfig),
  async (req, res) => {
    res.sendStatus(200); // ตอบ LINE ทันที
    try {
      await Promise.all(req.body.events.map(handleEvent));
    } catch (err) {
      console.error('Webhook error:', err);
    }
  }
);

// ── Event router ──────────────────────────────────────────────────────────────
async function handleEvent(event) {
  const { type, replyToken, source } = event;
  const lineUserId = source?.userId;
  if (!lineUserId) return;

  // โหลด session
  const session = getSession(lineUserId) || {
    line_user_id: lineUserId,
    state: 'idle',
    student_id_hash: null,
    pdpa_consent: 0,
    consent_timestamp: null,
    current_question: 0,
    answers: '{}',
  };

  // ── Text message ─────────────────────────────────────────────────────────────
  if (type === 'message' && event.message?.type === 'text') {
    const text = event.message.text.trim();
    const lower = text.toLowerCase();

    // คำสั่ง opt-out
    if (lower === 'ยกเลิกการแจ้งเตือน' || lower === 'unsubscribe') {
      await upsertSession({
        ...session,
        line_user_id: lineUserId,
        state: 'idle',
        answers: '{}',
        current_question: 0,
      });
      await client.replyMessage({
        replyToken,
        messages: [{ type: 'text', text: 'AGSP ยกเลิกการแจ้งเตือนให้แล้ว 👍 ถ้าอยากกลับมาประเมินใหม่ พิมพ์ "ประเมิน" ได้เลย' }],
      });
      return;
    }

    switch (session.state) {
      // รอรหัสนักศึกษา
      case 'id_input':
        await handleStudentId(client, replyToken, lineUserId, text);
        return;

      // กำลังทำแบบประเมิน (พิมพ์ข้อความแทนกดปุ่ม)
      case 'assessing':
        await client.replyMessage({
          replyToken,
          messages: [{ type: 'text', text: 'กรุณาเลือกคำตอบจากปุ่มด้านล่างนะ 👇' }],
        });
        // resend คำถามปัจจุบัน
        await sendQuestion(client, null, lineUserId, session.current_question, true);
        return;

      // session ค้างจากครั้งก่อน (ยังทำไม่เสร็จ)
      default:
        // ถ้าค้างอยู่ที่ assessing ให้ resume
        if (session.state === 'assessing' && session.current_question > 0) {
          if (await resumeAssessment(client, replyToken, lineUserId)) return;
        }

        // trigger keywords → เริ่ม flow ใหม่
        if (START_KEYWORDS.some((k) => lower.includes(k))) {
          await sendPdpaCard(client, replyToken, lineUserId, session);
          return;
        }

        // default response
        await client.replyMessage({
          replyToken,
          messages: [{
            type: 'text',
            text: 'สวัสดีน้อง 👋 พิมพ์ "ประเมิน" เพื่อเริ่มประเมินทักษะได้เลย 🌾',
          }],
        });
    }
    return;
  }

  // ── Postback ─────────────────────────────────────────────────────────────────
  if (type === 'postback') {
    const params = new URLSearchParams(event.postback.data);
    const action = params.get('action');

    switch (action) {
      // PDPA
      case 'pdpa_accept':
        await handleAccept(client, replyToken, lineUserId, session);
        break;
      case 'pdpa_decline':
        await handleDecline(client, replyToken, lineUserId, session);
        break;

      // คำตอบแบบประเมิน
      case 'answer': {
        const qid   = params.get('qid');
        const value = params.get('value');
        await handleAnswer(client, replyToken, lineUserId, qid, value);
        break;
      }

      // นักศึกษา returning: เริ่มใหม่
      case 'start_new':
        await upsertSession({
          ...session,
          line_user_id:     lineUserId,
          state:            'assessing',
          current_question: 0,
          answers:          '{}',
        });
        await client.replyMessage({
          replyToken,
          messages: [{ type: 'text', text: 'เริ่มต้นใหม่เลย! 💪 มีทั้งหมด 23 ข้อ ตอบตามความจริงนะ' }],
        });
        await sendQuestion(client, null, lineUserId, 0, true);
        break;

      // นักศึกษา returning: ดูผลเดิม
      case 'view_previous':
        await showPreviousResults(client, replyToken, lineUserId, session.student_id_hash);
        break;

      // Export PDF (placeholder)
      case 'export_pdf':
        await client.replyMessage({
          replyToken,
          messages: [{
            type: 'text',
            text: '📄 ฟีเจอร์ Export PDF จะพร้อมใช้งานเร็วๆ นี้ นะ!\n\nตอนนี้น้องสามารถ screenshot ผลการประเมินได้เลย',
          }],
        });
        break;

      // Follow-up opt-in (placeholder)
      case 'followup_optin':
        await client.replyMessage({
          replyToken,
          messages: [{
            type: 'text',
            text: '🔔 AGSP จะส่งการแจ้งเตือนให้น้องตรวจสอบความก้าวหน้าใน 2 สัปดาห์ข้างหน้า\n\nถ้าต้องการยกเลิก พิมพ์ "ยกเลิกการแจ้งเตือน" ได้เลย',
          }],
        });
        break;

      default:
        console.warn('Unknown postback action:', action);
    }
    return;
  }

  // ── Follow (เพิ่มเป็น friend) ─────────────────────────────────────────────────
  if (type === 'follow') {
    await client.replyMessage({
      replyToken,
      messages: [{
        type: 'text',
        text: 'สวัสดีน้อง 👋 ยินดีต้อนรับสู่ AGSP!\n\nAGSP จะช่วยให้น้องรู้จักตัวเองมากขึ้น ผ่านการประเมิน Hard Skill และ Soft Skill ของหลักสูตรวิทยาศาสตร์การเกษตร มหาวิทยาลัยมหิดล 🌾\n\nพิมพ์ "ประเมิน" เพื่อเริ่มได้เลย!',
      }],
    });
  }
}

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AGSP Bot running on port ${PORT}`);
  console.log(`📡 Webhook URL: http://localhost:${PORT}/webhook`);
});
