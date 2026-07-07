'use strict';

// PDPA Consent Flex Message
// สี: Mahidol Blue #003F88 / Gold #C9A227

function buildPdpaFlex() {
  return {
    type: 'flex',
    altText: 'AGSP ขอความยินยอมก่อนเริ่มประเมิน',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#003F88',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '🌾 AGSP',
            color: '#C9A227',
            size: 'xl',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'ระบบประเมินทักษะนักศึกษา',
            color: '#FFFFFF',
            size: 'sm',
            margin: 'xs',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '📋 ข้อตกลงการใช้งาน (PDPA)',
            weight: 'bold',
            size: 'md',
            color: '#003F88',
          },
          {
            type: 'text',
            text: 'AGSP จะเก็บข้อมูลต่อไปนี้เพื่อวิเคราะห์และพัฒนาระบบการเรียนการสอน:',
            wrap: true,
            size: 'sm',
            color: '#555555',
            margin: 'sm',
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'sm',
            spacing: 'sm',
            contents: [
              makeItem('📌', 'รหัสนักศึกษา (เก็บในรูปแบบเข้ารหัส)'),
              makeItem('📊', 'ผลการประเมินทักษะ Hard Skill และ Soft Skill'),
              makeItem('📝', 'ประวัติการทำแบบประเมินและ follow-up'),
            ],
          },
          {
            type: 'separator',
            margin: 'md',
          },
          {
            type: 'text',
            text: '🔒 สิทธิ์ของน้อง',
            weight: 'bold',
            size: 'sm',
            color: '#003F88',
            margin: 'md',
          },
          {
            type: 'text',
            text: 'น้องสามารถ export ผลของตัวเองเป็น PDF ได้ทุกเมื่อ และขอลบข้อมูลได้โดยติดต่อผู้ดูแลระบบ ข้อมูลจะไม่ถูกเปิดเผยต่อบุคคลภายนอก',
            wrap: true,
            size: 'sm',
            color: '#555555',
            margin: 'sm',
          },
          {
            type: 'text',
            text: '⚠️ ผลการประเมินไม่มีผลต่อคะแนนรายวิชา',
            wrap: true,
            size: 'sm',
            color: '#E07B39',
            weight: 'bold',
            margin: 'sm',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '✅ ยอมรับและเริ่มประเมิน',
              data: 'action=pdpa_accept',
              displayText: 'ยอมรับข้อตกลงและเริ่มประเมิน',
            },
            style: 'primary',
            color: '#003F88',
            height: 'sm',
          },
          {
            type: 'button',
            action: {
              type: 'postback',
              label: '❌ ไม่ยอมรับ',
              data: 'action=pdpa_decline',
              displayText: 'ไม่ยอมรับ',
            },
            style: 'secondary',
            height: 'sm',
          },
        ],
      },
    },
  };
}

function makeItem(icon, text) {
  return {
    type: 'box',
    layout: 'horizontal',
    spacing: 'sm',
    contents: [
      { type: 'text', text: icon, size: 'sm', flex: 0 },
      { type: 'text', text, wrap: true, size: 'sm', color: '#333333', flex: 1 },
    ],
  };
}

module.exports = { buildPdpaFlex };
