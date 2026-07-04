/**
 * log.ts — ส่งคำถาม/คำตอบไปเก็บที่ Google Sheet ผ่าน Google Apps Script Web App
 *
 * - ทำงานเฉพาะเมื่อมี LOG_WEBHOOK_URL (ไม่ตั้งค่า = ข้าม ไม่กระทบการตอบ)
 * - มี timeout สั้น + กลืน error ทั้งหมด: การเก็บ log ต้องไม่ทำให้บอทตอบช้าหรือพัง
 */
const LOG_URL = process.env.LOG_WEBHOOK_URL ?? "";
const LOG_TIMEOUT_MS = 3000;

export interface QuestionLog {
  /** ข้อความที่ผู้ใช้ถามมา */
  question: string;
  /** คำตอบที่บอทส่งกลับ */
  reply: string;
  /** สถานะจาก Gemini เช่น STOP / MAX_TOKENS / TIMEOUT / ERROR / OVERLOAD_503 */
  finishReason: string;
  /** true = ตอบจากข้อมูลใน FAQ ได้จริง, false = ตกไป default/busy (ยังไม่มีข้อมูล) */
  answered: boolean;
}

/** ยิงข้อมูล 1 แถวไปเขียนลง Google Sheet — fire-and-forget แบบปลอดภัย */
export async function logQuestion(entry: QuestionLog): Promise<void> {
  if (!LOG_URL) return;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOG_TIMEOUT_MS);
    await fetch(LOG_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, timestamp: new Date().toISOString() }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    // เขียน log ไม่สำเร็จไม่ใช่เรื่องคอขาดบาดตาย — แค่ warn ไว้
    console.warn("[log] ส่ง log ไป Google Sheet ไม่สำเร็จ:", err);
  }
}
