# CLAUDE.md — กฎเหล็กของโปรเจกต์ Senior Project Tracker

> ไฟล์นี้ใช้เป็นกฎอ้างอิงให้ Claude Code ปฏิบัติตามทุกครั้งที่เขียน/แก้โค้ดในโปรเจกต์นี้

## Stack ที่ใช้
- Frontend: LINE LIFF (HTML/CSS/JS) deploy บน GitHub Pages
- Backend: Google Apps Script (เชื่อม Google Sheets เป็นฐานข้อมูล)
- Auth: LINE Login (ผ่าน LIFF SDK)
- External integration: Google Classroom API (ดึงกำหนดการ + เช็คสถานะ submit แบบ polling)
- Notification: LINE Messaging API (push message)

## 1. สีและธีม (ห้ามต่อรอง)
- โทนสี: **พาสเทล** เท่านั้น ห้ามใช้สีจัด/สีเข้มจี๊ดเป็นสีหลัก
- ห้ามใช้สีแดงเข้ม/ดำเข้มแทนสถานะ "เลยกำหนด" — ให้ใช้สีส้ม/พีชอ่อนแทน ความรู้สึกต้อง "เตือน" ไม่ใช่ "ลงโทษ"
- ชุดสีตัวอย่าง (ปรับเฉดได้ แต่ต้องอยู่ในกลุ่มพาสเทล):
  - Primary: `#A8D8C9` (มินต์อ่อน)
  - Secondary: `#FFD9B3` (พีชอ่อน — ใช้กับสถานะเตือน)
  - Alert (เลยกำหนด): `#FFB3A7` (ส้มชมพูอ่อน ไม่ใช่สีแดง)
  - Success: `#B8E0D2`
  - Background: `#FAFAF8` หรือสีขาวอมครีม
  - Text: เทาเข้ม `#3A3A3A` (ไม่ใช้ดำสนิท)

## 2. ฟอนต์
- ภาษาไทย: `Noto Sans Thai` หรือ `IBM Plex Sans Thai`
- ภาษาอังกฤษ: `Inter` หรือ `IBM Plex Sans`
- ห้ามใช้ฟอนต์ default ของระบบ (Arial/Times New Roman) ในหน้าจอจริง
- ขนาดตัวอักษรต้องอ่านง่ายบนมือถือ (body text ≥ 14px)

## 3. ภาษา
- ระบบต้องรองรับ **ไทย + อังกฤษ สลับได้เต็มรูปแบบ** (ไม่ hardcode ภาษาเดียว)
- ทุก string ที่โชว์ผู้ใช้ ต้องเก็บผ่านไฟล์ language dictionary (เช่น `lang_th.json`, `lang_en.json`) ห้าม hardcode ข้อความลงในโค้ด component ตรงๆ
- Default ภาษา: ไทย

## 4. โทนข้อความ (อ้างอิงจาก brand.md)
- ห้ามใช้คำสั่งห้วน, คำตำหนิ, หรือคำที่ทำให้รู้สึกผิด เช่น "ต้องทำ", "ห้าม", "ผิดกฎ"
- ใช้คำชวนทำ/ให้กำลังใจแทน เช่น "พร้อมหรือยัง", "เหลือเวลาอีก..."
- ข้อความแจ้งเตือนทุกข้อความต้องผ่านการ review เทียบกับตัวอย่างใน `brand.md` ก่อน

## 5. สิ่งที่ห้ามทำ (Hard rules)
1. ห้ามเก็บรหัสผ่าน/credential ของผู้ใช้แบบ plain text
2. ห้ามฝัง API key หรือ token ของ LINE/Classroom ไว้ใน frontend (LIFF/GitHub Pages) — ต้องเก็บใน Google Apps Script properties (Server-side) เท่านั้น
3. ห้ามให้อาจารย์ที่ปรึกษาเห็นข้อมูลของนักศึกษาที่ไม่ใช่ลูกศิษย์ตัวเอง (ต้อง filter by advisor_id ทุกครั้งที่ query)
4. ห้ามให้นักศึกษาเห็นข้อมูลของนักศึกษาคนอื่น
5. ห้ามนับวันเสาร์-อาทิตย์ในการคำนวณ "เตือนล่วงหน้า 2 วันทำการ" — ต้องมี logic skip weekend เสมอ
6. ห้าม mock ข้อมูลหรือเขียนโค้ดที่ดูเหมือนใช้งานได้จริงแต่ที่จริงไม่เชื่อมระบบจริง (ต้องบอกผู้ใช้ตรงๆ ถ้าจุดไหนยังต่อ Classroom API จริงไม่ได้)
7. ห้ามลบหรือ overwrite ข้อมูลใน Google Sheets โดยไม่มีการยืนยัน/backup

## 6. โครงสร้างโปรเจกต์
```
senior-project-tracker/
├── liff-frontend/        # LIFF app, deploy บน GitHub Pages
│   ├── index.html        # หน้า login + router
│   ├── dashboard.html
│   ├── chatbot.html
│   └── assets/
├── apps-script-backend/  # Google Apps Script project
│   ├── Code.gs            # entry point, API endpoints
│   ├── ClassroomSync.gs   # ดึงกำหนดการ/สถานะจาก Classroom
│   ├── Notify.gs          # ส่ง LINE push notification
│   └── SheetSchema.md     # โครงสร้างตาราง Google Sheets
└── docs/
    ├── brand.md
    ├── CLAUDE.md
    └── PRD.md
```

## 7. การทำงานร่วมกับผู้ใช้ (workflow)
- ผู้ใช้แก้ backend โดย copy-paste โค้ดจากไฟล์ `.gs` เข้า Apps Script editor เอง (ไม่ deploy อัตโนมัติ)
- ทุกครั้งที่แก้ schema ตาราง ต้องอัปเดต `SheetSchema.md` ให้ตรงกันเสมอ
- คำสั่ง migrate ข้อมูลเดิม ต้องเขียนแยกจากคำสั่ง setup ครั้งแรก (ห้ามรวมกัน — เคยมีปัญหาเรื่องนี้มาก่อน)
