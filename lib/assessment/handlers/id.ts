/**
 * handlers/id.ts — รับและ validate รหัสนักศึกษา
 */
import type { messagingApi } from '@line/bot-sdk';
type MessagingApiClient = messagingApi.MessagingApiClient;
import { isValidStudentId, hashStudentId } from '../hash';
import { upsertSession } from '../session';
import type { Session } from '../session';
import { sendQuestion } from './assessment';

export async function handleStudentId(
  client: MessagingApiClient,
  replyToken: string,
  lineUserId: string,
  session: Session,
  text: string,
): Promise<void> {
  const input = text.trim();

  if (!isValidStudentId(input)) {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: 'text',
          text: '⚠️ รหัสนักศึกษาต้องเป็นตัวเลข 7 หลักนะ เช่น 6750001\n\nลองพิมพ์ใหม่ได้เลย 😊',
        },
      ],
    });
    return;
  }

  const hash = hashStudentId(input);

  // อัปเดต session
  await upsertSession({
    ...session,
    lineUserId,
    state: 'assessing',
    studentIdHash: hash,
    currentQuestion: 0,
    answers: {},
  });

  await client.replyMessage({
    replyToken,
    messages: [
      {
        type: 'text',
        text: '🎉 ได้เลย! เริ่มแบบประเมินเลยนะ\n\nมีทั้งหมด 23 ข้อ แบ่งเป็น Hard Skill 11 ข้อ และ Soft Skill 12 ข้อ\nตอบตามความเป็นจริงเลย ไม่มีผิดถูก 😊\n\n💡 ออกไปแล้วกลับมาต่อได้ภายใน 48 ชั่วโมง',
      },
    ],
  });

  // ส่งคำถามแรกด้วย push (เพราะ reply token ใช้แล้ว)
  await sendQuestion(client, null, lineUserId, 0);
}
