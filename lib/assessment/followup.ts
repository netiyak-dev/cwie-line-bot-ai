/**
 * followup.ts — จัดการ follow-up records ใน Vercel KV
 *
 * Schema key: `followup:<lineUserId>`
 * TTL: 120 วัน
 */
import { kv } from '@vercel/kv';

export interface FollowupRecord {
  lineUserId: string;
  assessmentAt: string; // ISO
  optIn: boolean;
  sent2w: boolean;
  sent1m: boolean;
  sent3m: boolean;
  lastSentAt: string | null;
}

const KEY = (userId: string) => `followup:${userId}`;
const TTL = 60 * 60 * 24 * 120; // 120 วัน

/** สร้าง record หลังทำแบบประเมินเสร็จ (optIn = true โดย default) */
export async function createFollowup(lineUserId: string): Promise<void> {
  const record: FollowupRecord = {
    lineUserId,
    assessmentAt: new Date().toISOString(),
    optIn: true,
    sent2w: false,
    sent1m: false,
    sent3m: false,
    lastSentAt: null,
  };
  await kv.set(KEY(lineUserId), record, { ex: TTL });
}

export async function getFollowup(lineUserId: string): Promise<FollowupRecord | null> {
  return kv.get<FollowupRecord>(KEY(lineUserId));
}

export async function updateFollowup(lineUserId: string, patch: Partial<FollowupRecord>): Promise<void> {
  const existing = await getFollowup(lineUserId);
  if (!existing) return;
  await kv.set(KEY(lineUserId), { ...existing, ...patch }, { ex: TTL });
}

/** ปิดการแจ้งเตือน */
export async function optOutFollowup(lineUserId: string): Promise<void> {
  const existing = await getFollowup(lineUserId);
  if (existing) {
    await kv.set(KEY(lineUserId), { ...existing, optIn: false }, { ex: TTL });
  }
}

/** ดึง record ทั้งหมด (ใช้ใน cron) */
export async function getAllFollowups(): Promise<FollowupRecord[]> {
  const records: FollowupRecord[] = [];
  let cursor = 0;
  do {
    const [nextCursor, keys] = await kv.scan(cursor, { match: 'followup:*', count: 100 });
    cursor = nextCursor as number;
    if (keys.length > 0) {
      const values = await Promise.all(keys.map((k) => kv.get<FollowupRecord>(k)));
      records.push(...(values.filter((v): v is FollowupRecord => v !== null)));
    }
  } while (cursor !== 0);
  return records;
}
