/**
 * handlers/results.ts — คำนวณผลและแสดงผลการประเมิน
 */
import type { messagingApi } from '@line/bot-sdk';
type MessagingApiClient = messagingApi.MessagingApiClient;
import { calculateScores, buildRecommendations, getStrengths } from '../scoring';
import { buildResultsFlex } from '../flex/results';
import { resetSession } from '../session';
import { saveAssessment } from '../db';

export async function showResults(
  client: MessagingApiClient,
  replyToken: string | null,
  lineUserId: string,
  studentIdHash: string,
  answers: Record<string, number>,
): Promise<void> {
  const { skillScores, hardScore, softScore } = calculateScores(answers);
  const recommendations = buildRecommendations(skillScores);
  const strengths = getStrengths(skillScores);

  // บันทึกผล (fire-and-forget)
  const hardSkillScores = Object.fromEntries(
    Object.entries(skillScores).filter(([id]) => id.startsWith('H'))
  );
  const softSkillScores = Object.fromEntries(
    Object.entries(skillScores).filter(([id]) => id.startsWith('S'))
  );
  const overallScore = Math.round((hardScore + softScore) / 2);

  saveAssessment({
    studentIdHash,
    hardSkillScores,
    softSkillScores,
    overallScore,
    recommendations: recommendations.map((r) => `${r.emoji} ${r.skillName}: ${r.text}`),
  }).catch(() => {}); // ไม่ block

  // Reset session
  await resetSession(lineUserId);

  // ข้อความสรุป
  const strengthText =
    strengths.length > 0
      ? `\n\n✨ จุดแข็งของน้อง:\n${strengths.map((s) => `${s.emoji} ${s.skillName}`).join(', ')}`
      : '';

  const summaryMsg = {
    type: 'text' as const,
    text: `🎊 น้องทำแบบประเมินครบแล้ว! AGSP วิเคราะห์ผลให้เรียบร้อย\n\nHard Skill: ${hardScore}% | Soft Skill: ${softScore}%${strengthText}\n\nดูรายละเอียดด้านล่าง 👇`,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flexMsg = buildResultsFlex(skillScores, recommendations) as any;

  if (replyToken) {
    await client.replyMessage({ replyToken, messages: [summaryMsg, flexMsg] });
  } else {
    await client.pushMessage({ to: lineUserId, messages: [summaryMsg, flexMsg] });
  }
}
