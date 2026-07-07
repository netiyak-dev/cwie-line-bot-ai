/**
 * db.ts — เก็บผลการประเมินผ่าน Google Apps Script webhook
 *
 * ใช้ pattern เดียวกับ lib/log.ts (fire-and-forget ผ่าน POST webhook)
 * ตั้งค่า ASSESSMENT_WEBHOOK_URL ใน .env.local และ Vercel Environment Variables
 *
 * Google Apps Script ฝั่ง Sheet ต้องรับ JSON และ append แถวลงชีต
 * ชีต schema: student_id_hash | taken_at | hard_scores | soft_scores | overall | recommendations
 */

const WEBHOOK_URL = process.env.ASSESSMENT_WEBHOOK_URL ?? '';
const TIMEOUT_MS = 5000;

export interface AssessmentRecord {
  studentIdHash: string;
  hardSkillScores: Record<string, number>;
  softSkillScores: Record<string, number>;
  overallScore: number;
  recommendations: string[]; // array ของ text สรุป
}

/**
 * บันทึกผลการประเมินลง Google Sheet ผ่าน Apps Script
 * fire-and-forget — ไม่กระทบการตอบ LINE ถ้าล้มเหลว
 */
export async function saveAssessment(record: AssessmentRecord): Promise<void> {
  if (!WEBHOOK_URL) {
    console.warn('[db] ASSESSMENT_WEBHOOK_URL ไม่ถูกตั้งค่า — ข้ามการบันทึก');
    return;
  }

  const payload = {
    ...record,
    takenAt: new Date().toISOString(),
    hardSkillScores: JSON.stringify(record.hardSkillScores),
    softSkillScores: JSON.stringify(record.softSkillScores),
    recommendations: JSON.stringify(record.recommendations),
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    console.warn('[db] saveAssessment ล้มเหลว:', err);
  }
}
