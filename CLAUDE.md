# CLAUDE.md — กฎเหล็กสำหรับ Developer

## บริบทโปรเจกต์

**AGSP** = LINE Bot ผู้ช่วยนักศึกษาหลักสูตรวิทยาศาสตร์การเกษตร มหาวิทยาลัยมหิดล  
มีสองฟีเจอร์หลักใน codebase เดียวกัน (Next.js บน Vercel):

1. **FAQ Chatbot** — ตอบคำถาม KAAG474 Senior Project ผ่าน Gemini + Google Sheets
2. **Skill Assessment** — ประเมิน Hard Skill / Soft Skill 23 ข้อ พร้อม recommendations ผูก PLO

---

## โครงสร้างโปรเจกต์

```
AGSP-chatbot/
├── app/api/line-webhook/route.ts   ← Unified webhook (FAQ + Assessment)
├── lib/
│   ├── gemini.ts                   ← Gemini AI client
│   ├── line.ts                     ← LINE SDK + signature verify
│   ├── sheet.ts                    ← FAQ จาก Google Sheets (CSV)
│   ├── log.ts                      ← Log คำถามลง Google Sheets
│   └── assessment/                 ← Skill Assessment module
│       ├── questions.ts            ← 23 คำถาม
│       ├── skills.ts               ← 11 skill groups + recommendations
│       ├── scoring.ts              ← คำนวณคะแนน + recommendations
│       ├── session.ts              ← State machine (Vercel KV)
│       ├── db.ts                   ← บันทึกผล (Apps Script webhook)
│       ├── hash.ts                 ← HMAC-SHA256 hash student ID
│       ├── handlers/               ← PDPA → ID → Assessment → Results
│       └── flex/                   ← LINE Flex Messages
├── types/index.ts
├── Student analysis/               ← เอกสาร (brand.md, PRD.md, skill-framework.md)
└── .env.local.example
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22+ |
| Framework | Next.js 15 (App Router) |
| Deployment | Vercel |
| LINE | @line/bot-sdk v9 |
| AI | @google/genai (Gemini 2.5 Flash) |
| Session Store | Vercel KV (Redis) |
| Data Storage | Google Sheets (CSV read + Apps Script write) |

---

## สีและ Visual Identity (Flex Message)

| บทบาท | สี | Hex |
|-------|---|-----|
| Primary | น้ำเงินมหิดล | `#003F88` |
| Accent | ทองมหิดล | `#C9A227` |
| Success / Strength | เขียว | `#2D6A4F` |
| Warning / Gap | ส้ม | `#E07B39` |
| Background | ขาว / เทาอ่อน | `#FFFFFF` / `#F5F5F5` |
| Text | ดำเทา | `#1A1A1A` |

---

## ภาษาและ Tone (บังคับ)

- ภาษาไทยเป็นหลักทุก message ที่ส่งหานักศึกษา
- AGSP เรียกตัวเองว่า "AGSP" เสมอ
- เรียกนักศึกษาว่า "น้อง" เสมอ

---

## กฎเหล็ก — ห้ามทำเด็ดขาด

1. **ห้ามเก็บข้อมูลส่วนตัวใดๆ นอกจากรหัสนักศึกษา** (เข้ารหัสด้วย HMAC-SHA256 เสมอ)
2. **ต้องแสดง PDPA consent ก่อนเก็บข้อมูลทุกครั้ง**
3. **ห้าม Admin เห็นผลประเมินแบบ real-time ของนักศึกษาคนใดคนหนึ่ง** — aggregate / export เท่านั้น
4. **ห้ามส่ง push message เกิน 1 ครั้ง/สัปดาห์** ต่อนักศึกษา 1 คน
5. **ห้ามแสดงคะแนนเป็นตัวเลขดิบ** — แสดงเป็น level หรือ visual bar เท่านั้น
6. **ต้องมี opt-out** จากการแจ้งเตือนเสมอ
7. **ทุก recommendation ต้องผูกกับ TQF / PLO มหิดล** อย่างน้อย 1 ข้อ
8. **ห้าม commit `.env.local`** ที่มี token จริง — ใช้ `.env.local.example` เท่านั้น
9. **HASH_SALT ต้องเหมือนกันทุก deployment** — เปลี่ยนแล้ว hash student_id จะไม่ตรง

---

## Assessment State Machine

```
idle → pdpa_pending → id_input → assessing → completing → idle
                                           ↓
                              returning (เคยทำแล้ว)
```

Session เก็บใน Vercel KV, TTL = 48 ชั่วโมง

---

## Environment Variables ที่จำเป็น

```
LINE_CHANNEL_ACCESS_TOKEN   # LINE Developers Console
LINE_CHANNEL_SECRET         # LINE Developers Console
GEMINI_API_KEY              # Google AI Studio
SHEET_CSV_URL               # Google Sheet FAQ (CSV export URL)
KV_URL                      # Vercel KV
KV_REST_API_URL             # Vercel KV
KV_REST_API_TOKEN           # Vercel KV
HASH_SALT                   # สุ่ม 32+ bytes (ห้ามเปลี่ยนหลัง production)
LOG_WEBHOOK_URL             # (เสริม) Apps Script สำหรับ log คำถาม
ASSESSMENT_WEBHOOK_URL      # (เสริม) Apps Script สำหรับบันทึกผลประเมิน
```

---

## เอกสารอ้างอิง

- `Student analysis/skill-framework.md` — 23 คำถาม, scoring logic, PLO mapping
- `Student analysis/brand.md` — tone, persona, ห้ามใช้คำ
- `Student analysis/PRD.md` — Phase roadmap, export, admin dashboard spec
