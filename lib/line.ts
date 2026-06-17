/**
 * line.ts — wrapper รอบ @line/bot-sdk
 *
 * - เก็บ MessagingApiClient ไว้ที่เดียว (route นำไปใช้ต่อ)
 * - helper replyText() / pushText() สำหรับส่งข้อความล้วน
 * - re-export validateSignature เพื่อให้ route ใช้ verify signature
 */
import { messagingApi, validateSignature } from "@line/bot-sdk";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";

export const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken,
});

/** ตอบกลับด้วย replyToken (ใช้ได้ครั้งเดียว, หมดอายุไว) */
export async function replyText(
  replyToken: string,
  text: string,
): Promise<void> {
  await lineClient.replyMessage({
    replyToken,
    messages: [{ type: "text", text }],
  });
}

/** ส่ง push หา user โดยตรง (เผื่อใช้ภายหลัง — ไม่ผูกกับ replyToken) */
export async function pushText(to: string, text: string): Promise<void> {
  await lineClient.pushMessage({
    to,
    messages: [{ type: "text", text }],
  });
}

export { validateSignature };
