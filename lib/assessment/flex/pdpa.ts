/**
 * flex/pdpa.ts — Flex Message สำหรับ PDPA Consent
 * สีมหิดล: Primary #003F88, Accent #C9A227
 */
import type { FlexMessage } from '@line/bot-sdk';

export function buildPdpaFlex(): FlexMessage {
  return {
    type: 'flex',
    altText: 'AGSP: ขอความยินยอมก่อนเริ่มประเมินทักษะ',
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
            text: '🌾 AGSP Skill Assessment',
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
          },
          {
            type: 'text',
            text: 'ระบบประเมินทักษะ | มหาวิทยาลัยมหิดล',
            color: '#C9A227',
            size: 'sm',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: 'ก่อนเริ่มต้น AGSP ขอแจ้งให้ทราบ',
            weight: 'bold',
            size: 'md',
          },
          {
            type: 'text',
            text: 'ระบบจะเก็บข้อมูลต่อไปนี้เพื่อวิเคราะห์ทักษะของน้อง:',
            size: 'sm',
            color: '#555555',
            wrap: true,
          },
          {
            type: 'separator',
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'sm',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '✅', flex: 0, size: 'sm' },
                  {
                    type: 'text',
                    text: 'รหัสนักศึกษา (เก็บในรูปแบบเข้ารหัส)',
                    size: 'sm', wrap: true, flex: 10,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '✅', flex: 0, size: 'sm' },
                  {
                    type: 'text',
                    text: 'คำตอบแบบประเมิน 23 ข้อ',
                    size: 'sm', wrap: true, flex: 10,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '❌', flex: 0, size: 'sm' },
                  {
                    type: 'text',
                    text: 'ไม่เก็บชื่อ เบอร์โทร LINE ID หรือข้อมูลส่วนตัวอื่น',
                    size: 'sm', wrap: true, flex: 10, color: '#888888',
                  },
                ],
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            type: 'text',
            text: 'ข้อมูลจะใช้เพื่อการวิเคราะห์และพัฒนาหลักสูตรเท่านั้น ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) พ.ศ. 2562',
            size: 'xs',
            color: '#888888',
            wrap: true,
          },
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
              label: '✅ ยินยอมและเริ่มประเมิน',
              data: 'action=pdpa_accept',
              displayText: 'ยินยอมและเริ่มประเมินทักษะ',
            },
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'postback',
              label: '❌ ไม่ยินยอม',
              data: 'action=pdpa_decline',
              displayText: 'ไม่ยินยอม',
            },
          },
        ],
      },
    },
  };
}
