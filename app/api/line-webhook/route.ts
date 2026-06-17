/**
 * route.ts — entry point ของ LINE webhook
 *
 * Flow (ตามบรีฟส่วนที่ 4):
 *   1. อ่าน raw body + x-line-signature
 *   2. verify signature ด้วย LINE_CHANNEL_SECRET → ไม่ผ่าน return 401
 *   3. parse events[]
 *   4. filter เฉพาะ message event ที่เป็น text
 *   5. ทุก event (parallel): getFAQ → askGemini (มี timeout guard) → reply
 *   6. return 200 ให้ LINE
 *
 * ทั้ง handler ห่อด้วย try-catch ชั้นนอกสุด กัน function crash แบบไม่มี log
 */
import { NextRequest, NextResponse } from "next/server";
import type {
  WebhookEvent,
  MessageEvent,
  TextEventMessage,
} from "@line/bot-sdk";
import { lineClient, validateSignature } from "@/lib/line";
import { getFAQ } from "@/lib/sheet";
import { askGemini, DEFAULT_REPLY } from "@/lib/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";

/** LINE บังคับ reply ภายใน ~10 วิ — กัน Gemini ช้าเกินด้วย timeout 8 วิ */
const GEMINI_TIMEOUT_MS = 8000;

type TextMessageEvent = MessageEvent & { message: TextEventMessage };

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const signature = req.headers.get("x-line-signature");
    const body = await req.text(); // ต้องเป็น raw body เพื่อ verify signature

    // verify signature
    if (
      !signature ||
      !channelSecret ||
      !validateSignature(body, channelSecret, signature)
    ) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const events: WebhookEvent[] = JSON.parse(body).events ?? [];

    const textEvents = events.filter(
      (e): e is TextMessageEvent =>
        e.type === "message" && e.message.type === "text",
    );

    // ตอบทุก event แบบ parallel
    await Promise.all(textEvents.map(handleTextEvent));

    return NextResponse.json({ ok: true });
  } catch (err) {
    // กัน 500 แบบไม่มี log — ตอบ 200 ไม่ให้ LINE retry ถล่มเพราะบั๊กเรา
    console.error("[line-webhook] fatal error:", err);
    return NextResponse.json({ ok: false });
  }
}

async function handleTextEvent(event: TextMessageEvent): Promise<void> {
  const { replyToken } = event;
  const userText = event.message.text;

  try {
    const faq = await getFAQ();

    // timeout guard: ช้าเกิน 8 วิ → null → fallback DEFAULT_REPLY
    const result = await withTimeout(askGemini(userText, faq), GEMINI_TIMEOUT_MS);
    const replyText = result?.reply ?? DEFAULT_REPLY;

    console.log({
      userMessage: userText,
      finishReason: result?.finishReason ?? "TIMEOUT",
      thoughtsTokenCount: result?.thoughtsTokenCount,
      candidatesTokenCount: result?.candidatesTokenCount,
      replyLength: replyText.length,
    });

    await lineClient.replyMessage({
      replyToken,
      messages: [{ type: "text", text: replyText }],
    });
  } catch (err) {
    // Gemini error / reply error — log แล้วพยายามตอบ default (ไม่ throw ต่อ)
    console.error("[line-webhook] handleTextEvent error:", err);
    try {
      await lineClient.replyMessage({
        replyToken,
        messages: [{ type: "text", text: DEFAULT_REPLY }],
      });
    } catch (replyErr) {
      // replyToken อาจหมดอายุ/ใช้ซ้ำ — log เป็น warning ไม่ critical
      console.warn("[line-webhook] reply failed:", replyErr);
    }
  }
}

/** race promise กับ timeout — คืน null เมื่อช้าเกิน ms */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}
