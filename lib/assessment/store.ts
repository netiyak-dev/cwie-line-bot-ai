/**
 * store.ts — เก็บสรุปผลประเมินใน Vercel KV (สำหรับ Admin Dashboard)
 *
 * Key: `assessment:<studentIdHash>`
 * TTL: 365 วัน
 * หมายเหตุ: ไม่เก็บข้อมูลที่ระบุตัวตนได้ — ใช้ hash เท่านั้น
 */
import { kv } from '@vercel/kv';

export interface AssessmentSummary {
  studentIdHash: string;
  assessmentAt: string;
  hardScore: number;
  softScore: number;
  overallScore: number;
  skillScores: Record<string, number>;
}

const KEY = (hash: string) => `assessment:${hash}`;
const TTL = 365 * 24 * 3600;

export async function saveAssessmentSummary(data: AssessmentSummary): Promise<void> {
  await kv.set(KEY(data.studentIdHash), data, { ex: TTL });
}

export async function getAllAssessments(): Promise<AssessmentSummary[]> {
  const records: AssessmentSummary[] = [];
  let cursor = 0;
  do {
    const [nextCursor, keys] = await kv.scan(cursor, { match: 'assessment:*', count: 100 });
    cursor = Number(nextCursor);
    if (keys.length > 0) {
      const values = await Promise.all(keys.map((k) => kv.get<AssessmentSummary>(k)));
      records.push(...values.filter((v): v is AssessmentSummary => v !== null));
    }
  } while (cursor !== 0);
  return records;
}
