/**
 * Notify.gs — ส่งแจ้งเตือนผ่าน LINE Messaging API
 * Senior Project Tracker
 *
 * ตั้ง Time-driven trigger ให้รัน checkAndSendReminders() วันละ 1 ครั้ง (เช่น 08:00)
 */

/**
 * นับ "วันทำการ" ถอยจาก due_date โดยไม่นับเสาร์-อาทิตย์
 * คืนค่าจำนวนวันทำการที่เหลือจากวันนี้ถึง due_date
 */
function countWorkingDaysUntil_(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  let count = 0;
  const cursor = new Date(today);
  while (cursor < due) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay(); // 0 = อาทิตย์, 6 = เสาร์
    if (day !== 0 && day !== 6) {
      count++;
    }
  }
  return count;
}

/**
 * รันทุกวัน: เช็คงานที่เหลือ "พอดี 2 วันทำการ" ก่อนถึงกำหนด แล้วแจ้งเตือน
 * (ถ้าอยากเตือนถี่ขึ้น เปลี่ยนเงื่อนไขเป็น <= 2 แทน === 2)
 */
function checkAndSendReminders() {
  const assignments = sheetToObjects_('Assignments');
  const submissions = sheetToObjects_('Submissions');
  const students = sheetToObjects_('Students');

  assignments.forEach(assignment => {
    const workingDaysLeft = countWorkingDaysUntil_(assignment.due_date);
    if (workingDaysLeft !== 2) return; // เตือนตอนเหลือ 2 วันทำการเท่านั้น

    submissions
      .filter(s => s.assignment_id === assignment.assignment_id && s.status !== 'submitted')
      .forEach(sub => {
        const student = students.find(st => st.student_id === sub.student_id);
        if (!student) return;

        const message = buildReminderMessage_(student, assignment);
        sendLinePush_(student.line_user_id, message);

        // TODO: ดึง advisor_id ของ student แล้วส่งแจ้งเตือนแบบเดียวกันไปยังอาจารย์ที่ปรึกษาด้วย
      });
  });
}

/**
 * ข้อความแจ้งเตือน — โทนตาม brand.md (ให้กำลังใจ ไม่ใช่ตำหนิ)
 */
function buildReminderMessage_(student, assignment) {
  return `สวัสดี ${student.name} 😊\n` +
    `อีก 2 วันทำการถึงกำหนดส่งงาน "${assignment.title}" แล้วนะ\n` +
    `พร้อมหรือยัง? ถ้ามีปัญหาอะไรทักอาจารย์ที่ปรึกษาได้เลยครับ`;
}

/**
 * ส่ง LINE push message ไปยัง line_user_id ที่กำหนด
 */
function sendLinePush_(lineUserId, message) {
  if (!lineUserId) return;

  const url = 'https://api.line.me/v2/bot/message/push';
  const payload = {
    to: lineUserId,
    messages: [{ type: 'text', text: message }]
  };

  UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + LINE_CHANNEL_ACCESS_TOKEN },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}
