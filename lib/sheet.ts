/**
 * sheet.ts — ดึง FAQ จาก Google Sheet (publish เป็น CSV) พร้อม in-memory cache 60 วิ
 *
 * - SHEET_CSV_URL    : FAQ หลัก (Chatbot_FAQ tab)
 * - SCHEDULE_CSV_URL : กำหนดการและวิธีใช้ระบบ (Schedule_QA tab) — แยกไว้เพื่อแก้ไขง่าย
 *
 * - คืนค่ารวม CSV ทั้งสองส่งตรงเข้า system prompt ของ Gemini
 * - cache อายุ 60 วินาที กัน fetch ซ้ำทุก request
 * - ถ้า fetch ใหม่ไม่ได้ แต่มี cache เก่า → ใช้ cache เก่าไปก่อน (stale-but-available)
 */

const SHEET_URL = process.env.SHEET_CSV_URL ?? "";
const SCHEDULE_URL = process.env.SCHEDULE_CSV_URL ?? "";
const CACHE_TTL_MS = 60_000; // 60 วินาที

interface FAQCache {
  csv: string;
  fetchedAt: number;
}

let cache: FAQCache | null = null;
let scheduleCache: FAQCache | null = null;

/** fetch single URL พร้อม stale-cache fallback */
async function fetchCSV(url: string, label: string, existing: FAQCache | null): Promise<{ data: string; updated: FAQCache | null }> {
  if (!url) return { data: "", updated: existing };
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.text();
    return { data, updated: { csv: data, fetchedAt: Date.now() } };
  } catch (err) {
    console.error(`[sheet] fetch error (${label}):`, err);
    if (existing) {
      console.warn(`[sheet] ใช้ stale cache แทน (${label})`);
      return { data: existing.csv, updated: existing };
    }
    return { data: "", updated: null };
  }
}

export async function getFAQ(): Promise<string> {
  const now = Date.now();
  const faqFresh = cache && now - cache.fetchedAt < CACHE_TTL_MS;
  const schFresh = scheduleCache && now - scheduleCache.fetchedAt < CACHE_TTL_MS;

  // 1) ทั้งคู่ยังไม่หมดอายุ → ใช้ cache เลย
  if (faqFresh && schFresh) {
    return [cache!.csv, scheduleCache!.csv].filter(Boolean).join("\n");
  }

  if (!SHEET_URL) {
    console.error("[sheet] SHEET_CSV_URL ไม่ถูกตั้งค่า");
  }

  // 2) fetch เฉพาะส่วนที่หมดอายุ
  const [faqResult, schResult] = await Promise.all([
    faqFresh ? Promise.resolve({ data: cache!.csv, updated: cache }) : fetchCSV(SHEET_URL, "FAQ", cache),
    schFresh ? Promise.resolve({ data: scheduleCache?.csv ?? "", updated: scheduleCache }) : fetchCSV(SCHEDULE_URL, "Schedule", scheduleCache),
  ]);

  cache = faqResult.updated;
  scheduleCache = schResult.updated;

  return [faqResult.data, schResult.data].filter(Boolean).join("\n");
}
