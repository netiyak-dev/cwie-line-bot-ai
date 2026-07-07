# PRD — Senior Project Tracker

## 1. ภาพรวม
ระบบติดตามงาน Senior Project รายบุคคล แจ้งเตือนนักศึกษาและอาจารย์ที่ปรึกษาให้ทำงานตามกำหนดการในวิชา (Course Syllabus) ผ่าน LINE และหน้า Dashboard

## 2. ผู้ใช้ระบบ (Roles)
| Role | สิทธิ์ |
|---|---|
| นักศึกษา (Student) | ดูกำหนดการ, อัปเดตสถานะงานตัวเอง, ดู Dashboard ตัวเอง, คุยกับ Chatbot |
| อาจารย์ที่ปรึกษา (Advisor) | ดู Dashboard ของลูกศิษย์ตัวเองเท่านั้น ผ่าน LINE |
| อาจารย์ผู้สอน (Admin) | ดูข้อมูลทั้งหมดของทุกคนในวิชา, จัดการกำหนดการ |

## 3. ข้อมูลหลักที่ระบบเก็บ (Data Model)

### Students
- student_id, name, line_user_id, advisor_id

### Assignments (กำหนดการ/งาน)
- assignment_id, title, description, due_date, source (manual / classroom_sync), classroom_coursework_id (ถ้ามี)

### Submissions (สถานะการส่งงาน)
- submission_id, student_id, assignment_id, status (not_started / submitted / late), submitted_at, classroom_submission_link

### ChatLogs
- log_id, user_id (student/advisor), message, response, timestamp

### AssessmentResponses (ใหม่)
- response_id, line_user_id, lab_skill, writing_skill, interests, interest_note, time_management, hours_per_week, completed_at

### AdvisorTopics (ใหม่ — mock ไปก่อน รอข้อมูลจริง)
- advisor_id, expertise_tags, topic_title, topic_description, capacity

## 4. สเปคแต่ละหน้า (Page Specs)

### 4.1 หน้า Login
- เปิดผ่าน LIFF → LINE Login อัตโนมัติ (ไม่ต้องกรอก username/password)
- ครั้งแรกที่ login ต้อง map line_user_id เข้ากับ student_id/advisor_id (ถ้ายังไม่เคย map ให้กรอกรหัสนักศึกษาเพื่อยืนยันตัวตนครั้งเดียว)

### 4.2 หน้า Dashboard — นักศึกษา
- แสดงรายการงานทั้งหมด พร้อมสถานะ (สีพาสเทลตามสถานะ: ยังไม่เริ่ม / ใกล้ครบกำหนด / ส่งแล้ว / เลยกำหนด)
- แสดง "งานที่ต้องทำต่อไป" เด่นที่สุดบนหน้าจอ (เรียงตาม due_date ใกล้สุดก่อน)
- ปุ่มลิงก์ไปหน้า Google Classroom เพื่อส่งงาน
- ปุ่มอัปเดตสถานะ (กรณี polling ยังไม่ทันเช็ค)
- Badge/แถบเตือนถ้ามีงานใกล้ครบกำหนดภายใน 2 วันทำการ

### 4.3 หน้า Dashboard — อาจารย์ที่ปรึกษา
- แสดงรายชื่อลูกศิษย์ทั้งหมดของตัวเอง พร้อมสถานะงานล่าสุดของแต่ละคน (สรุปแบบภาพรวม)
- กดดูรายละเอียดรายบุคคลได้ (deep link ไปหน้ารายละเอียดของนักศึกษาคนนั้น)
- ไม่เห็นข้อมูลนักศึกษาที่ไม่ใช่ลูกศิษย์ตัวเอง

### 4.4 หน้า Dashboard — Admin (อาจารย์ผู้สอน)
- เห็นภาพรวมทั้งวิชา: จำนวนนักศึกษาที่ตรงกำหนด/เลยกำหนด ทั้งหมด
- จัดการกำหนดการ (เพิ่ม/แก้ไข manual) และ sync จาก Classroom
- ดูข้อมูลรายบุคคลของทุกคนได้

### 4.5 หน้า Chatbot
- ถามสถานะงานของตัวเองได้ (เช่น "งานต่อไปคืออะไร", "ใกล้ครบกำหนดอะไรบ้าง")
- ขอลิงก์เข้าหน้า Dashboard หรือ Classroom ได้
- บันทึก log การสนทนาไว้ใน ChatLogs

### 4.6 หน้าแบบประเมินความพร้อม (Assessment) — ใหม่
- **บังคับให้นักศึกษาทำก่อน** ถึงจะเข้า Dashboard หลักได้ (เช็คผ่าน `hasCompletedAssessment_` ใน backend)
- ผสม 3 ด้านในฉบับเดียว:
  1. ความรู้/ทักษะพื้นฐาน (ทักษะ Lab, ทักษะเขียนวิชาการ)
  2. ความสนใจในหัวข้อวิจัย (เลือก tag ความสนใจ + หมายเหตุเพิ่มเติม)
  3. วินัย/การจัดการเวลา (ความตรงเวลา, จำนวนชั่วโมงที่มีต่อสัปดาห์)
- ส่งผลแล้วไปหน้า Recommendation ต่อทันที

### 4.7 หน้าแนะนำหัวข้องาน/อาจารย์ที่ปรึกษา (Recommendation) — ใหม่
- เรียก AI วิเคราะห์ผลแบบประเมิน เทียบกับรายชื่ออาจารย์/หัวข้องานที่เปิดรับ
- แสดงผล **Top 3** อันดับ พร้อมเหตุผลที่ AI ให้ (อิงจากคำตอบจริงของนักศึกษา)
- มีปุ่ม "ติดต่ออาจารย์" ต่อท้ายแต่ละอันดับ ให้นักศึกษาติดต่อได้เอง (ไม่ใช่ระบบ assign อัตโนมัติ)
- มีปุ่ม "ทำแบบประเมินใหม่อีกครั้ง" ถ้าอยากแก้คำตอบ

## 5. Logic การแจ้งเตือน (Notification Rules)
- เตือนล่วงหน้า **อย่างน้อย 2 วันทำการ** ก่อนถึง due_date (ไม่นับเสาร์-อาทิตย์)
- ส่งแจ้งเตือนไปยัง **นักศึกษา + อาจารย์ที่ปรึกษา** พร้อมกัน
- ช่องทาง: LINE push message + แสดง badge เตือนในหน้า Dashboard
- เมื่อนักศึกษาส่งงานสำเร็จ (ตรวจจากการ sync Classroom) → แจ้งสถานะอัปเดตไปยังนักศึกษาและอาจารย์ที่ปรึกษา

## 6. การ Sync กับ Google Classroom
- ใช้วิธี **Polling** ผ่าน Apps Script time-driven trigger (เช็คทุก 5–15 นาที)
- ดึงกำหนดการ (coursework) และสถานะการส่ง (submission) มาอัปเดตในตาราง Assignments/Submissions
- กำหนดการที่กรอกเอง (manual) และที่ sync มาจาก Classroom อยู่ร่วมกันได้ในตารางเดียว (แยกด้วย field `source`)

## 7. ขอบเขตที่ยังไม่รวมในเวอร์ชันแรก (Out of scope)
- การให้คะแนน/ตรวจงาน (อยู่ใน Classroom อยู่แล้ว ไม่ทำซ้ำ)
- การแจ้งเตือนแบบ real-time push ทันทีที่ submit (ใช้ polling แทน)
- ระบบจัดการสิทธิ์แบบละเอียด (เริ่มจาก 3 role พื้นฐานก่อน)
