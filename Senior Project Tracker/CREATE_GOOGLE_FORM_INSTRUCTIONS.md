
# วิธีการสร้าง Google Form จากไฟล์ config นี้

## Option 1: สร้างด้วย Google Forms UI (ง่ายที่สุด)

1. เปิด Google Forms: https://forms.google.com
2. คลิก "Create a new form"
3. ตั้งชื่อฟอร์ม: "KAAG 474 Senior Project — Pre-Test Assessment"
4. เพิ่มคำอธิบาย: "แบบประเมิน Pre-Test เพื่อประเมินความเข้าใจและทักษะของนักศึกษาก่อนเรียนวิชา Senior Project"
5. ทำตามข้อมูลในไฟล์ KAAG474_PreTest_GoogleForm_Config.json เพื่อสร้างคำถามทั้งหมด

## Option 2: ใช้ Google Forms API (สำหรับ developer)

สามารถใช้ Python script พร้อม google-forms-api library:

```bash
pip install google-forms-api
python create_google_form.py KAAG474_PreTest_GoogleForm_Config.json
```

## Option 3: ใช้ Google Sheets + Forms

1. สร้าง Google Sheet ใหม่
2. เพิ่มข้อมูลคำถามในแต่ละแถว
3. ใช้ "Form" menu → "Create a form"

---

## ข้อมูลในไฟล์ config:

**SECTION A**: ความเข้าใจ (6 multiple choice questions)
**SECTION B**: Hard Skills (8 linear scale questions)
**SECTION C**: Soft Skills (6 linear scale questions)
**SECTION D**: AI Tools (5 multiple choice + 1 paragraph)

**Total: 30+ questions, ~15-20 minutes to complete**

---

## Setting ที่แนะนำ:

- ☑ Collect email addresses: ✓ Yes
- ☑ Allow multiple responses: ✗ No
- Confirmation message: "ขอบคุณที่ตอบแบบประเมิน! คณะลงทะเบียนรับทราบแล้ว"
- Theme: Light blue or Professional

---

## หลังจากสร้าง Google Form:

1. ไปที่ Settings → Collect email addresses
2. ตั้ง "Limit to 1 response per user"
3. เปิด "Edit after submit" ให้นักศึกษาแก้ไขได้
4. ทำการแชร์ลิงก์ไปให้นักศึกษา
5. ตัวตอบจะถูกบันทึกใน Google Sheet อัตโนมัติ

---

**ไฟล์: KAAG474_PreTest_GoogleForm_Config.json**

สามารถนำไปใช้กับ Google Forms API หรือใช้เป็นแบบอ้างอิงในการสร้างฟอร์มด้วย UI
