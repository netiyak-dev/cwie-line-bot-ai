/**
 * route.ts — Unified LINE webhook
 *
 * Flow:
 *   1. verify signature
 *   2. parse events (text, postback, follow)
 *   3. route ตาม session state:
 *      - assessment keywords / postback / assessing state → assessment handlers
 *      - text ทั่วไป (idle) → Gemini FAQ
 *   4. return 200 ทันที
 */
import { NextRequest, NextResponse } from "next/server";
import type {
  WebhookEvent,
  MessageEvent,
  TextEventMessage,
  PostbackEvent,
  FollowEvent,
} from "@line/bot-sdk";
import { lineClient, validateSignature } from "@/lib/line";
import { getFAQ } from "@/lib/sheet";
import {
  askGemini,
  DEFAULT_REPLY,
  SYSTEM_BUSY_REPLY,
  isOverloadError,
} from "@/lib/gemini";
import { logQuestion } from "@/lib/log";
import type { GeminiResult } from "@/types";

// ── Assessment imports ────────────────────────────────────────────────────────
import { getSession, upsertSession, defaultSession } from "@/lib/assessment/session";
import { sendPdpaCard, handleAccept, handleDecline } from "@/lib/assessment/handlers/pdpa";
import { handleStudentId } from "@/lib/assessment/handlers/id";
import { handleAnswer, resumeAssessment, sendQuestion } from "@/lib/assessment/handlers/assessment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20; // เพิ่มจาก 10 → 20 รองรับ assessment flow

const channelSecret = process.env.LINE_CHANNEL_SECRET ?? "";
const GEMINI_TIMEOUT_MS = 8000;

/** คำที่เริ่ม assessment flow */
const ASSESSMENT_KEYWORDS = ["ประเมิน", "assessment", "skill", "ทักษะ", "เริ่ม", "start", "สวัสดี", "hello", "hi"];

type TextMessageEvent = MessageEvent & { message: TextEventMessage };

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const signature = req.headers.get("x-line-signature");
    const body = await req.text();

    // DEBUG: ลบออกหลัง fix สำเร็จ
    console.log("[debug] channelSecret length:", channelSecret.length);
    console.log("[debug] signature present:", !!signature);
    console.log("[debug] body length:", body.length);
    const sigValid = validateSignature(body, channelSecret, signature ?? "");
    console.log("[debug] validateSignature result:", sigValid);

    if (!signature || !channelSecret || !sigValid) {
      console.error("[debug] 401 reason — no signature:", !signature, "| no secret:", !channelSecret, "| sig invalid:", !sigValid);
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const events: WebhookEvent[] = JSON.parse(body).events ?? [];
    await Promise.all(events.map(handleEvent));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[line-webhook] fatal error:", err);
    return NextResponse.json({ ok: false });
  }
}

// ── Main router ───────────────────────────────────────────────────────────────

async function handleEvent(event: WebhookEvent): Promise<void> {
  const lineUserId = event.source?.userId;
  if (!lineUserId) return;

  if (event.type === "follow") {
    await handleFollowEvent(event as FollowEvent);
    return;
  }

  if (event.type === "postback") {
    await handlePostbackEvent(event as PostbackEvent, lineUserId);
    return;
  }

  if (event.type === "message" && (event as MessageEvent).message?.type === "text") {
    await handleTextEvent(event as TextMessageEvent, lineUserId);
  }
}

// ── Follow ────────────────────────────────────────────────────────────────────

async function handleFollowEvent(event: FollowEvent): Promise<void> {
  await lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: "สวัสดีน้อง 👋 ยินดีต้อนรับสู่ AGSP!\n\nAGSP ช่วยได้ 2 อย่าง:\n🌾 ตอบคำถามเรื่อง KAAG474 Senior Project\n📊 ประเมินทักษะ Hard Skill / Soft Skill\n\nพิมพ์ \"ประเมิน\" เพื่อเริ่มประเมินทักษะ หรือถามเรื่อง Senior Project ได้เลย!",
      },
    ],
  });
}

// ── Postback ──────────────────────────────────────────────────────────────────

async function handlePostbackEvent(event: PostbackEvent, lineUserId: string): Promise<void> {
  const params = new URLSearchParams(event.postback.data);
  const action = params.get("action");
  const { replyToken } = event;
  const session = (await getSession(lineUserId)) ?? defaultSession(lineUserId);

  switch (action) {
    case "pdpa_accept":
      await handleAccept(lineClient, replyToken, lineUserId, session);
      break;

    case "pdpa_decline":
      await handleDecline(lineClient, replyToken, lineUserId, session);
      break;

    case "answer": {
      const qid = params.get("qid");
      const value = params.get("value");
      if (qid && value) await handleAnswer(lineClient, replyToken, lineUserId, qid, value);
      break;
    }

    case "start_new":
      await upsertSession({ ...session, lineUserId, state: "assessing", currentQuestion: 0, answers: {} });
      await lineClient.replyMessage({ replyToken, messages: [{ type: "text", text: "เริ่มใหม่เลย! 💪 มี 23 ข้อ ตอบตามความจริงนะ" }] });
      await sendQuestion(lineClient, null, lineUserId, 0);
      break;

    case "view_previous":
      await lineClient.replyMessage({
        replyToken,
        messages: [{ type: "text", text: "ฟีเจอร์ดูผลเดิมกำลังพัฒนา 🔧\nพิมพ์ \"ประเมิน\" เพื่อทำใหม่ได้เลย" }],
      });
      break;

    case "export_pdf":
      await lineClient.replyMessage({
        replyToken,
        messages: [{ type: "text", text: "📄 Export PDF จะพร้อมเร็วๆ นี้!\nตอนนี้สามารถ screenshot ได้เลยนะ" }],
      });
      break;

    case "followup_optin":
      await lineClient.replyMessage({
        replyToken,
        messages: [{ type: "text", text: "🔔 AGSP จะแจ้งเตือนน้องใน 2 สัปดาห์\nพิมพ์ \"ยกเลิกการแจ้งเตือน\" เมื่อไรก็ได้นะ" }],
      });
      break;

    default:
      console.warn("[line-webhook] unknown postback:", action);
  }
}

// ── Text message ──────────────────────────────────────────────────────────────

async function handleTextEvent(event: TextMessageEvent, lineUserId: string): Promise<void> {
  const { replyToken } = event;
  const text = event.message.text.trim();
  const lower = text.toLowerCase();
  const session = (await getSession(lineUserId)) ?? defaultSession(lineUserId);

  // Opt-out
  if (lower === "ยกเลิกการแจ้งเตือน" || lower === "unsubscribe") {
    await upsertSession({ ...session, lineUserId, state: "idle" });
    await lineClient.replyMessage({ replyToken, messages: [{ type: "text", text: "AGSP ยกเลิกการแจ้งเตือนให้แล้ว 👍" }] });
    return;
  }

  // Route by session state
  switch (session.state) {
    case "id_input":
      await handleStudentId(lineClient, replyToken, lineUserId, session, text);
      return;

    case "assessing":
      await lineClient.replyMessage({ replyToken, messages: [{ type: "text", text: "กรุณาเลือกคำตอบจากปุ่มด้านล่างนะ 👇" }] });
      await sendQuestion(lineClient, null, lineUserId, session.currentQuestion);
      return;

    case "pdpa_pending":
      await lineClient.replyMessage({ replyToken, messages: [{ type: "text", text: "กรุณากดปุ่ม \"ยินยอม\" หรือ \"ไม่ยินยอม\" บนการ์ดด้านบนนะ 😊" }] });
      return;

    case "returning":
      await lineClient.replyMessage({ replyToken, messages: [{ type: "text", text: "กรุณาเลือกจากปุ่มด้านบนนะ — ทำใหม่หรือดูผลเดิม 😊" }] });
      return;

    default: {
      // Assessment keywords
      if (ASSESSMENT_KEYWORDS.some((k) => lower.includes(k))) {
        await sendPdpaCard(lineClient, replyToken, lineUserId, session);
        return;
      }

      // Gemini FAQ
      await handleFaqMessage(replyToken, text);
    }
  }
}

// ── Gemini FAQ ────────────────────────────────────────────────────────────────

async function handleFaqMessage(replyToken: string, userText: string): Promise<void> {
  let replyText: string;
  let finishReason: string;
  let result: GeminiResult | null = null;

  try {
    const faq = await getFAQ();
    result = await withTimeout(askGemini(userText, faq), GEMINI_TIMEOUT_MS);
    replyText = result?.reply ?? DEFAULT_REPLY;
    finishReason = result?.finishReason ?? "TIMEOUT";
  } catch (err) {
    const overloaded = isOverloadError(err);
    console.error("[line-webhook] askGemini error:", err);
    replyText = overloaded ? SYSTEM_BUSY_REPLY : DEFAULT_REPLY;
    finishReason = overloaded ? "OVERLOAD_503" : "ERROR";
  }

  console.log({ userMessage: userText, finishReason, replyLength: replyText.length });

  try {
    await lineClient.replyMessage({ replyToken, messages: [{ type: "text", text: replyText }] });
  } catch (replyErr) {
    console.warn("[line-webhook] reply failed:", replyErr);
  }

  await logQuestion({
    question: userText,
    reply: replyText,
    finishReason,
    answered: replyText !== DEFAULT_REPLY && replyText !== SYSTEM_BUSY_REPLY,
  });
}

/** race promise กับ timeout — คืน null เมื่อช้าเกิน ms */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([p, new Promise<null>((resolve) => setTimeout(() => resolve(null), ms))]);
}
