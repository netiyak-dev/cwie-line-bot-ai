/**
 * /api/cron/followup — endpoint สำหรับ cron-job.org เรียกวันละครั้ง
 *
 * Auth: Header `x-cron-secret: <CRON_SECRET>`
 * Logic: ส่ง push message ที่ 2 สัปดาห์ / 1 เดือน / 3 เดือน หลังทำแบบประเมิน
 * Rate limit: ไม่ส่งถ้าส่งไปแล้วไม่ถึง 7 วัน
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAllFollowups, updateFollowup, FollowupRecord } from '@/lib/assessment/followup';
import { lineClient } from '@/lib/line';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET ?? '';

const MS = {
  '2w': 14 * 24 * 60 * 60 * 1000,
  '1m': 30 * 24 * 60 * 60 * 1000,
  '3m': 90 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

type Milestone = '2w' | '1m' | '3m';

export async function GET(req: NextRequest): Promise<NextResponse> {
  // ตรวจ secret
  const secret = req.headers.get('x-cron-secret');
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const records = await getAllFollowups();
  const now = Date.now();
  let sent = 0;
  let skipped = 0;

  for (const record of records) {
    if (!record.optIn) { skipped++; continue; }

    const elapsed = now - new Date(record.assessmentAt).getTime();

    // Rate limit: ไม่ส่งถ้า lastSentAt < 7 วันที่แล้ว
    if (record.lastSentAt && now - new Date(record.lastSentAt).getTime() < MS['7d']) {
      skipped++;
      continue;
    }

    const milestone = pickMilestone(elapsed, record);
    if (!milestone) { skipped++; continue; }

    try {
      await sendFollowupPush(record.lineUserId, milestone);

      const patch: Partial<FollowupRecord> = { lastSentAt: new Date().toISOString() };
      if (milestone === '2w') patch.sent2w = true;
      if (milestone === '1m') patch.sent1m = true;
      if (milestone === '3m') patch.sent3m = true;
      await updateFollowup(record.lineUserId, patch);

      sent++;
    } catch (err) {
      console.error(`[followup] push failed for user:`, err);
      skipped++;
    }
  }

  console.log(`[followup] cron done — sent: ${sent}, skipped: ${skipped}, total: ${records.length}`);
  return NextResponse.json({ ok: true, sent, skipped, total: records.length });
}

/** เลือก milestone ที่ถึงเวลาแล้วและยังไม่ส่ง (เลือก milestone ล่าสุดที่ถึงก่อน) */
function pickMilestone(elapsed: number, r: FollowupRecord): Milestone | null {
  if (elapsed >= MS['3m'] && !r.sent3m) return '3m';
  if (elapsed >= MS['1m'] && !r.sent1m) return '1m';
  if (elapsed >= MS['2w'] && !r.sent2w) return '2w';
  return null;
}

/** ส่ง push message พร้อม quick reply */
async function sendFollowupPush(lineUserId: string, milestone: Milestone): Promise<void> {
  const labels: Record<Milestone, string> = { '2w': '2 สัปดาห์', '1m': '1 เดือน', '3m': '3 เดือน' };

  await lineClient.pushMessage({
    to: lineUserId,
    messages: [
      {
        type: 'text',
        text: `สวัสดีน้อง 👋 ผ่านมา ${labels[milestone]} แล้วนะ\n\nน้องได้ลองทำตามที่ AGSP แนะนำไปบ้างไหม? 🌱`,
        quickReply: {
          items: [
            {
              type: 'action',
              action: { type: 'postback', label: '✅ ทำแล้ว', data: 'action=followup_done' },
            },
            {
              type: 'action',
              action: { type: 'postback', label: '⏳ ยังไม่ได้ทำ', data: 'action=followup_not_done' },
            },
            {
              type: 'action',
              action: { type: 'postback', label: '❌ ทำไม่ได้', data: 'action=followup_cant' },
            },
          ],
        },
      },
    ],
  });
}
