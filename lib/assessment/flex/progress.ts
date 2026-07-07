/**
 * flex/progress.ts — Flex Message แสดง Progress ของนักศึกษา
 *
 * แสดง:
 *  1. ประวัติคะแนน Hard/Soft ทุกครั้ง (เรียงตามวันที่)
 *  2. สถานะ Follow-up (ถ้าเคย opt-in)
 */
import type { FlexMessage, FlexComponent } from '@line/bot-sdk';
import type { AssessmentSummary } from '../store';
import type { FollowupRecord } from '../followup';

/** แปลง ISO date เป็น "1 ก.ค. 69" */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const thMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${d.getDate()} ${thMonths[d.getMonth()]} ${(d.getFullYear() + 543).toString().slice(2)}`;
}

function scoreColor(score: number): string {
  if (score <= 50) return '#E07B39';
  if (score <= 75) return '#C9A227';
  return '#2D6A4F';
}

function trendEmoji(prev: number, curr: number): string {
  if (curr > prev) return ' ↑';
  if (curr < prev) return ' ↓';
  return '';
}

function buildAttemptRow(summary: AssessmentSummary, index: number, prev?: AssessmentSummary): FlexComponent {
  const isLatest = !prev || index > 0; // prev คือ attempt ก่อนหน้า
  const hardTrend = prev ? trendEmoji(prev.hardScore, summary.hardScore) : '';
  const softTrend = prev ? trendEmoji(prev.softScore, summary.softScore) : '';

  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'xs',
    paddingAll: '10px',
    backgroundColor: index === 0 ? '#F0F4FF' : '#FFFFFF',
    cornerRadius: '8px',
    contents: [
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: `ครั้งที่ ${index + 1}`,
            size: 'xs',
            weight: 'bold',
            color: '#003F88',
            flex: 5,
          },
          {
            type: 'text',
            text: formatDate(summary.assessmentAt),
            size: 'xs',
            color: '#888888',
            align: 'end',
            flex: 5,
          },
        ],
      },
      {
        type: 'box',
        layout: 'horizontal',
        margin: 'xs',
        contents: [
          {
            type: 'text',
            text: `Hard Skill`,
            size: 'xs',
            color: '#555555',
            flex: 4,
          },
          {
            type: 'text',
            text: `${summary.hardScore}%${hardTrend}`,
            size: 'xs',
            weight: 'bold',
            color: scoreColor(summary.hardScore),
            flex: 6,
            align: 'end',
          },
        ],
      },
      {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: `Soft Skill`,
            size: 'xs',
            color: '#555555',
            flex: 4,
          },
          {
            type: 'text',
            text: `${summary.softScore}%${softTrend}`,
            size: 'xs',
            weight: 'bold',
            color: scoreColor(summary.softScore),
            flex: 6,
            align: 'end',
          },
        ],
      },
    ],
  };
}

function buildFollowupSection(followup: FollowupRecord): FlexComponent[] {
  const items: string[] = [];
  if (followup.sent2w)  items.push(`2 สัปดาห์: ${followup.sent2w ? '✅ ส่งแล้ว' : '⏳ รอส่ง'}`);
  if (followup.sent1m)  items.push(`1 เดือน:    ${followup.sent1m ? '✅ ส่งแล้ว' : '⏳ รอส่ง'}`);
  if (followup.sent3m)  items.push(`3 เดือน:    ${followup.sent3m ? '✅ ส่งแล้ว' : '⏳ รอส่ง'}`);

  if (items.length === 0) {
    items.push('⏳ รอการแจ้งเตือนครั้งแรก (2 สัปดาห์)');
  }

  return [
    { type: 'separator', margin: 'md' } as FlexComponent,
    {
      type: 'text',
      text: '🔔 สถานะ Follow-up',
      weight: 'bold',
      size: 'sm',
      margin: 'md',
      color: '#003F88',
    } as FlexComponent,
    ...items.map((item): FlexComponent => ({
      type: 'text',
      text: item,
      size: 'xs',
      color: '#555555',
      margin: 'xs',
    })),
  ];
}

export function buildProgressFlex(
  history: AssessmentSummary[],
  followup: FollowupRecord | null,
): FlexMessage {
  // แสดงล่าสุด 3 ครั้ง (LINE Flex มีขนาดจำกัด)
  const recent = history.slice(-3);

  const attemptRows: FlexComponent[] = recent.map((s, i) =>
    buildAttemptRow(s, history.length - recent.length + i, i > 0 ? recent[i - 1] : undefined)
  );

  // เพิ่ม spacing ระหว่าง rows
  const rowsWithGap: FlexComponent[] = [];
  for (let i = 0; i < attemptRows.length; i++) {
    if (i > 0) rowsWithGap.push({ type: 'box', layout: 'vertical', height: '6px', contents: [] });
    rowsWithGap.push(attemptRows[i]);
  }

  const followupSection = followup?.optIn ? buildFollowupSection(followup) : [];

  // สรุป trend ถ้ามีมากกว่า 1 ครั้ง
  let trendText = '';
  if (history.length >= 2) {
    const first = history[0];
    const last = history[history.length - 1];
    const hardDiff = last.hardScore - first.hardScore;
    const softDiff = last.softScore - first.softScore;
    if (hardDiff > 0 || softDiff > 0) {
      trendText = `📈 Hard ${hardDiff > 0 ? '+' : ''}${hardDiff}% | Soft ${softDiff > 0 ? '+' : ''}${softDiff}% จากครั้งแรก`;
    } else if (hardDiff < 0 && softDiff < 0) {
      trendText = `📉 ยังมีโอกาสพัฒนา ทำใหม่ได้เลย!`;
    } else {
      trendText = `➡️ ทำแบบประเมินมาแล้ว ${history.length} ครั้ง`;
    }
  }

  return {
    type: 'flex',
    altText: 'AGSP: ความก้าวหน้าของน้อง',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#003F88',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: '📈 ความก้าวหน้าของน้อง',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: `ทำแบบประเมินแล้ว ${history.length} ครั้ง`,
            color: '#C9A227',
            size: 'sm',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'none',
        paddingAll: '14px',
        contents: [
          ...(trendText ? [{
            type: 'text' as const,
            text: trendText,
            size: 'xs' as const,
            color: '#2D6A4F',
            wrap: true,
            margin: 'none' as const,
          }, { type: 'box' as const, layout: 'vertical' as const, height: '10px', contents: [] }] : []),
          ...rowsWithGap,
          ...followupSection,
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#003F88',
            height: 'sm',
            action: {
              type: 'postback',
              label: '🔄 ทำแบบประเมินใหม่',
              data: 'action=start_new',
              displayText: 'เริ่มทำแบบประเมินใหม่',
            },
          },
        ],
      },
    },
  };
}
