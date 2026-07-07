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
            text: 'AGSP จะเก็บข้อมูลเพื่อ 2 วัตถุประสงค์:',
            size: 'sm',
            color: '#555555',
            wrap: true,
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
                  { type: 'text', text: '📊', flex: 0, size: 'sm' },
                  {
                    type: 'text',
                    text: 'ติดตามพัฒนาการทักษะของน้องรายบุคคล เพื่อให้คำแนะนำที่ตรงจุดขึ้นเรื่อยๆ',
                    size: 'sm', wrap: true, flex: 10,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '🎓', flex: 0, size: 'sm' },
                  {
                    type: 'text',
                    text: 'วิเคราะห์ภาพรวมเพื่อพัฒนาหลักสูตรวิทยาศาสตร์การเกษตร',
                    size: 'sm', wrap: true, flex: 10,
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
            text: 'ข้อมูลที่เก็บ',
            weight: 'bold',
            size: 'sm',
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
                    text: 'รหัสนักศึกษา (เข้ารหัสก่อนเก็บ ไม่สามารถถอดรหัสกลับได้)',
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
                    text: 'ผลประเมินทักษะ (เก็บรายบุคคล เพื่อติดตามพัฒนาการ)',
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
                    text: 'ไม่เก็บชื่อ เบอร์โทร หรือ LINE ID (LINE ID เก็บเฉพาะถ้าน้องเลือกรับแจ้งเตือน)',
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
            text: 'สิทธิ์ของน้อง: ขอดูหรือลบข้อมูลได้ทุกเมื่อ โดยพิมพ์ "ขอลบข้อมูล" ใน AGSP | เก็บข้อมูลตาม PDPA พ.ศ. 2562',
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
