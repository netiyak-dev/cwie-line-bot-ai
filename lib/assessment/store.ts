/**
 * store.ts — เก็บประวัติผลประเมินใน Vercel KV (รองรับหลายครั้ง)
 *
 * Key: `assessment:<studentIdHash>`
 * Value: AssessmentSummary[]  ← array เรียงตาม assessmentAt
 * TTL: 365 วัน (นับจากแต่ละ update)
 *
 * หมายเหตุ: ไม่เก็บข้อมูลที่ระบุตัวตนได้ — ใช้ hash เท่านั้น
 */
import { kv } from '@vercel/kv';

export interface AssessmentSummary {
  studentIdHash: string;
  assessmentAt: string; // ISO string
  hardScore: number;
  softScore: number;
  overallScore: number;
  skillScores: Record<string, number>;
}

const KEY = (hash: string) => `assessment:${hash}`;
const TTL = 365 * 24 * 3600;

/** บันทึกผลประเมิน — append ต่อท้าย array เดิม (ไม่ overwrite) */
export async function saveAssessmentSummary(data: AssessmentSummary): Promise<void> {
  const raw = await kv.get<AssessmentSummary | AssessmentSummary[]>(KEY(data.studentIdHash));
  // รองรับ legacy format (single object) และ format ใหม่ (array)
  const existing: AssessmentSummary[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
  existing.push(data);
  await kv.set(KEY(data.studentIdHash), existing, { ex: TTL });
}

/** ดึงประวัติทั้งหมดของ student คนนึง — คืน [] ถ้าไม่มีข้อมูล */
export async function getAssessmentHistory(studentIdHash: string): Promise<AssessmentSummary[]> {
  const raw = await kv.get<AssessmentSummary | AssessmentSummary[]>(KEY(studentIdHash));
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/** ดึงผลประเมินทั้งหมด (flatten) — ใช้ใน Admin Dashboard */
export async function getAllAssessments(): Promise<AssessmentSummary[]> {
  const records: AssessmentSummary[] = [];
  let cursor = 0;
  do {
    const [nextCursor, keys] = await kv.scan(cursor, { match: 'assessment:*', count: 100 });
    cursor = Number(nextCursor);
    if (keys.length > 0) {
      const values = await Promise.all(
        keys.map((k) => kv.get<AssessmentSummary | AssessmentSummary[]>(k))
      );
      for (const v of values) {
        if (!v) continue;
        if (Array.isArray(v)) records.push(...v);
        else records.push(v);
      }
    }
  } while (cursor !== 0);
  return records;
}
