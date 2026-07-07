'use strict';

const { calculateScores, buildRecommendations, getStrengths } = require('../utils/scoring');
const { buildResultsFlex } = require('../flex/results');
const { saveAssessment, upsertSession, getLastAssessment } = require('../db');
const { SKILLS } = require('../data/skills');

/**
 * คำนวณผล + แสดงผล + บันทึก assessment
 */
async function showResults(client, replyToken, lineUserId, studentIdHash, answers, usePush = false) {
  const { skillScores, hardScore, softScore, overallScore } = calculateScores(answers);
  const recommendations = buildRecommendations(skillScores);
  const strengths       = getStrengths(skillScores);

  // บันทึกลง DB
  saveAssessment({
    student_id_hash:   studentIdHash,
    answers:           JSON.stringify(answers),
    hard_skill_scores: JSON.stringify(
      Object.fromEntries(
        Object.entries(skillScores).filter(([id]) => id.startsWith('H'))
      )
    ),
    soft_skill_scores: JSON.stringify(
      Object.fromEntries(
        Object.entries(skillScores).filter(([id]) => id.startsWith('S'))
      )
    ),
    overall_score:     overallScore,
    recommendations:   JSON.stringify(recommendations),
  });

  // Reset session
  await upsertSession({
    line_user_id:      lineUserId,
    state:             'idle',
    student_id_hash:   studentIdHash,
    pdpa_consent:      1,
    consent_timestamp: new Date().toISOString(),
    current_question:  0,
    answers:           '{}',
  });

  // ข้อความสรุปก่อน Flex
  const strengthText = strengths.length > 0
    ? `\n\n✨ จุดแข็งของน้อง:\n${strengths.join('\n')}`
    : '';

  const summaryMsg = {
    type: 'text',
    text: `🎊 น้องทำแบบประเมินครบแล้ว! AGSP วิเคราะห์ผลให้เรียบร้อย\n\nHard Skill: ${hardScore}% | Soft Skill: ${softScore}%${strengthText}\n\nดูรายละเอียดด้านล่างได้เลย 👇`,
  };

  const flexMsg = buildResultsFlex(skillScores, recommendations);

  if (usePush || !replyToken) {
    await client.pushMessage({ to: lineUserId, messages: [summaryMsg, flexMsg] });
  } else {
    await client.replyMessage({ replyToken, messages: [summaryMsg, flexMsg] });
  }
}

/**
 * แสดงผลการประเมินครั้งล่าสุด (สำหรับนักศึกษาที่เคยทำแล้ว)
 */
async function showPreviousResults(client, replyToken, lineUserId, studentIdHash) {
  const last = getLastAssessment(studentIdHash);
  if (!last) {
    await client.replyMessage({
      replyToken,
      messages: [{ type: 'text', text: 'ยังไม่พบผลการประเมินของน้อง ลองทำแบบประเมินใหม่ได้เลย 😊' }],
    });
    return;
  }

  const skillScores = {
    ...JSON.parse(last.hard_skill_scores),
    ...JSON.parse(last.soft_skill_scores),
  };
  const recommendations = JSON.parse(last.recommendations);
  const lastDate = new Date(last.taken_at).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  await client.replyMessage({
    replyToken,
    messages: [
      { type: 'text', text: `📊 ผลการประเมินของน้อง (ครั้งล่าสุด: ${lastDate})` },
      buildResultsFlex(skillScores, recommendations),
    ],
  });
}

module.exports = { showResults, showPreviousResults };
