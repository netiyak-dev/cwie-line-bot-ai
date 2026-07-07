'use strict';

const { QUESTIONS } = require('../data/questions');
const { SKILLS, HARD_SKILL_IDS, SOFT_SKILL_IDS } = require('../data/skills');

// ค่าคะแนนต่อระดับ (ไม่แสดงให้นักศึกษาเห็น)
const SCORE_MAP = { 1: 25, 2: 50, 3: 75, 4: 100 };

/**
 * คำนวณ skill scores จาก answers object
 * @param {Object} answers - { Q1: 2, Q2: 3, ... }
 * @returns {{ skillScores, hardScore, softScore, overallScore }}
 */
function calculateScores(answers) {
  // จัดกลุ่มคำตอบตาม skillId
  const grouped = {};
  for (const q of QUESTIONS) {
    const val = answers[q.id];
    if (val === undefined) continue;
    if (!grouped[q.skillId]) grouped[q.skillId] = [];
    grouped[q.skillId].push(SCORE_MAP[val] || 0);
  }

  // คำนวณคะแนนราย skill (เฉลี่ย)
  const skillScores = {};
  for (const [skillId, vals] of Object.entries(grouped)) {
    skillScores[skillId] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }

  // Hard / Soft / Overall
  const hardVals = HARD_SKILL_IDS.map((id) => skillScores[id] ?? 0);
  const softVals = SOFT_SKILL_IDS.map((id) => skillScores[id] ?? 0);

  const hardScore    = Math.round(hardVals.reduce((a, b) => a + b, 0) / hardVals.length);
  const softScore    = Math.round(softVals.reduce((a, b) => a + b, 0) / softVals.length);
  const overallScore = Math.round((hardScore + softScore) / 2);

  return { skillScores, hardScore, softScore, overallScore };
}

/**
 * เลือก recommendations จาก skill scores
 * Priority 1 (≤50) ทั้งหมด + Priority 2 (51–75) เพิ่มจนครบ 5 รายการ
 * @returns {string[]} recommendation strings
 */
function buildRecommendations(skillScores) {
  const p1 = []; // ≤ 50
  const p2 = []; // 51–75

  for (const [skillId, score] of Object.entries(skillScores)) {
    const skill = SKILLS[skillId];
    if (!skill) continue;
    if (score <= 50) {
      const recos = skill.recommendations[1] || [];
      recos.forEach((r) => p1.push(`[${skill.emoji} ${skill.name}] ${r}`));
    } else if (score <= 75) {
      const recos = skill.recommendations[2] || [];
      recos.forEach((r) => p2.push(`[${skill.emoji} ${skill.name}] ${r}`));
    }
  }

  const combined = [...p1, ...p2];
  // จำกัดสูงสุด 5 รายการ
  return combined.slice(0, 5);
}

/**
 * หา Top Strengths (score > 75) เรียงจากสูงสุด
 */
function getStrengths(skillScores) {
  return Object.entries(skillScores)
    .filter(([, score]) => score > 75)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id]) => {
      const s = SKILLS[id];
      return `${s.emoji} ${s.name}`;
    });
}

module.exports = { calculateScores, buildRecommendations, getStrengths };
