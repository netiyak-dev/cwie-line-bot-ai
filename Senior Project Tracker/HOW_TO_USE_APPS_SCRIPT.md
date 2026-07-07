# วิธีการใช้ Google Apps Script สร้าง Google Form

## 📋 ขั้นตอนการติดตั้ง

### ขั้นตอนที่ 1: อัปโหลด Excel ไป Google Sheets

1. ไปที่ **Google Sheets**: https://sheets.google.com
2. คลิก **"+ New"** → **"File upload"**
3. เลือกไฟล์ `KAAG474_Pre-Test_Assessment.xlsx`
4. จะถูก convert เป็น Google Sheet อัตโนมัติ

### ขั้นตอนที่ 2: เปิด Google Apps Script

1. ไปที่ **Extensions** → **Apps Script**
2. จะเปิด Apps Script editor ใหม่

### ขั้นตอนที่ 3: ใส่ Code

1. ลบ code ที่มี (myFunction)
2. Copy-paste code จากไฟล์ `CreateGoogleForm_AppsScript.gs` ทั้งหมด
3. คลิก **💾 Save** (หรือ Ctrl+S)

### ขั้นตอนที่ 4: รัน Script

1. คลิก dropdown **Select function** → เลือก **`createPreTestForm`**
2. คลิก **▶️ Run** (หรือ Ctrl+Enter)
3. อนุญาต access เมื่อได้รับขอ:
   - เลือ account ของคุณ
   - คลิก **"Allow"** ทั้งหมด

### ขั้นตอนที่ 5: รับ Link Google Form

1. ดู **Execution log** (ด้านล่าง) จะเห็น:
   ```
   ✅ Google Form created successfully!
   📄 Form ID: [ID]
   🔗 Form URL: https://docs.google.com/forms/d/...
   ```
2. Copy URL นั้นไปใช้ได้เลย

---

## 🎯 หลังจากสร้าง Google Form แล้ว

### ตั้งค่าเพิ่มเติม (ทำใน Google Forms UI)

1. เปิด Google Form ที่สร้างขึ้น
2. ไปที่ **⚙️ Settings** (มุมบนขวา)
3. ตั้งค่า:
   - ✅ **Collect email addresses**: เปิดให้
   - ☑️ **Limit to 1 response per user**: เปิดให้
   - ✅ **Edit after submit**: เปิดให้ (ให้นักศึกษาแก้ไขได้)
   - Theme: เลือก Professional theme

### แชร์ Form กับนักศึกษา

1. คลิก **Send** (มุมบนขวา)
2. เลือกวิธีแชร์:
   - 📧 **Email**: ส่งเมล
   - 🔗 **Link**: Copy link
   - 📱 **QR Code**: ให้ scan QR
   - 💾 **Embed**: ฝัง ใน website

---

## 📊 การดูผล

### ดู Responses ใน Google Forms

1. เปิด Form → คลิก **Responses** (tab กลาง)
2. จะเห็นสรุปตัวเลขและกราฟอัตโนมัติ
3. หรือคลิก **🗂️ Google Sheets** ไอคอนเพื่อ export ไป Google Sheets

### Analyze Data ใน Google Sheets

ตัวตอบจะถูกบันทึก Google Sheet โดยอัตโนมัติ:
- Row 1: Header (Question titles)
- Row 2+: Student responses
- คุณสามารถ filter, sort, analyze ได้เลย

---

## 🔧 Troubleshooting

### Problem: "Script not found"
**Solution**: ตรวจสอบว่าคุณเลือกแล้วว่าจะใช้ function ไหน คลิก dropdown เลือก `createPreTestForm`

### Problem: "Permission denied"
**Solution**: 
- ตรวจสอบว่า Google Sheet เป็นของคุณ
- ลองออกแล้วเข้า Google Sheet ใหม่
- ลบ credentials ทั้งหมด (Settings → Manage access)

### Problem: "Script ran but no form was created"
**Solution**:
- ตรวจสอบ Execution log เพื่อ error message
- ลองเรียก `createPreTestForm` ใหม่

### Problem: "ต้องการแก้ไขคำถาม"
**Solution**: แก้ไขได้โดยตรงใน Google Forms UI ไม่ต้อง run script ใหม่

---

## 📌 Code Explanation

```javascript
// สร้าง Form ใหม่
const form = FormApp.create(formTitle);

// เพิ่ม Multiple Choice Question
form.addMultipleChoiceItem()
  .setTitle("Question title")
  .setChoices([...])
  .setRequired(true);

// เพิ่ม Scale (Likert) Question
form.addScaleItem()
  .setTitle("Question title")
  .setBounds(1, 5)
  .setLabels("Label 1", "Label 5");

// ตั้งค่า Form
form.setCollectEmail(true);
form.setAllowMultipleResponses(false);
```

---

## 💡 Tips

1. **Rerun script**: หากต้องการสร้าง form ใหม่ ให้ลบ form เก่า ก่อนรัน script อีกครั้ง
2. **Customize**: แก้ไข code ได้เลย (title, description, questions ฯลฯ)
3. **Backup**: Save responses ลง Google Sheets เป็นระดับ

---

## 📞 Support

หากมีปัญหา:
1. ตรวจสอบ Execution log
2. ลองเรียก `createPreTestForm` ใหม่
3. ลบ Apps Script project แล้วสร้างใหม่

---

**Version**: 2026  
**Last Updated**: July 2026
