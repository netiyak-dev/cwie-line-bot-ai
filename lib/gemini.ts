/**
 * gemini.ts — เรียก Gemini ผ่าน @google/genai
 *
 * - สร้าง system prompt ตามบรีฟ (ส่วนที่ 3): <faq> มาก่อน <question> เสมอ
 * - ไม่ตั้ง temperature (ปล่อย default ตามคำแนะนำ Google สำหรับ Gemini 3.x)
 * - maxOutputTokens: 1024
 * - เช็ค finishReason: MAX_TOKENS หรือคำตอบว่าง → ใช้ DEFAULT_REPLY
 * - คืน metadata (finishReason, token counts) ให้ route นำไป log
 */
import { GoogleGenAI } from "@google/genai";
import type { GeminiResult } from "@/types";

/** คำตอบมาตรฐานเมื่อไม่มีข้อมูล / ตอบไม่ครบ — ตรงกับข้อความในบรีฟเป๊ะ ๆ */
export const DEFAULT_REPLY =
  "ขอบคุณที่ทักมานะคะ เรื่องนี้พี่ดาวไม่มีข้อมูลในระบบตอนนี้ รบกวนแวะมาหาพี่ดาวตัวเป็น ๆ ที่ห้องการศึกษาได้เลยนะคะ เดี๋ยวพี่ช่วยดูให้ค่ะ 🙏";

/** ใช้เมื่อระบบ AI ขัดข้องชั่วคราว (503/overloaded) — ไม่ใช่ว่าไม่มีข้อมูล */
export const SYSTEM_BUSY_REPLY =
  "ขอโทษนะคะ ตอนนี้ระบบพี่ดาวมีคนใช้งานเยอะนิดหน่อย รบกวนลองถามใหม่อีกครั้งสักครู่นะคะ 🙏";

const apiKey = process.env.GEMINI_API_KEY ?? "";
const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

/** retry เฉพาะ error overload/5xx — backoff สั้น ๆ รวมแล้วไม่เกิน timeout ของ LINE */
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 500;

const ai = new GoogleGenAI({ apiKey });

/** เช็คว่า error เป็น API overload (503/UNAVAILABLE/429) ที่ควร retry / ตอบ busy */
export function isOverloadError(err: unknown): boolean {
  const status = (err as { status?: number | string })?.status;
  if (status === 503 || status === 429) return true;
  const msg = String((err as { message?: string })?.message ?? err ?? "");
  return /UNAVAILABLE|overloaded|503|429/i.test(msg);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** ประกอบ system prompt — context (<faq>) มาก่อน task (<question>) */
function buildPrompt(question: string, faq: string): string {
  return `<role>
คุณคือ "พี่ดาว" เจ้าหน้าที่ดูแลงานสหกิจศึกษาและฝึกงาน (CWIE)
ของหน่วยงานสหกิจศึกษา ทำหน้าที่ตอบคำถามนักศึกษา
</role>

<constraints>
- ตอบโดยใช้ข้อมูลใน <faq> เท่านั้น ห้ามเดาหรือแต่งข้อมูลที่ไม่มีในนั้น
- ห้ามแต่งราคา วันที่ เวลา จำนวนชั่วโมง หรือสถานที่เอง
- ถ้าไม่มีคำตอบใน <faq> ให้ตอบด้วยข้อความนี้เท่านั้น (ห้ามแต่งเพิ่ม):
  "${DEFAULT_REPLY}"
- โทนเป็นกันเองแบบพี่น้อง ใช้คำลงท้าย "นะคะ/ค่ะ" ใส่ emoji ได้นิดหน่อย (1-2 ตัวต่อคำตอบ ไม่เกิน)
- ความยาวคำตอบ 2-3 ประโยค กระชับ ไม่อ้อมค้อม
</constraints>

<output_format>
ตอบเป็นภาษาไทย ห้ามใช้ Markdown (ไม่มี **, -, #, ตัวเลขลำดับ) เขียนเป็นข้อความธรรมดาต่อกัน
</output_format>

<faq>
${faq}
</faq>

<question>
${question}
</question>`;
}

export async function askGemini(
  question: string,
  faq: string,
): Promise<GeminiResult> {
  const prompt = buildPrompt(question, faq);

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: 1024,
          // ไม่มี temperature — ปล่อย default ตามคำแนะนำ Google สำหรับ Gemini 3.x
        },
      });

      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason
        ? String(candidate.finishReason)
        : undefined;

      const usage = response.usageMetadata;
      const thoughtsTokenCount = usage?.thoughtsTokenCount;
      const candidatesTokenCount = usage?.candidatesTokenCount;

      const text = response.text?.trim();

      // ตัดกลางคัน หรือไม่มีข้อความ → ใช้ DEFAULT_REPLY กันส่งประโยคขาด
      const reply =
        finishReason === "MAX_TOKENS" || !text ? DEFAULT_REPLY : text;

      return { reply, finishReason, thoughtsTokenCount, candidatesTokenCount };
    } catch (err) {
      lastErr = err;
      // retry เฉพาะ overload/5xx — exponential backoff 500ms, 1000ms
      if (attempt < MAX_RETRIES && isOverloadError(err)) {
        const delay = RETRY_BASE_MS * 2 ** attempt;
        console.warn(
          `[gemini] overloaded — retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`,
        );
        await sleep(delay);
        continue;
      }
      throw err; // error อื่น หรือ retry หมด → โยนต่อให้ route เลือกข้อความ
    }
  }
  throw lastErr;
}
