# CLAUDE.md — กฎเหล็กสำหรับ Developer

## บริบทโปรเจกต์

ระบบ Skill Assessment & Recommendation สำหรับนักศึกษาหลักสูตรวิทยาศาสตร์การเกษตร  
มหาวิทยาลัยมหิดล — ทำงานผ่าน LINE Bot ชื่อ **AGSP** ที่มีอยู่แล้ว

---

## Stack ที่ใช้

- **Platform**: LINE Messaging API (Webhook-based)
- **Backend**: Node.js หรือ Python (FastAPI) — เลือกตาม stack เดิมของ AGSP Bot
- **Database**: เก็บผลประเมิน ประวัติ follow-up และ consent ของนักศึกษา
- **Admin Dashboard**: Web app แยกต่างหาก (ไม่อยู่ใน LINE)
- **Export**: CSV หรือ PDF — นักศึกษา export เฉพาะของตัวเอง / Admin export ทั้งหมด

---

## สีและ Visual Identity (ใช้ใน Flex Message และ Admin Dashboard)

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

- ภาษาไทยเป็นหลัก ทุก message ที่ส่งหานักศึกษา
- Admin Dashboard อาจมีภาษาอังกฤษได้สำหรับ label เทคนิค
- AGSP เรียกตัวเองว่า "AGSP" เสมอ ห้ามใช้ "ระบบ" หรือ "บอท"
- เรียกนักศึกษาว่า "น้อง" เสมอ ไม่ใช่ "ผู้ใช้" "user" หรือ "ท่าน"

---

## กฎเหล็ก — ห้ามทำเด็ดขาด

1. **ห้ามเก็บข้อมูลที่ระบุตัวตนได้** — ไม่มีชื่อ ไม่มีเบอร์ ไม่มี LINE ID (**ยกเว้น**: เก็บ LINE ID เฉพาะเมื่อนักศึกษา opt-in follow-up อย่างชัดแจ้ง)
2. **ต้องแสดง PDPA consent ก่อนเก็บข้อมูลทุกครั้ง** และต้องได้รับการยืนยันก่อน proceed — consent ต้องระบุวัตถุประสงค์ชัดเจน
3. **ระบบเก็บผลประเมินรายบุคคล** (linked กับ hashed student ID) เพื่อติดตามพัฒนาการส่วนตัว — **แต่ Admin เห็นได้เฉพาะ aggregate** ไม่เห็นข้อมูลรายคน (privacy by design)
4. **นักศึกษามีสิทธิ์ขอดูและลบข้อมูลของตัวเอง** ได้ทุกเมื่อ — ต้องมีช่องทาง request ที่ชัดเจน
5. **ห้ามส่ง push message เกิน 1 ครั้ง/สัปดาห์** ต่อนักศึกษา 1 คน เพื่อป้องกัน spam
6. **ห้ามแสดงคะแนนเป็นตัวเลขดิบ** ให้แสดงเป็น level หรือ visual แทน
7. **ต้องมี unsubscribe / opt-out** จากการแจ้งเตือนเสมอ
8. **ทุก recommendation ต้องผูกกับ TQF / มาตรฐานมหิดล** อย่างน้อย 1 ข้อ

### วัตถุประสงค์การเก็บข้อมูล (ต้องระบุใน consent)

| ข้อมูล | วัตถุประสงค์ | ระยะเวลาเก็บ |
|--------|------------|------------|
| รหัสนักศึกษา (hashed) | เชื่อมผลประเมินกับนักศึกษา | ตลอดการศึกษา |
| ผลประเมินทักษะ | ติดตามพัฒนาการรายบุคคล + วิเคราะห์หลักสูตร | 4 ปี หรือจนกว่าจะขอลบ |
| LINE ID | ส่ง follow-up notifications (เฉพาะ opt-in) | จนกว่าจะ opt-out |
| คำตอบ follow-up | ติดตามผลการพัฒนาทักษะ | 4 ปี หรือจนกว่าจะขอลบ |

---

## Data Schema หลัก (ห้ามเปลี่ยนโดยไม่ review)

```
Student
  - student_id (string, hashed)
  - pdpa_consent (boolean)
  - consent_timestamp (datetime)
  - created_at (datetime)

Assessment
  - assessment_id
  - student_id (FK)
  - taken_at (datetime)
  - hard_skill_scores (JSON)
  - soft_skill_scores (JSON)
  - recommendations (JSON array)

FollowUp
  - followup_id
  - student_id (FK)
  - assessment_id (FK)
  - sent_at (datetime)
  - response (enum: done / not_done / no_response)
  - reason (text, nullable)
  - outcome (text, nullable)
```

---

## Skill Framework อ้างอิง

อ้างอิง **Program Learning Outcomes (PLOs)** หลักสูตรวิทยาศาสตร์การเกษตร มหาวิทยาลัยมหิดล อย่างเป็นทางการ  
รายละเอียดทั้งหมดอยู่ใน `skill-framework.md`

**Hard Skills (5 กลุ่ม — map กับ PLO3, PLO6, PLO1, PLO2)**
- HS1: ทักษะภาคสนามและการผลิตพืช/สัตว์ (PLO1.3, PLO3)
- HS2: ทักษะห้องปฏิบัติการและความปลอดภัย (PLO3.1, PLO3.2)
- HS3: การวิจัยและการจัดการข้อมูล (PLO2.1, PLO2.3, PLO2.4)
- HS4: เทคโนโลยีสารสนเทศและเกษตรสมัยใหม่ (PLO6)
- HS5: ฐานความรู้เกษตรศาสตร์และวิทยาศาสตร์ (PLO1.1, PLO1.3)

**Soft Skills (6 กลุ่ม — map กับ PLO1, PLO2, PLO4, PLO5, PLO6)**
- SS1: การคิดวิเคราะห์และแก้ปัญหา (PLO1)
- SS2: การบริหารโครงการ (PLO2)
- SS3: การสื่อสารและนำเสนอ (PLO4)
- SS4: การทำงานเป็นทีมและความหลากหลาย (PLO5)
- SS5: จริยธรรมและความซื่อสัตย์ทางวิชาการ (PLO1.2, PLO2.2, PLO6.2)
- SS6: การเรียนรู้ด้วยตนเองและการพัฒนาตน (PLO6.1)

> ดู `skill-framework.md` สำหรับคำถามทั้ง 16 ข้อ, scoring logic และ recommendation templates

---

## การ Export

| ผู้ใช้ | Export อะไรได้ | Format |
|-------|--------------|--------|
| นักศึกษา | ผลประเมินและคำแนะนำของตัวเอง | PDF |
| Admin | ข้อมูลทั้งหมด (anonymized หรือ identified) | CSV |
