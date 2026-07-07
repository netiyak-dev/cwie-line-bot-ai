/**
 * scoring.ts — คำนวณคะแนน skill และสร้าง recommendations
 *
 * - SCORE_MAP: value 1-4 → 25/50/75/100 pts
 * - skill score = average ของคำถามในกลุ่มนั้น
 * - P1 (≤50): แสดงทุก skill + ความสำคัญสูง
 * - P2 (51-75): แสดงเพิ่มเติมจนรวมไม่เกิน 5 recommendations
 * - Strength: skill >75 → แสดงเป็นจุดแข็ง
 */
import { QUESTIONS } from './questions';
import { SKILLS } from './skills';

export const SCORE_MAP: Record<1 | 2 | 3 | 4, number> = {
  1: 25,
  2: 50,
  3: 75,
  4: 100,
};

export interface SkillScores {
  [skillId: string]: number; // 0-100
}

export interface AssessmentScores {
  skillScores: SkillScores;
  hardScore: number;
  softScore: number;
  overallScore: number;
}

/**
 * คำนวณคะแนนจาก answers object { Q1: 1-4, Q2: 1-4, ... }
 */
export function calculateScores(answers: Record<string, number>): AssessmentScores {
  // จัดกลุ่มคำถามตาม skillId
  const skillQuestions: Record<string, number[]> = {};
  for (const q of QUESTIONS) {
    if (!skillQuestions[q.skillId]) skillQuestions[q.skillId] = [];
    const val = answers[q.id] as 1 | 2 | 3 | 4 | undefined;
    if (val) {
      skillQuestions[q.skillId].push(SCORE_MAP[val] ?? 50);
    }
  }

  // คะแนนเฉลี่ยของแต่ละ skill
  const skillScores: SkillScores = {};
  for (const [skillId, pts] of Object.entries(skillQuestions)) {
    if (pts.length > 0) {
      skillScores[skillId] = Math.round(pts.reduce((a, b) => a + b, 0) / pts.length);
    }
  }

  // คะแนนเฉลี่ย Hard / Soft / Overall
  const hardSkillIds = Object.keys(skillScores).filter((id) => id.startsWith('H'));
  const softSkillIds = Object.keys(skillScores).filter((id) => id.startsWith('S'));

  const avg = (ids: string[]) =>
    ids.length === 0
      ? 0
      : Math.round(ids.reduce((s, id) => s + skillScores[id], 0) / ids.length);

  const hardScore = avg(hardSkillIds);
  const softScore = avg(softSkillIds);
  const overallScore = avg([...hardSkillIds, ...softSkillIds]);

  return { skillScores, hardScore, softScore, overallScore };
}

export interface Recommendation {
  skillId: string;
  skillName: string;
  emoji: string;
  priority: 1 | 2;
  score: number;
  text: string;
}

/**
 * สร้าง recommendations จาก skillScores
 * - P1 (≤50): ทุก skill
 * - P2 (51-75): เพิ่มจนรวมไม่เกิน 5
 */
export function buildRecommendations(skillScores: SkillScores): Recommendation[] {
  const p1: Recommendation[] = [];
  const p2: Recommendation[] = [];

  for (const [skillId, score] of Object.entries(skillScores)) {
    const skill = SKILLS[skillId];
    if (!skill) continue;

    if (score <= 50) {
      p1.push({
        skillId, skillName: skill.name, emoji: skill.emoji,
        priority: 1, score,
        text: skill.recommendations[1],
      });
    } else if (score <= 75) {
      p2.push({
        skillId, skillName: skill.name, emoji: skill.emoji,
        priority: 2, score,
        text: skill.recommendations[2],
      });
    }
  }

  // sort P1 by score ASC (คะแนนต่ำสุดมาก่อน), P2 เหมือนกัน
  p1.sort((a, b) => a.score - b.score);
  p2.sort((a, b) => a.score - b.score);

  const combined = [...p1];
  const remaining = 5 - p1.length;
  if (remaining > 0) {
    combined.push(...p2.slice(0, remaining));
  }

  return combined;
}

export interface Strength {
  skillId: string;
  skillName: string;
  emoji: string;
  score: number;
}

/**
 * หา skills ที่เป็นจุดแข็ง (score > 75) สูงสุด 3 อันดับ
 */
export function getStrengths(skillScores: SkillScores): Strength[] {
  return Object.entries(skillScores)
    .filter(([, score]) => score > 75)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([skillId, score]) => {
      const skill = SKILLS[skillId];
      return { skillId, skillName: skill?.name ?? skillId, emoji: skill?.emoji ?? '✨', score };
    });
}

/**
 * แปลงคะแนน → level info สำหรับแสดงผล
 */
export function getLevelInfo(score: number): { label: string; color: string; bar: string } {
  const filled = Math.round(score / 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

  if (score <= 50) return { label: '🔴 ต้องพัฒนา', color: '#E07B39', bar };
  if (score <= 75) return { label: '🟡 กำลังพัฒนา', color: '#C9A227', bar };
  return { label: score >= 90 ? '⭐ เชี่ยวชาญ' : '🟢 ทำได้ดี', color: '#2D6A4F', bar };
}
