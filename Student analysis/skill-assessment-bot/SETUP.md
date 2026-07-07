# AGSP Skill Assessment Bot — Setup Guide

## สิ่งที่ต้องเตรียม

- Node.js v18+
- LINE Messaging API Channel (Official Account)
- Public URL สำหรับ Webhook (ใช้ ngrok ในการทดสอบ หรือ Railway/Render ใน production)

---

## 1. ติดตั้ง Dependencies

```bash
cd skill-assessment-bot
npm install
```

---

## 2. ตั้งค่า Environment Variables

```bash
cp .env.example .env
```

แก้ไข `.env`:
```
LINE_CHANNEL_ACCESS_TOKEN=  # จาก LINE Developers Console
LINE_CHANNEL_SECRET=        # จาก LINE Developers Console
PORT=3000
DB_PATH=./data/agsp.db
HASH_SALT=random_string_ยาวๆ_อย่างน้อย_32_ตัวอักษร
```

---

## 3. รัน Bot

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Bot จะรันที่ `http://localhost:3000`  
Webhook endpoint: `http://localhost:3000/webhook`

---

## 4. เชื่อมต่อ LINE Webhook (Local Dev)

ใช้ **ngrok** เพื่อให้ LINE ส่ง event มาถึง localhost:

```bash
# ติดตั้ง ngrok (ถ้ายังไม่มี)
brew install ngrok   # macOS
# หรือ https://ngrok.com/download

# รัน tunnel
ngrok http 3000
```

Copy URL ที่ได้ เช่น `https://abc123.ngrok.io`

ไปที่ **LINE Developers Console**:
1. เลือก Channel → Messaging API
2. Webhook URL: `https://abc123.ngrok.io/webhook`
3. เปิด "Use webhook"
4. กด "Verify" — ต้องขึ้น Success

---

## 5. เชื่อมต่อกับ AGSP Bot ที่มีอยู่แล้ว

ถ้ามี LINE Bot อยู่แล้ว มี 2 แนวทาง:

### Option A: เพิ่ม route ใน bot เดิม (แนะนำ)
นำโค้ดใน `src/` ไปรวมกับ bot เดิม และ forward events ที่เกี่ยวกับ skill assessment มายัง handlers ในโปรเจกต์นี้

### Option B: แยก service
รัน bot นี้เป็น microservice แยกต่างหาก และใช้ Rich Menu ของ bot เดิม link ไปยัง skill assessment flow

---

## 6. Production Deployment (Railway)

```bash
# 1. สร้าง repo ใน GitHub
# 2. ไปที่ railway.app → New Project → Deploy from GitHub
# 3. ตั้ง Environment Variables ใน Railway dashboard
# 4. อัปเดต Webhook URL ใน LINE Developers Console
```

Railway free tier: 500 hours/month — เพียงพอสำหรับ pilot

---

## 7. โครงสร้างไฟล์

```
skill-assessment-bot/
├── src/
│   ├── index.js          ← Express server + event router
│   ├── db/
│   │   └── index.js      ← SQLite + helpers
│   ├── data/
│   │   ├── questions.js  ← คำถาม 23 ข้อ
│   │   └── skills.js     ← skill metadata + recommendations
│   ├── handlers/
│   │   ├── pdpa.js       ← PDPA consent flow
│   │   ├── id.js         ← รับรหัสนักศึกษา
│   │   ├── assessment.js ← ส่งคำถาม + รับคำตอบ
│   │   └── results.js    ← คำนวณ + แสดงผล
│   ├── flex/
│   │   ├── pdpa.js       ← PDPA Flex Message
│   │   └── results.js    ← Results Flex Message
│   └── utils/
│       ├── hash.js       ← Hash student ID
│       └── scoring.js    ← คำนวณคะแนน + recommendations
├── data/                 ← SQLite DB (auto-created)
├── .env.example
├── package.json
└── SETUP.md
```

---

## 8. User Flow

```
นักศึกษาพิมพ์ "ประเมิน"
    ↓
AGSP ส่ง PDPA consent card
    ↓
กด "ยอมรับ" → กรอกรหัสนักศึกษา (8 หลัก)
    ↓
ทำแบบประเมิน 23 ข้อ (Quick Reply)
    ↓
แสดงผล Flex Message (Hard Skill + Soft Skill + Recommendations)
    ↓
เลือก: Export PDF | รับการแจ้งเตือน
```

---

## 9. State Machine

| State | ความหมาย |
|-------|---------|
| `idle` | ยังไม่เริ่ม |
| `pdpa_pending` | แสดง PDPA รอยืนยัน |
| `id_input` | รอรหัสนักศึกษา |
| `returning` | เคยทำแล้ว รอเลือก |
| `assessing` | กำลังทำแบบประเมิน |
| `completing` | คำนวณและแสดงผล |

---

## 10. สิ่งที่ต้องทำต่อ (Phase ถัดไป)

- [ ] Export PDF จริง (ใช้ puppeteer หรือ PDFKit)
- [ ] Follow-up push message scheduler
- [ ] Admin Dashboard (web app แยก)
- [ ] Rich Menu สำหรับ LINE Bot
- [ ] ทดสอบกับนักศึกษากลุ่ม pilot

---

## ⚠️ ข้อควรระวัง

- **ห้าม commit `.env`** ที่มี token จริง ใช้ `.env.example` เท่านั้น
- **DB file** (`data/agsp.db`) ควร backup เป็นประจำ
- **HASH_SALT** ต้องเหมือนกันทุก deployment ไม่เช่นนั้น student_id จะ hash ไม่ตรง
- LINE Bot reply token มีอายุ **30 วินาที** ถ้าช้ากว่านั้นต้องใช้ push message
