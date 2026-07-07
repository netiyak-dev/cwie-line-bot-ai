/**
 * handlers/assessment.ts — ส่งคำถามและจัดการคำตอบ
 */
import type { messagingApi } from '@line/bot-sdk';
type MessagingApiClient = messagingApi.MessagingApiClient;
import { QUESTIONS, TOTAL } from '../questions';
import { getSession, upsertSession } from '../session';
import { showResults } from './results';

/**
 * ส่งคำถามข้อที่ index
 * @param replyToken - null = ใช้ pushMessage
 */
export async function sendQuestion(
  client: MessagingApiClient,
  replyToken: string | null,
  lineUserId: string,
  index: number,
): Promise<void> {
  if (index >= TOTAL) {
    const session = await getSession(lineUserId);
    if (!session) return;
    await showResults(client, replyToken, lineUserId, session.studentIdHash!, session.answers);
    return;
  }

  const q = QUESTIONS[index];
  const skillGroup = q.skillId.startsWith('H') ? 'Hard' : 'Soft';
  const progressText = `ข้อ ${index + 1}/${TOTAL} | ${skillGroup}: ${q.skillId}`;

  const message = {
    type: 'text' as const,
    text: `${progressText}\n\n${q.text}`,
    quickReply: {
      items: q.options.map((opt) => ({
        type: 'action' as const,
        action: {
          type: 'postback' as const,
          label: opt.label,
          data: `action=answer&qid=${q.id}&value=${opt.value}`,
          displayText: opt.label,
        },
      })),
    },
  };

  if (replyToken) {
    await client.replyMessage({ replyToken, messages: [message] });
  } else {
    await client.pushMessage({ to: lineUserId, messages: [message] });
  }
}

/**
 * จัดการเมื่อนักศึกษาตอบคำถาม (postback: action=answer)
 */
export async function handleAnswer(
  client: MessagingApiClient,
  replyToken: string,
  lineUserId: string,
  qid: string,
  value: string,
): Promise<void> {
  const session = await getSession(lineUserId);
  if (!session || session.state !== 'assessing') {
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'พิมพ์ "ประเมิน" เพื่อเริ่มต้นใหม่นะ 😊' }],
    });
    return;
  }

  const answers = { ...session.answers, [qid]: parseInt(value, 10) };
  const nextIndex = session.currentQuestion + 1;

  await upsertSession({
    ...session,
    lineUserId,
    state: nextIndex >= TOTAL ? 'completing' : 'assessing',
    currentQuestion: nextIndex,
    answers,
  });

  await sendQuestion(client, replyToken, lineUserId, nextIndex);
}

/**
 * Resume การทำแบบประเมินที่ค้างไว้
 */
export async function resumeAssessment(
  client: MessagingApiClient,
  replyToken: string,
  lineUserId: string,
): Promise<boolean> {
  const session = await getSession(lineUserId);
  if (!session || session.state !== 'assessing') return false;

  const idx = session.currentQuestion;
  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: `น้องทำค้างไว้ที่ข้อ ${idx + 1}/${TOTAL} นะ ไปต่อกันเลย! 💪`,
      },
    ],
  });

  await sendQuestion(client, null, lineUserId, idx);
  return true;
}
