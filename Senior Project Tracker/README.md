# Senior Project Tracker — Setup Guide

## โครงสร้างไฟล์
```
senior-project-tracker/
├── liff-frontend/
│   └── dashboard.html          # หน้า Dashboard นักศึกษา (เริ่มหน้านี้ก่อน)
├── apps-script-backend/
│   ├── Code.gs                 # API endpoints หลัก
│   ├── Notify.gs                # ส่ง LINE + logic เตือน 2 วันทำการ
│   ├── ClassroomSync.gs         # ดึงข้อมูลจาก Google Classroom
│   └── SheetSchema.md           # โครงสร้างตาราง Google Sheets ที่ต้องสร้าง
└── docs/
    ├── brand.md
    ├── CLAUDE.md
    └── PRD.md
```

## ขั้นตอนเริ่มต้น (ทำตามลำดับ)

1. **สร้าง Google Sheet** ตามโครงสร้างใน `apps-script-backend/SheetSchema.md` (5 แท็บ)
2. **สร้าง Apps Script project** ผูกกับ Google Sheet นั้น แล้ว copy-paste โค้ดจาก `Code.gs`, `Notify.gs`, `ClassroomSync.gs` เข้าไป
3. ใน Apps Script: ไปที่ **Project Settings > Script Properties** เพิ่ม:
   - `SHEET_ID` = ID ของ Google Sheet
   - `LINE_CHANNEL_ACCESS_TOKEN` = token จาก LINE Developers Console (Messaging API channel)
   - `CLASSROOM_COURSE_ID` = course ID จาก Google Classroom วิชานี้
4. ไปที่ **Services (+)** เพิ่ม "Google Classroom API"
5. **Deploy เป็น Web App** (Execute as: Me, Who has access: Anyone) → จะได้ URL สำหรับ frontend เรียกใช้
6. ตั้ง **Time-driven trigger** 2 ตัว:
   - `syncClassroomData` — รันทุก 5-15 นาที
   - `checkAndSendReminders` — รันวันละครั้ง (เช่น 08:00)
7. สร้าง **LIFF app** ใน LINE Developers Console เอา LIFF ID มาใส่ใน `dashboard.html` (จุดที่ comment ไว้ว่า "LIFF SDK")
8. Deploy `liff-frontend/` ขึ้น GitHub Pages แล้วเอา URL ไปผูกกับ LIFF endpoint

## หน้าที่ยังต้องทำต่อ (ยังไม่รวมในรอบนี้)
- หน้า Dashboard อาจารย์ที่ปรึกษา (`advisor-dashboard.html`)
- หน้า Dashboard อาจารย์ผู้สอน/Admin (`admin-dashboard.html`)
- หน้า Chatbot (`chatbot.html`) — ต้องตัดสินใจก่อนว่าจะต่อกับ AI API ตัวไหน
- เชื่อม LIFF SDK จริง (ตอนนี้ `dashboard.html` ยังเป็น mock data เพื่อให้เห็นหน้าตา/ธีมก่อน)
- เติม TODO ใน `ClassroomSync.gs` ให้ map `classroom_user_id` กับ `student_id` ให้ครบ

แจ้งได้เลยครับว่าอยากให้ทำหน้าไหนต่อก่อน
