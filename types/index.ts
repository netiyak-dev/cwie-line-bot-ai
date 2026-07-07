/**
 * โครงสร้าง 1 แถวใน Google Sheet (FAQ).
 */
export interface FAQRow {
  category: string;
  question: string;
  answer: string;
  updated_at?: string;
}

/** ผลลัพธ์จาก askGemini() */
export interface GeminiResult {
  reply: string;
  finishReason?: string;
  thoughtsTokenCount?: number;
  candidatesTokenCount?: number;
}

// ── Assessment types ──────────────────────────────────────────────────────────

/** Session state สำหรับ assessment flow */
export type { Session, SessionState } from '@/lib/assessment/session';

/** Skill scores หลังประเมิน */
export type { SkillScores, AssessmentScores, Recommendation, Strength } from '@/lib/assessment/scoring';
