# Google Sheets Schema — Senior Project Tracker

> สร้าง Google Sheet 1 ไฟล์ แล้วทำ 4 แท็บ (sheet) ตามนี้ ชื่อแท็บต้องตรงเป๊ะ เพราะ Code.gs เรียกชื่อแท็บตรงๆ

## แท็บ "Students"
| Column | Type | คำอธิบาย |
|---|---|---|
| student_id | string | รหัสนักศึกษา (primary key) |
| name | string | ชื่อ-นามสกุล |
| line_user_id | string | ได้จาก LINE Login ครั้งแรก |
| advisor_id | string | รหัสอ้างอิงอาจารย์ที่ปรึกษา (ตรงกับแท็บ Advisors) |

## แท็บ "Advisors"
| Column | Type | คำอธิบาย |
|---|---|---|
| advisor_id | string | primary key |
| name | string | ชื่ออาจารย์ที่ปรึกษา |
| line_user_id | string | ได้จาก LINE Login ครั้งแรก |

## แท็บ "Assignments"
| Column | Type | คำอธิบาย |
|---|---|---|
| assignment_id | string | primary key |
| title | string | ชื่องาน |
| description | string | รายละเอียด |
| due_date | date (YYYY-MM-DD) | วันกำหนดส่ง |
| source | "manual" \| "classroom_sync" | ที่มาของกำหนดการ |
| classroom_coursework_id | string (optional) | ใช้ตอน sync จาก Classroom |

## แท็บ "Submissions"
| Column | Type | คำอธิบาย |
|---|---|---|
| submission_id | string | primary key |
| student_id | string | FK → Students |
| assignment_id | string | FK → Assignments |
| status | "not_started" \| "submitted" \| "late" | สถานะปัจจุบัน |
| submitted_at | datetime (optional) | เวลาที่ submit |
| classroom_submission_link | string (optional) | ลิงก์ไปหน้า submission ใน Classroom |

## แท็บ "ChatLogs"
| Column | Type | คำอธิบาย |
|---|---|---|
| log_id | string | primary key |
| user_id | string | line_user_id ของผู้ถาม |
| message | string | คำถามจากผู้ใช้ |
| response | string | คำตอบจาก chatbot |
| timestamp | datetime | เวลาที่สนทนา |

## แท็บ "AssessmentResponses" (ใหม่)
> เก็บผลแบบประเมินความพร้อมก่อนเริ่มโครงงาน — การมีแถวในแท็บนี้ = นักศึกษาคนนั้นทำแบบประเมินแล้ว (ใช้เป็นตัวเช็ค gate ก่อนเข้า Dashboard)

| Column | Type | คำอธิบาย |
|---|---|---|
| response_id | string | primary key |
| line_user_id | string | ผู้ตอบ |
| lab_skill | number (1-5) | ทักษะ Lab |
| writing_skill | number (1-5) | ทักษะเขียนวิชาการ |
| interests | string | comma-separated tags เช่น "tissue_culture,environment" |
| interest_note | string | หมายเหตุเพิ่มเติม (ไม่บังคับ) |
| time_management | number (1-5) | วินัย/ความตรงเวลา |
| hours_per_week | number (1-4) | ระดับเวลาที่มีต่อสัปดาห์ |
| completed_at | datetime | เวลาที่ทำแบบประเมิน |

## แท็บ "AdvisorTopics" (ใหม่ — ยังไม่มีข้อมูลจริง ตอนนี้ใช้ mock ใน Code.gs ก่อน)
> เมื่อมีข้อมูลจริงแล้ว ให้สร้างแท็บนี้และแก้ `getMockAdvisorTopics_()` ใน Code.gs ให้อ่านจากแท็บนี้แทน

| Column | Type | คำอธิบาย |
|---|---|---|
| advisor_id | string | FK → Advisors |
| expertise_tags | string | comma-separated เช่น "tissue_culture,plant_genetics" |
| topic_title | string | ชื่อหัวข้องาน |
| topic_description | string | รายละเอียดหัวข้อ |
| capacity | number | จำนวนนักศึกษาที่รับได้ (ไม่บังคับ ใช้ตอนอยากจำกัดโควต้า) |

## หมายเหตุสำคัญ
- `advisor_id` ใน Students ต้อง enforce การกรองข้อมูลทุกครั้งที่ Advisor ดึงข้อมูล (ดูกฎใน CLAUDE.md หัวข้อ 5.3)
- ห้ามลบแถวใน Submissions โดยตรง ถ้าจะแก้สถานะให้ update field `status` แทน เพื่อเก็บ history
