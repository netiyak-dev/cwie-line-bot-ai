/**
 * flex/results.ts — Flex Message แสดงผลการประเมิน
 * แสดง Hard Skill + Soft Skill bars + Recommendations
 */
import type { FlexMessage, FlexComponent } from '@line/bot-sdk';
import { SKILLS, HARD_SKILL_IDS, SOFT_SKILL_IDS } from '../skills';
import type { SkillScores } from '../scoring';
import { getLevelInfo } from '../scoring';
import type { Recommendation } from '../scoring';

function buildSkillRow(skillId: string, score: number): FlexComponent {
  const skill = SKILLS[skillId];
  const { bar, label } = getLevelInfo(score);
  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'xs',
    margin: 'sm',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: `${skill?.emoji ?? ''} ${skill?.name ?? skillId}`,
            size: 'xs', flex: 6, wrap: true,
          },
          {
            type: 'text',
            text: label,
            size: 'xs', flex: 4, align: 'end',
          },
        ],
      },
      {
        type: 'text',
        text: bar,
        size: 'xs',
        color: '#555555',
        // font: 'monospace' — LINE Flex ไม่รองรับ font property
      },
    ],
  };
}

export function buildResultsFlex(
  skillScores: SkillScores,
  recommendations: Recommendation[],
): FlexMessage {
  // Hard Skill rows
  const hardRows: FlexComponent[] = [
    {
      type: 'text',
      text: '📐 Hard Skills',
      weight: 'bold',
      size: 'sm',
      color: '#003F88',
    },
    ...HARD_SKILL_IDS.filter((id) => skillScores[id] !== undefined).map((id) =>
      buildSkillRow(id, skillScores[id])
    ),
  ];

  // Soft Skill rows
  const softRows: FlexComponent[] = [
    {
      type: 'separator',
      margin: 'md',
    },
    {
      type: 'text',
      text: '💡 Soft Skills',
      weight: 'bold',
      size: 'sm',
      color: '#003F88',
      margin: 'md',
    },
    ...SOFT_SKILL_IDS.filter((id) => skillScores[id] !== undefined).map((id) =>
      buildSkillRow(id, skillScores[id])
    ),
  ];

  // Recommendations
  const recRows: FlexComponent[] =
    recommendations.length > 0
      ? [
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'text',
            text: '💪 สิ่งที่น้องควรพัฒนาต่อ',
            weight: 'bold',
            size: 'sm',
            color: '#E07B39',
            margin: 'md',
          },
          ...recommendations.map(
            (r): FlexComponent => ({
              type: 'text',
              text: `${r.emoji} ${r.skillName}: ${r.text}`,
              size: 'xs',
              color: '#555555',
              wrap: true,
              margin: 'sm',
            })
          ),
        ]
      : [
          {
            type: 'text',
            text: '🎉 น้องทำได้ดีมากในทุกด้าน!',
            size: 'sm', color: '#2D6A4F', margin: 'md',
          },
        ];

  return {
    type: 'flex',
    altText: 'AGSP: ผลการประเมินทักษะของน้อง',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#003F88',
        paddingAll: '14px',
        contents: [
          {
            type: 'text',
            text: '📊 ผลการประเมินทักษะ',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'AGSP | วิทยาศาสตร์การเกษตร มหิดล',
            color: '#C9A227',
            size: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '14px',
        spacing: 'xs',
        contents: [...hardRows, ...softRows, ...recRows],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '📄 Export PDF',
              data: 'action=export_pdf',
              displayText: 'ขอ Export ผลเป็น PDF',
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: '#2D6A4F',
            height: 'sm',
            action: {
              type: 'postback',
              label: '🔔 รับการแจ้งเตือนติดตามผล',
              data: 'action=followup_optin',
              displayText: 'สมัครรับการแจ้งเตือนติดตามผล',
            },
          },
        ],
      },
    },
  };
}
