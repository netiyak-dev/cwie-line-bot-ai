# Training Guide: สร้าง AI Chatbot บน LINE สำหรับงานการศึกษา
### ระบบประเมินทักษะนักศึกษาด้วย AI — กรณีศึกษา AGSP Bot

> **เหมาะสำหรับ:** อาจารย์ / นักวิชาการ / ผู้ที่สนใจสร้าง Chatbot เพื่อการศึกษา  
> **ระดับ:** ไม่จำเป็นต้องมีพื้นฐาน coding  
> **เวลาทั้งหมด:** 10 ชั่วโมง (4 Module)

---

## ภาพรวมระบบ (Big Picture)

ก่อนเริ่มสอน ให้ผู้เรียนเข้าใจว่าระบบนี้ทำงานอย่างไรในภาพรวม เปรียบเหมือน **"สายพานการผลิต"** ที่แต่ละส่วนทำงานต่อกัน:

```
นักศึกษาพิมพ์ใน LINE
        ↓
LINE Platform (รับข้อความ)
        ↓
Server บน Vercel (ประมวลผล + AI)
        ↓
เก็บข้อมูลใน KV Store + Google Sheets
        ↓
ส่งผลกลับหานักศึกษาใน LINE
```

**เครื่องมือที่ใช้ทั้งหมด (ฟรีหรือต้นทุนต่ำมาก):**

| เครื่องมือ | หน้าที่ | ราคา |
|-----------|---------|------|
| LINE Developers Console | จุดเชื่อมกับนักศึกษา | ฟรี |
| Vercel | รัน server โค้ด | ฟรี (Hobby) |
| Google Sheets | เก็บคำถาม FAQ + log | ฟรี |
| Vercel KV | เก็บ session + ผลประเมิน | ฟรี |
| Google Gemini API | AI ตอบคำถาม | ฟรี |
| GitHub | เก็บโค้ด + deploy อัตโนมัติ | ฟรี |
| cron-job.org | ส่งแจ้งเตือนอัตโนมัติ | ฟรี |
| Claude (AI) | ช่วยเขียนและแก้ไขโค้ด | — |

---

---

# ส่วนที่ 1: Instructor Guide (คู่มืออาจารย์)

---

## วัตถุประสงค์การเรียนรู้ (Learning Outcomes)

เมื่อผ่านการอบรมแล้ว ผู้เรียนสามารถ:

1. **อธิบาย** สถาปัตยกรรมของระบบ LINE Chatbot + AI ได้ในระดับ conceptual
2. **ตั้งค่า** เครื่องมือทั้งหมด (LINE, Vercel, GitHub, Google Sheets) โดยไม่ต้องเขียนโค้ดเอง
3. **ปรับแต่ง** เนื้อหาคำถาม, ทักษะ, และคำแนะนำให้ตรงกับหลักสูตรของตนเอง
4. **ทดสอบ** และ **deploy** ระบบให้ใช้งานได้จริงกับนักศึกษา
5. **ประเมิน** ข้อมูลผลลัพธ์ผ่าน Google Sheets

---

## แผนการสอน (Course Outline)

### Module 1: เข้าใจระบบ (2 ชั่วโมง)

**เป้าหมาย:** ผู้เรียนเข้าใจ "ทำไม" และ "อะไร" ก่อน "อย่างไร"

**กิจกรรม:**

1. **Ice-breaker (15 นาที)** — ให้ผู้เรียนลองใช้ AGSP Bot จริงบน LINE ก่อน แล้วตั้งคำถามว่า "คิดว่าระบบทำงานอย่างไร?"

2. **Lecture: Architecture Overview (30 นาที)**  
   - อธิบาย diagram "สายพานการผลิต" ด้านบน
   - เปรียบเทียบ: LINE = โทรศัพท์, Vercel = โรงงาน, Google Sheets = สมุดบันทึก, KV = กระดาษโน้ตชั่วคราว
   - แนะนำแต่ละเครื่องมือและหน้าที่

3. **Demo: ดู flow จริง (30 นาที)**  
   - เปิด LINE Developers Console ให้ดู webhook
   - เปิด Vercel ให้ดู deployment log
   - เปิด Google Sheets ให้ดูข้อมูลที่เก็บไว้

4. **กิจกรรมกลุ่ม: วาด Architecture ของ Bot ในฝัน (45 นาที)**  
   - แบ่งกลุ่ม 3-4 คน
   - วาดภาพ flow ของ Chatbot ที่อยากสร้างสำหรับวิชาตัวเอง
   - นำเสนอ 2 นาที/กลุ่ม

**สิ่งที่ผู้เรียนได้รับ:** ความเข้าใจ conceptual + แรงบันดาลใจ

---

### Module 2: Setup & Configuration (3 ชั่วโมง)

**เป้าหมาย:** ผู้เรียนตั้งค่าเครื่องมือทุกอย่างและได้ Bot ที่ทำงานได้จริง

**ข้อกำหนดเบื้องต้น:**
- บัญชี Gmail
- บัญชี LINE (ส่วนตัว)
- เบราว์เซอร์ Chrome

**ขั้นตอน Step-by-step:**

**Step 1: Fork โปรเจกต์ (15 นาที)**
1. เปิด GitHub: `github.com/netiyak-dev/cwie-line-bot-ai`
2. กดปุ่ม **Fork** มุมขวาบน → Create fork
3. ตอนนี้มีโค้ดใน GitHub account ของตัวเองแล้ว

> 💡 **อุปมา:** Fork เหมือนการถ่ายเอกสาร — ได้สำเนาที่แก้ไขได้โดยไม่กระทบต้นฉบับ

**Step 2: ตั้งค่า LINE Bot (30 นาที)**
1. ไป `developers.line.biz` → Log in ด้วย LINE account
2. กด **Create a new provider** → ตั้งชื่อ (เช่น ชื่อมหาวิทยาลัย)
3. กด **Create a new channel** → เลือก **Messaging API**
4. กรอกข้อมูล:
   - Channel name: ชื่อ Bot ของท่าน
   - Channel description: อธิบายสั้นๆ
   - Category: Education
5. ไปที่ **Messaging API** tab → คัดลอก **Channel secret**
6. เลื่อนลงมา **Channel access token** → กด **Issue** → คัดลอก

> ⚠️ **เก็บ token ทั้งสองไว้ อย่าแชร์ให้ใคร** — เหมือนกุญแจบ้าน

**Step 3: Deploy บน Vercel (30 นาที)**
1. ไป `vercel.com` → Sign up ด้วย GitHub account
2. กด **Add New Project** → Import จาก GitHub → เลือก repo ที่ fork มา
3. กด **Deploy** (รอ ~2 นาที)
4. หลัง deploy สำเร็จ จะได้ domain เช่น `my-bot.vercel.app`

**Step 4: ตั้งค่า Environment Variables (30 นาที)**

ใน Vercel Dashboard → Settings → Environment Variables → เพิ่มทีละตัว:

| Variable | ที่มา | ตัวอย่าง |
|----------|------|---------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Console → Messaging API | `abc123...` |
| `LINE_CHANNEL_SECRET` | LINE Console → Basic settings | `def456...` |
| `GEMINI_API_KEY` | `aistudio.google.com` → Get API Key | `AIza...` |
| `SHEET_CSV_URL` | Google Sheets → File → Share → Publish as CSV | `https://docs.google.com/...` |
| `KV_URL` | Vercel → Storage → Create KV | auto-filled |
| `HASH_SALT` | สุ่มเอง 32 ตัวอักษร | `randomstring32chars...` |

> ⚠️ **HASH_SALT สำคัญมาก** — ห้ามเปลี่ยนหลัง deploy แรก เพราะจะทำให้ข้อมูลนักศึกษาเดิมหาไม่เจอ

**Step 5: เชื่อม Webhook กลับ LINE (15 นาที)**
1. กลับไป LINE Developers Console
2. **Messaging API** tab → Webhook settings
3. ใส่ URL: `https://[your-domain].vercel.app/api/line-webhook`
4. กด **Verify** → ต้องได้ "Success"
5. เปิด **Use webhook** = ON

**Step 6: ทดสอบเบื้องต้น (30 นาที)**
1. เปิด LINE → เพิ่มเพื่อน Bot (QR Code ใน LINE Console)
2. พิมพ์ "สวัสดี" → ต้องได้รับ PDPA card
3. ถ้าไม่มีอะไรตอบ → ดู Vercel Logs → Functions → line-webhook

---

### Module 3: Customize สำหรับวิชาตัวเอง (3 ชั่วโมง)

**เป้าหมาย:** ผู้เรียนปรับแต่ง Bot ให้ตรงกับบริบทของตนเอง **โดยใช้ Claude AI ช่วยเขียนโค้ด**

**หลักการสำคัญ: "ไม่ต้องเขียนโค้ดเอง ให้ Claude เขียนให้"**

แนะนำ workflow นี้กับผู้เรียน:
```
1. เปิด claude.ai หรือ Claude desktop
2. บอก Claude ว่าต้องการเปลี่ยนอะไร
3. Claude จะบอกว่าต้องแก้ไฟล์ไหน บรรทัดไหน อย่างไร
4. แก้ตาม → commit → Vercel auto-deploy
```

**กิจกรรม 3.1: แก้ไขคำถามประเมิน (60 นาที)**

ไฟล์ที่ต้องแก้: `lib/assessment/questions.ts`

ตัวอย่าง Prompt สำหรับ Claude:
```
"ฉันมีไฟล์ questions.ts ในระบบ LINE Bot
อยากเพิ่มคำถามใหม่เกี่ยวกับ [ทักษะที่ต้องการ]
ช่วยเขียน format ให้ถูกต้องด้วย"
```

โครงสร้างคำถาม 1 ข้อ:
```
id: รหัสคำถาม (เช่น H1Q1)
text: ข้อความคำถาม
skillId: ทักษะที่วัด (เช่น HS1, SS2)
options: ตัวเลือก 4 ข้อ (score 1-4)
```

**กิจกรรม 3.2: แก้ไข Skill Framework (45 นาที)**

ไฟล์ที่ต้องแก้: `lib/assessment/skills.ts` และ `Student analysis/skill-framework.md`

สิ่งที่ปรับได้:
- เพิ่ม/ลด กลุ่มทักษะ
- เปลี่ยน PLO mapping ให้ตรงกับหลักสูตร
- แก้ไขคำแนะนำ (recommendations) ให้เหมาะกับบริบท

**กิจกรรม 3.3: แก้ไขข้อมูล FAQ (30 นาที)**

ปรับ Google Sheets โดยตรง ไม่ต้องแตะโค้ด:
- Sheet 1 "Chatbot_FAQ": เพิ่มคู่ Q&A ของวิชา
- Sheet 2 "Quick_Reply": เพิ่มปุ่ม quick reply
- Vercel จะดึงข้อมูลใหม่อัตโนมัติ

**กิจกรรม 3.4: Workshop "Deploy Bot ของตัวเอง" (45 นาที)**
1. แต่ละคนเลือก 1 ทักษะที่อยากเพิ่ม
2. Prompt Claude ให้เขียนโค้ดส่วนที่เกี่ยวข้อง
3. แก้ไขไฟล์และ commit
4. Vercel auto-deploy → ทดสอบใน LINE

---

### Module 4: Deploy & Monitor (2 ชั่วโมง)

**เป้าหมาย:** ระบบทำงานได้จริงในสภาพแวดล้อม production

**กิจกรรม 4.1: ตั้งค่า Follow-up Notifications (30 นาที)**

1. ไป `cron-job.org` → สร้าง account
2. Create cronjob:
   - URL: `https://[your-domain].vercel.app/api/cron/followup`
   - Method: GET
   - Schedule: Every day at 09:00
   - Header: `x-cron-secret: [ค่า CRON_SECRET ใน Vercel]`
3. กด **Run now** → ตรวจสอบ response `{"ok":true}`

**กิจกรรม 4.2: ดูข้อมูลผลลัพธ์ (30 นาที)**

สิ่งที่ดูได้ใน Google Sheets:
- **FAQ_Log**: คำถามที่นักศึกษาถาม, AI ตอบอะไร, ตอบถูกไหม
- **Assessment_Results**: ผลคะแนน (anonymized) แยกตาม skill group
- **FollowUp_OptIn**: รายการนักศึกษาที่รับการแจ้งเตือน

สิ่งที่ดูได้ใน Vercel:
- Analytics: จำนวน requests/วัน
- Functions Log: error ถ้ามี

**กิจกรรม 4.3: การแก้ปัญหาเบื้องต้น (30 นาที)**

| อาการ | สาเหตุที่เป็นไปได้ | วิธีแก้ |
|------|-----------------|--------|
| Bot ไม่ตอบเลย | Webhook URL ผิด | ตรวจสอบ URL ใน LINE Console |
| Bot ตอบ error | Environment variable ขาด | ตรวจ Vercel → Settings → Env Vars |
| FAQ ไม่อัพเดต | Google Sheets ไม่ได้ Publish | File → Share → Publish to web |
| Assessment ไม่บันทึก | ASSESSMENT_WEBHOOK_URL ว่าง | ใส่ Apps Script URL ใน Vercel |

**กิจกรรม 4.4: Retrospective & Next Steps (30 นาที)**
- แต่ละคนนำเสนอ Bot ของตัวเอง 3 นาที
- อภิปราย: จะนำไปประยุกต์ใช้กับวิชาอะไร?
- วางแผน: Phase ถัดไปคืออะไร?

---

## เกณฑ์การประเมินผู้เรียน

| เกณฑ์ | คะแนน | วิธีประเมิน |
|------|------|-----------|
| Bot ทำงานได้จริง (ส่ง-รับข้อความ) | 30% | Demo |
| แก้ไขคำถาม/ทักษะให้ตรงบริบท | 30% | ตรวจไฟล์ |
| อธิบาย Architecture ได้ | 20% | Oral exam |
| Plan การนำไปใช้งานจริง | 20% | Presentation |

---

---

# ส่วนที่ 2: Student Handout (คู่มือนักศึกษา)

---

## คู่มือสร้าง LINE Bot ด้วย AI สำหรับมือใหม่

### "เปลี่ยนไอเดียเป็น Chatbot ใน 1 วัน โดยไม่ต้องเขียนโค้ดเอง"

---

### ระบบนี้คืออะไร?

**AGSP Bot** คือ LINE Chatbot ที่ช่วยประเมินทักษะนักศึกษาและตอบคำถามเรื่องโครงงานวิจัย ทำงานผ่านหลายบริการที่เชื่อมต่อกัน:

```
น้องพิมพ์ใน LINE
→ LINE ส่งข้อความมาที่ Server ของเรา
→ Server ประมวลผล (บางคำถามส่งให้ AI ช่วยตอบ)
→ เก็บข้อมูลผลลัพธ์ไว้
→ ตอบกลับน้องใน LINE
```

ทั้งระบบนี้ทำงานบน **cloud** — ไม่ต้องมีคอมพิวเตอร์ส่วนตัวรัน 24 ชั่วโมง

---

### เครื่องมือที่ต้องเตรียม

☐ บัญชี **Gmail** (ใช้เพื่อสมัคร Vercel, Google Sheets, Gemini)  
☐ บัญชี **LINE** (สมัคร LINE Developers)  
☐ บัญชี **GitHub** (เก็บโค้ด)  
☐ เบราว์เซอร์ **Chrome**  
☐ **Claude** หรือ AI assistant (ช่วยเขียน/แก้โค้ด)

---

### Step-by-Step: ตั้งค่าระบบ

#### Step 1 — รับโค้ดมาใช้ (10 นาที)

1. ไป GitHub: `github.com/netiyak-dev/cwie-line-bot-ai`
2. กดปุ่ม **Fork** (มุมขวาบน) → Create fork
3. ตอนนี้มีโค้ดใน GitHub ของตัวเองแล้ว ✅

> **Fork คืออะไร?** เหมือนการถ่ายเอกสาร — ได้สำเนาที่แก้ไขได้โดยไม่กระทบต้นฉบับ

---

#### Step 2 — สร้าง LINE Bot (20 นาที)

1. ไป `developers.line.biz` → Login ด้วย LINE account
2. **Create a new provider** → ตั้งชื่อ
3. **Create a new channel** → เลือก **Messaging API**
4. กรอกข้อมูล → Create

**เก็บข้อมูลสำคัญ 2 อย่าง:**
- **Channel secret** (Basic settings tab)
- **Channel access token** (Messaging API tab → Issue)

> ⚠️ อย่าแชร์ให้ใคร — เหมือนรหัสผ่านบัญชีธนาคาร

---

#### Step 3 — Deploy บน Vercel (15 นาที)

1. ไป `vercel.com` → Sign up with GitHub
2. **Add New Project** → Import → เลือก repo ที่ fork มา
3. **Deploy** → รอ 2 นาที
4. จะได้ URL เช่น `my-bot.vercel.app` ✅

---

#### Step 4 — ใส่ข้อมูลสำคัญ (Environment Variables) (20 นาที)

ไป Vercel → Settings → Environment Variables → เพิ่มทีละตัว:

| ชื่อ | ที่มา |
|-----|------|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Console |
| `LINE_CHANNEL_SECRET` | LINE Console |
| `GEMINI_API_KEY` | `aistudio.google.com` |
| `SHEET_CSV_URL` | Google Sheets → Publish as CSV |
| `HASH_SALT` | สุ่มพิมพ์ 32 ตัวอักษรใดก็ได้ |

หลังใส่ครบ → **Redeploy**

---

#### Step 5 — เชื่อม LINE กับ Vercel (10 นาที)

1. LINE Developers → Messaging API → Webhook URL
2. ใส่: `https://[your-domain].vercel.app/api/line-webhook`
3. กด **Verify** → ต้องได้ "Success" ✅
4. เปิด **Use webhook** = ON

---

#### Step 6 — ทดสอบ (5 นาที)

1. LINE Console → QR Code → เพิ่มเพื่อน Bot
2. พิมพ์ "สวัสดี"
3. ถ้าได้ PDPA card ตอบกลับ = สำเร็จ! 🎉

---

### วิธีแก้ไขเนื้อหาใน Bot

**กฎทอง: ให้ Claude ช่วยเขียนโค้ด**

เมื่ออยากเปลี่ยนอะไร ให้บอก Claude แบบนี้:

```
"ฉันมีไฟล์ [ชื่อไฟล์] ในโปรเจกต์ LINE Bot (Next.js + TypeScript)
อยากเปลี่ยน [สิ่งที่อยากเปลี่ยน]
ช่วยบอกว่าต้องแก้ตรงไหน อย่างไร?"
```

**ไฟล์ที่แก้ไขบ่อย:**

| ต้องการเปลี่ยน | ไฟล์ที่แก้ |
|--------------|----------|
| คำถามประเมิน | `lib/assessment/questions.ts` |
| กลุ่มทักษะ | `lib/assessment/skills.ts` |
| คำแนะนำ | `lib/assessment/scoring.ts` |
| คำถาม FAQ | Google Sheets (ไม่ต้องแตะโค้ด) |
| ข้อความต้อนรับ | `app/api/line-webhook/route.ts` |

**วิธี Deploy หลังแก้ไข:**
1. แก้ไขไฟล์บน GitHub (หรือ commit จาก VS Code)
2. Vercel จะ deploy อัตโนมัติภายใน 2 นาที ✅

---

### ตั้งค่าแจ้งเตือน Follow-up

เพื่อให้ Bot ส่งข้อความติดตามผลนักศึกษาอัตโนมัติ:

1. ไป `cron-job.org` → สร้าง account ฟรี
2. Create cronjob:
   - **URL:** `https://[your-domain].vercel.app/api/cron/followup`
   - **Method:** GET
   - **Schedule:** Every day, 09:00
   - **Header:** `x-cron-secret` = ค่า `CRON_SECRET` ใน Vercel
3. กด **Run now** → ดู response `{"ok":true}` = สำเร็จ ✅

---

### ดูผลลัพธ์จากนักศึกษา

**Google Sheets** ของท่านจะมี sheet ใหม่เพิ่มขึ้นโดยอัตโนมัติ:

- **FAQ_Log** — คำถามที่นักศึกษาถาม + AI ตอบอะไร
- **Assessment_Results** — ผลคะแนนทักษะ (ไม่ระบุตัวตน)
- **FollowUp_OptIn** — รายการผู้รับการแจ้งเตือน

> **หมายเหตุด้าน PDPA:** ผลประเมินเชื่อมกับรหัสนักศึกษาที่เข้ารหัสแล้ว (hash) Admin เห็นได้เฉพาะ aggregate data ไม่เห็นผลรายบุคคล

---

### แก้ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|------|--------|
| Bot ไม่ตอบเลย | ตรวจ Webhook URL ใน LINE Console ต้องขึ้น "Success" |
| Bot ตอบช้า/error | เปิด Vercel → Functions → line-webhook → ดู log |
| คำถาม FAQ ไม่อัพเดต | Google Sheets → File → Share → Publish to web → ตรวจ URL |
| ผลประเมินไม่บันทึก | ตรวจ `ASSESSMENT_WEBHOOK_URL` ใน Vercel ว่ามีค่า |
| Vercel deploy ล้มเหลว | เปิด Deployment log → หา error → ถาม Claude ให้ช่วยแก้ |

---

### ต้นทุนรายเดือน (ประมาณการ)

| สำหรับ | ต้นทุน |
|------|------|
| ทดสอบ / นักศึกษา < 50 คน | **ฟรี** |
| นักศึกษา 50-150 คน | ~**1,500-2,200 บาท/เดือน** (ส่วนใหญ่เป็น LINE API) |
| นักศึกษา > 150 คน | คำนวณตามจำนวนข้อความจริง |

---

### Resources

- **โค้ดต้นฉบับ:** `github.com/netiyak-dev/cwie-line-bot-ai`
- **LINE Developers Docs:** `developers.line.biz/en/docs/messaging-api/`
- **Vercel Docs:** `vercel.com/docs`
- **Gemini API:** `aistudio.google.com`
- **Claude (ช่วยเขียนโค้ด):** `claude.ai`

---

*Training Guide จัดทำโดย ดร.เนติยา การะเกตุ | มหาวิทยาลัยมหิดล | 2026*
