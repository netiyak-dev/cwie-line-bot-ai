# AGSP-chatbot — LINE bot ผู้ช่วย KAAG474 Senior Project

LINE bot "AGSP" ผู้ช่วยตอบคำถามนักศึกษาเกี่ยวกับรายวิชา **KAAG474 Senior Project**
(วิทยาศาสตร์การเกษตร) — ดึง FAQ จาก Google Sheet แล้วให้ Gemini ตอบตามข้อมูลในชีตเท่านั้น

> ดัดแปลงมาจากโปรเจกต์ CWIE-chatbot เดิม เปลี่ยนบริบท/persona เป็น Senior Project
> และเปลี่ยนแหล่งข้อมูลมาใช้ชีต FAQ ของ KAAG474

## โครงสร้าง

- [app/api/line-webhook/route.ts](app/api/line-webhook/route.ts) — LINE webhook: verify signature → ดึง FAQ → ถาม Gemini → reply
- [lib/gemini.ts](lib/gemini.ts) — เรียก Gemini + system prompt (persona "AGSP" ผู้ช่วย Senior Project)
- [lib/sheet.ts](lib/sheet.ts) — ดึง FAQ จาก Google Sheet (CSV) พร้อม cache 60 วิ
- [lib/line.ts](lib/line.ts) — LINE SDK client + verify signature

## แหล่งข้อมูล FAQ

Google Sheet: `KAAG474_Chatbot` (คอลัมน์ Category / Intent / User Question / Chatbot Answer / Quick Reply / Notes)
ตั้งค่า Share = **Anyone with the link** แล้วดึงผ่าน CSV export ได้เลย (ไม่ต้อง Publish to web)

## ตั้งค่า

คัดลอก [.env.local.example](.env.local.example) เป็น `.env.local` แล้วเติมค่า:

- `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET` — จาก LINE Developers Console
- `GEMINI_API_KEY` — จาก Google AI Studio
- `SHEET_CSV_URL` — URL export CSV ของชีต FAQ (ตั้งค่าไว้ให้แล้วในไฟล์ example)
- `GEMINI_MODEL` — (เสริม) ดีฟอลต์ `gemini-2.5-flash`

บน Vercel ให้ตั้งค่าตัวแปรเดียวกันใน Project Settings > Environment Variables

## รัน

```bash
npm install
npm run dev
```
