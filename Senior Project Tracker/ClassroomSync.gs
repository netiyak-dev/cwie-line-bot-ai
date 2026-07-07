/**
 * ClassroomSync.gs — ดึงกำหนดการ (coursework) และสถานะการส่งงาน (submissions)
 * จาก Google Classroom มาอัปเดตใน Google Sheets
 *
 * ก่อนใช้งาน:
 * 1. เปิด Apps Script editor > Services > เพิ่ม "Google Classroom API"
 * 2. ใส่ COURSE_ID ใน Script Properties (ดูได้จาก URL ของ Classroom วิชานี้)
 * 3. ตั้ง Time-driven trigger ให้รัน syncClassroomData() ทุก 5-15 นาที
 */

const COURSE_ID = PropertiesService.getScriptProperties().getProperty('CLASSROOM_COURSE_ID');

/**
 * ดึงกำหนดการ (coursework) ทั้งหมดจาก Classroom แล้ว upsert ลงแท็บ Assignments
 * เฉพาะรายการที่ source = "classroom_sync" เท่านั้น (ไม่แตะรายการที่กรอกเอง)
 */
function syncAssignmentsFromClassroom_() {
  const courseWorkList = Classroom.Courses.CourseWork.list(COURSE_ID).courseWork || [];
  const sheet = getSheet_('Assignments');
  const existing = sheetToObjects_('Assignments');

  courseWorkList.forEach(cw => {
    const found = existing.find(a => a.classroom_coursework_id === cw.id);
    const dueDate = cw.dueDate
      ? `${cw.dueDate.year}-${String(cw.dueDate.month).padStart(2, '0')}-${String(cw.dueDate.day).padStart(2, '0')}`
      : '';

    if (found) {
      // TODO: update แถวเดิม ถ้า title/due_date เปลี่ยนจากฝั่ง Classroom
    } else {
      sheet.appendRow([
        'cw_' + cw.id,        // assignment_id
        cw.title,             // title
        cw.description || '', // description
        dueDate,              // due_date
        'classroom_sync',     // source
        cw.id                 // classroom_coursework_id
      ]);
    }
  });
}

/**
 * ดึงสถานะ submission ของนักศึกษาแต่ละคน จาก Classroom แล้ว upsert ลงแท็บ Submissions
 * ใช้วิธี Polling (ไม่ใช่ real-time push) ตามที่ตกลงไว้ใน PRD.md หัวข้อ 6
 */
function syncSubmissionsFromClassroom_() {
  const assignments = sheetToObjects_('Assignments')
    .filter(a => a.source === 'classroom_sync');
  const students = sheetToObjects_('Students');
  const submissionSheet = getSheet_('Submissions');
  const existingSubs = sheetToObjects_('Submissions');

  assignments.forEach(assignment => {
    const studentSubmissions = Classroom.Courses.CourseWork.StudentSubmissions
      .list(COURSE_ID, assignment.classroom_coursework_id).studentSubmissions || [];

    studentSubmissions.forEach(sub => {
      // TODO: ต้อง map Classroom userId กับ student_id ของเรา
      // (เก็บ classroom_user_id ไว้ในแท็บ Students ตอน setup ครั้งแรก)
      const status = mapClassroomState_(sub.state);

      const found = existingSubs.find(
        e => e.assignment_id === assignment.assignment_id /* && e.student_id ตรงกับ sub */
      );

      if (found) {
        // TODO: update field status ถ้าเปลี่ยนจากครั้งก่อน แล้วค่อย trigger sendLinePush_ แจ้งว่าส่งสำเร็จ
      } else {
        // TODO: appendRow แถวใหม่ใน Submissions
      }
    });
  });
}

function mapClassroomState_(state) {
  // Classroom states: NEW, CREATED, TURNED_IN, RETURNED, RECLAIMED_BY_STUDENT
  if (state === 'TURNED_IN' || state === 'RETURNED') return 'submitted';
  return 'not_started';
}

/**
 * ฟังก์ชันหลักที่ผูกกับ Time-driven trigger
 */
function syncClassroomData() {
  syncAssignmentsFromClassroom_();
  syncSubmissionsFromClassroom_();
}
