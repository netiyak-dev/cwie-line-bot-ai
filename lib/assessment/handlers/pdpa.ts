/**
 * handlers/pdpa.ts — PDPA consent flow
 */
import type { messagingApi } from '@line/bot-sdk';
type MessagingApiClient = messagingApi.MessagingApiClient;
import { upsertSession } from '../session';
import type { Session } from '../session';
import { buildPdpaFlex } from '../flex/pdpa';

export async function sendPdpaCard(
  client: MessagingApiClient,
  replyToken: string,
  lineUserId: string,
  _session: Session,
): Promise<void> {
  await upsertSession({
    lineUserId,
    state: 'pdpa_pending',
    studentIdHash: null,
    pdpaConsent: false,
    consentTimestamp: null,
    currentQuestion: 0,
    answers: {},
  });

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: 'สวัสดีน้อง 👋 AGSP ยินดีช่วยน้องประเมินทักษะ!\n\nก่อนเริ่ม ขอให้น้องอ่านและยืนยัน PDPA ด้านล่างก่อนนะ',
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      buildPdpaFlex() as any,
    ],
  });
}

export async function handleAccept(
  client: MessagingApiClient,
  replyToken: string,
  lineUserId: string,
  session: Session,
): Promise<void> {
  await upsertSession({
    ...session,
    lineUserId,
    state: 'id_input',
    pdpaConsent: true,
    consentTimestamp: new Date().toISOString(),
  });

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: '✅ ขอบคุณที่ยืนยัน AGSP จะรักษาข้อมูลน้องอย่างปลอดภัย 🔒\n\nกรุณาพิมพ์ รหัสนักศึกษา 7 หลัก ของน้องเลยนะ\nเช่น 6750001',
      },
    ],
  });
}

export async function handleDecline(
  client: MessagingApiClient,
  replyToken: string,
  lineUserId: string,
  session: Session,
): Promise<void> {
  await upsertSession({
    ...session,
    lineUserId,
    state: 'idle',
  });

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: 'เข้าใจนะ 😊 น้องสามารถกลับมาประเมินได้เมื่อพร้อม\n\nพิมพ์ "ประเมิน" ได้เลยตอนที่น้องสะดวก 🌾',
      },
    ],
  });
}
