/**
 * handlers/id.ts — รับและ validate รหัสนักศึกษา
 * ถ้าเคยทำมาก่อน → state: returning + แสดงตัวเลือก
 * ถ้าใหม่ → state: assessing → เริ่มประเมินทันที
 */
import type { messagingApi } from '@line/bot-sdk';
type MessagingApiClient = messagingApi.MessagingApiClient;
import { isValidStudentId, hashStudentId } from '../hash';
import { upsertSession } from '../session';
import type { Session } from '../session';
import { sendQuestion } from './assessment';
import { getAssessmentHistory } from '../store';

function formatThaiDate(iso: string): string {
  const d = new Date(iso);
  const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${thMonths[d.getMonth()]} ${(d.getFullYear() + 543).toString().slice(2)}`;
}

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
  const history = await getAssessmentHistory(hash);

  // นักศึกษาเคยทำมาก่อน → ให้เลือกทำใหม่หรือดูความก้าวหน้า
  if (history.length > 0) {
    await upsertSession({ ...session, lineUserId, state: 'returning', studentIdHash: hash });

    const last = history[history.length - 1];
    const lastDate = formatThaiDate(last.assessmentAt);

    await client.replyMessage({
      replyToken,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: [{
        type: 'flex',
        altText: 'AGSP: น้องเคยทำแบบประเมินมาก่อนแล้ว',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box', layout: 'vertical', backgroundColor: '#003F88', paddingAll: '16px',
            contents: [
              { type: 'text', text: '👋 ยินดีต้อนรับกลับมา!', color: '#FFFFFF', size: 'lg', weight: 'bold' },
              { type: 'text', text: `ทำแบบประเมินมาแล้ว ${history.length} ครั้ง | ล่าสุด ${lastDate}`, color: '#C9A227', size: 'sm', wrap: true },
            ],
          },
          body: {
            type: 'box', layout: 'vertical', paddingAll: '16px',
            contents: [
              { type: 'text', text: `ผลล่าสุด: Hard ${last.hardScore}% | Soft ${last.softScore}%`, size: 'sm', color: '#333333', wrap: true },
              { type: 'text', text: 'น้องต้องการทำอะไรต่อ?', size: 'sm', color: '#555555', margin: 'md' },
            ],
          },
          footer: {
            type: 'box', layout: 'vertical', spacing: 'sm', paddingAll: '12px',
            contents: [
              {
                type: 'button', style: 'primary', color: '#003F88', height: 'sm',
                action: { type: 'postback', label: '📈 ดูความก้าวหน้า', data: 'action=view_previous', displayText: 'ดูความก้าวหน้าของฉัน' },
              },
              {
                type: 'button', style: 'secondary', height: 'sm',
                action: { type: 'postback', label: '🔄 ทำแบบประเมินใหม่', data: 'action=start_new', displayText: 'ทำแบบประเมินใหม่' },
              },
            ],
          },
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any],
    });
    return;
  }

  // นักศึกษาใหม่ — เริ่มประเมินทันที
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
