/**
 * โครงสร้าง 1 แถวใน Google Sheet (FAQ).
 * โค้ดหลักใช้ CSV ดิบส่งให้ Gemini โดยตรง — type นี้มีไว้สำหรับ
 * กรณีต้องการ parse เป็น array เพื่อ validate / debug.
 */
export interface FAQRow {
  category: string;
  question: string;
  answer: string;
  updated_at?: string;
}

/** ผลลัพธ์จาก askGemini() ที่ route นำไปใช้ตอบ + log */
export interface GeminiResult {
  /** ข้อความที่พร้อมส่งกลับ LINE (เป็น DEFAULT_REPLY แล้วถ้า MAX_TOKENS / ว่าง) */
  reply: string;
  /** finishReason จาก Gemini เช่น "STOP", "MAX_TOKENS" */
  finishReason?: string;
  /** token ที่ใช้ใน thinking (ถ้ามี) */
  thoughtsTokenCount?: number;
  /** token ของคำตอบจริง */
  candidatesTokenCount?: number;
}
