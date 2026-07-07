'use strict';

const { SKILLS, HARD_SKILL_IDS, SOFT_SKILL_IDS } = require('../data/skills');

// สีตาม brand guideline
const COLOR = {
  primary:  '#003F88',
  gold:     '#C9A227',
  green:    '#2D6A4F',
  orange:   '#E07B39',
  bg:       '#F5F5F5',
  text:     '#1A1A1A',
  subtext:  '#555555',
  red:      '#C0392B',
  yellow:   '#D4A017',
};

// แปลงคะแนนเป็น label + สี
function levelInfo(score) {
  if (score <= 50)  return { label: '🔴 ต้องเริ่มพัฒนา', color: COLOR.red };
  if (score <= 75)  return { label: '🟡 มีพื้นที่พัฒนา',  color: COLOR.yellow };
  return               { label: '⭐ จุดแข็ง',            color: COLOR.green };
}

// Progress bar แบบ text (LINE Flex ไม่รองรับ native progress bar)
function progressBar(score) {
  const filled = Math.round(score / 10);
  return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${score}%`;
}

// ── Skill row ──────────────────────────────────────────────────────────────────
function skillRow(skillId, score) {
  const skill = SKILLS[skillId];
  const { label, color } = levelInfo(score);
  return {
    type: 'box',
    layout: 'vertical',
    margin: 'sm',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: `${skill.emoji} ${skill.name}`,
            size: 'sm',
            wrap: true,
            flex: 3,
            color: COLOR.text,
          },
          {
            type: 'text',
            text: label,
            size: 'xs',
            align: 'end',
            flex: 2,
            color,
            weight: 'bold',
          },
        ],
      },
      {
        type: 'text',
        text: progressBar(score),
        size: 'xs',
        color: color,
        margin: 'xs',
        wrap: false,
      },
    ],
  };
}

// ── Section header ─────────────────────────────────────────────────────────────
function sectionHeader(title) {
  return {
    type: 'box',
    layout: 'vertical',
    backgroundColor: COLOR.primary,
    paddingAll: '8px',
    margin: 'md',
    cornerRadius: '4px',
    contents: [
      { type: 'text', text: title, color: '#FFFFFF', size: 'sm', weight: 'bold' },
    ],
  };
}

// ── Recommendation items ────────────────────────────────────────────────────────
function recoItem(text) {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    margin: 'sm',
    contents: [
      { type: 'text', text: '→', size: 'sm', flex: 0, color: COLOR.orange },
      { type: 'text', text, wrap: true, size: 'sm', flex: 1, color: COLOR.text },
    ],
  };
}

// ── Main builder ───────────────────────────────────────────────────────────────
function buildResultsFlex(scores, recommendations) {
  const hardRows  = HARD_SKILL_IDS.map((id) => skillRow(id, scores[id] || 0));
  const softRows  = SOFT_SKILL_IDS.map((id) => skillRow(id, scores[id] || 0));
  const recoItems = recommendations.slice(0, 5).map((r) => recoItem(r));

  // Overall
  const allScores = Object.values(scores);
  const overall   = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const { label: overallLabel, color: overallColor } = levelInfo(overall);

  return {
    type: 'flex',
    altText: `ผลการประเมินทักษะของน้อง — ${overallLabel}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: COLOR.primary,
        paddingAll: '20px',
        contents: [
          { type: 'text', text: '🌾 AGSP', color: COLOR.gold, size: 'xl', weight: 'bold' },
          { type: 'text', text: 'ผลการประเมินทักษะ', color: '#FFFFFF', size: 'sm', margin: 'xs' },
          {
            type: 'box',
            layout: 'horizontal',
            margin: 'md',
            contents: [
              { type: 'text', text: 'ภาพรวม:', color: '#CCCCCC', size: 'sm', flex: 0 },
              {
                type: 'text',
                text: ` ${overallLabel}`,
                color: overallColor,
                size: 'sm',
                weight: 'bold',
                flex: 1,
              },
            ],
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          // Hard Skills
          sectionHeader('💪 Hard Skills'),
          ...hardRows,
          // Soft Skills
          sectionHeader('🤝 Soft Skills'),
          ...softRows,
          // Recommendations
          {
            type: 'separator',
            margin: 'lg',
          },
          {
            type: 'text',
            text: '💡 แนวทางพัฒนาที่แนะนำ',
            weight: 'bold',
            size: 'md',
            color: COLOR.primary,
            margin: 'lg',
          },
          ...recoItems,
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '12px',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '📄 Export ผลเป็น PDF',
              data: 'action=export_pdf',
              displayText: 'ขอ export ผลการประเมินเป็น PDF',
            },
            style: 'primary',
            color: COLOR.primary,
            height: 'sm',
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '🔔 รับการแจ้งเตือนติดตามผล',
              data: 'action=followup_optin',
              displayText: 'สมัครรับการแจ้งเตือนติดตามผล',
            },
            style: 'secondary',
            height: 'sm',
          },
        ],
      },
    },
  };
}

module.exports = { buildResultsFlex };
