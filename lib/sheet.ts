/**
 * sheet.ts — ดึง FAQ จาก Google Sheet (publish เป็น CSV) พร้อม in-memory cache 60 วิ
 *
 * - คืนค่าเป็น CSV ดิบ (string) ส่งตรงเข้า system prompt ของ Gemini
 * - cache อายุ 60 วินาที กัน fetch ซ้ำทุก request
 * - ถ้า fetch ใหม่ไม่ได้ แต่มี cache เก่า → ใช้ cache เก่าไปก่อน (stale-but-available)
 */

const SHEET_URL = process.env.SHEET_CSV_URL ?? "";
const CACHE_TTL_MS = 60_000; // 60 วินาที

interface FAQCache {
  csv: string;
  fetchedAt: number;
}

let cache: FAQCache | null = null;

export async function getFAQ(): Promise<string> {
  const now = Date.now();

  // 1) ยังไม่หมดอายุ → ใช้ cache เลย
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.csv;
  }

  if (!SHEET_URL) {
    console.error("[sheet] SHEET_CSV_URL ไม่ถูกตั้งค่า");
    return cache?.csv ?? "";
  }

  // 2) fetch ใหม่
  try {
    const res = await fetch(SHEET_URL, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Sheet fetch failed: HTTP ${res.status}`);
    }
    const csv = await res.text();
    cache = { csv, fetchedAt: now };
    return csv;
  } catch (err) {
    // 3) fetch พัง → ใช้ cache เก่าถ้ามี (แม้เกิน 60 วิ)
    console.error("[sheet] fetch error:", err);
    if (cache) {
      console.warn("[sheet] ใช้ stale cache แทน (fetch ล้มเหลว)");
      return cache.csv;
    }
    // ไม่มี cache เลย → คืน "" ให้ Gemini ตอบ DEFAULT ตามกฎใน system prompt
    return "";
  }
}
