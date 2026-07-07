/**
 * KAAG 474 Senior Project — Pre-Test Assessment
 * Google Apps Script to Create Google Form
 * ✅ Fixed for latest Google Apps Script API
 */

// ========== MAIN FUNCTION ==========
function createPreTestForm() {
  try {
    // 1. สร้าง Google Form ใหม่
    const formTitle = "KAAG 474 Senior Project — Pre-Test Assessment";
    const formDescription = "แบบประเมิน Pre-Test เพื่อประเมินความเข้าใจและทักษะของนักศึกษาก่อนเรียนวิชา Senior Project";
    
    const form = FormApp.create(formTitle);
    form.setDescription(formDescription);
    
    // 2. ตั้งค่า Form
    form.setConfirmationMessage("ขอบคุณที่ตอบแบบประเมิน! คณะลงทะเบียนรับทราบแล้ว");
    form.setLimitOneResponsePerUser(true);
    form.setCollectEmail(true);
    form.setShowLinkToRespondAgain(false);
    
    // 3. เพิ่มคำถาม Section: Personal Information
    addPersonalInfoSection(form);
    
    // 4. เพิ่มคำถาม Section A: Understanding of Senior Project
    addSectionA(form);
    
    // 5. เพิ่มคำถาม Section B: Hard Skills
    addSectionB(form);
    
    // 6. เพิ่มคำถาม Section C: Soft Skills
    addSectionC(form);
    
    // 7. เพิ่มคำถาม Section D: AI Tools
    addSectionD(form);
    
    // 8. เพิ่มคำถามสุดท้าย: Comments
    addCommentsQuestion(form);
    
    // 9. แสดง Form URL
    const formUrl = form.getPublishedUrl();
    const formId = form.getId();
    
    Logger.log("✅ Google Form created successfully!");
    Logger.log("📄 Form ID: " + formId);
    Logger.log("🔗 Form URL: " + formUrl);
    
    // 10. แจ้ง UI
    SpreadsheetApp.getUi().alert(
      "✅ Google Form created successfully!\n\n" +
      "Form URL:\n" + formUrl + "\n\n" +
      "คุณสามารถแชร์ link นี้ให้นักศึกษาได้แล้ว"
    );
    
  } catch (error) {
    Logger.log("❌ Error: " + error);
    Logger.log("Stack trace: " + error.stack);
    SpreadsheetApp.getUi().alert("❌ Error creating form:\n" + error.message);
  }
}

// ========== SECTION: Personal Information ==========
function addPersonalInfoSection(form) {
  form.addSectionHeaderItem()
    .setTitle("ข้อมูลส่วนบุคคล")
    .setHelpText("กรุณากรอกข้อมูลของคุณ");
  
  form.addTextItem()
    .setTitle("ชื่อ-สกุล")
    .setRequired(true);
  
  form.addTextItem()
    .setTitle("รหัสนักศึกษา")
    .setRequired(true);
  
  form.addTextItem()
    .setTitle("เบอร์โทรศัพท์")
    .setRequired(false);
}

// ========== SECTION A: Understanding of Senior Project ==========
function addSectionA(form) {
  form.addSectionHeaderItem()
    .setTitle("SECTION A: ความเข้าใจเรื่องการทำ Senior Project")
    .setHelpText("เลือกคำตอบที่ถูกต้องที่สุด");
  
  // A1
  form.addMultipleChoiceItem()
    .setTitle("A1. Senior Project คืออะไร?")
    .setChoices([
      "ก. โครงงานเขียนรายงานเกี่ยวกับสิ่งที่ศึกษาจากหนังสือ",
      "ข. โครงการวิจัยเล็กน้อยที่นักศึกษาออกแบบและดำเนินการด้วยตัวเอง",
      "ค. การสรุปความรู้ที่เรียนมาตั้งแต่ชั้นที่ 1",
      "ง. สิ่งที่ไม่สำคัญและจะหายไปหลังสำเร็จการศึกษา"
    ])
    .setRequired(true);
  
  // A2
  form.addMultipleChoiceItem()
    .setTitle("A2. ขั้นตอนหลักของการทำ Senior Project คือขั้นไหนบ้าง?")
    .setChoices([
      "ก. เขียนรายงาน → นำเสนอ → จบ",
      "ข. ระบุปัญหา → ตั้งสมมติฐาน → ออกแบบการทดลอง → เก็บข้อมูล → วิเคราะห์ → เขียนรายงาน → นำเสนอ",
      "ค. หาข้อมูล → ลอกรายงาน → ส่ง",
      "ง. ไม่เป็นขั้นตอนที่แน่นอน ทำได้ตามต้องการ"
    ])
    .setRequired(true);
  
  // A3
  form.addMultipleChoiceItem()
    .setTitle("A3. CLO (Course Learning Outcomes) ของวิชา Senior Project คือ?")
    .setChoices([
      "ก. ได้เกรด A ในวิชา",
      "ข. ผลการเรียนรู้ที่เน้นการระบุปัญหา การใช้วิธีการทางวิทยาศาสตร์ และการนำเสนอผลงาน",
      "ค. จำนวนชั่วโมงที่ใช้ในการเรียน",
      "ง. ไม่สำคัญ แล้วแต่อาจารย์"
    ])
    .setRequired(true);
  
  // A4
  form.addMultipleChoiceItem()
    .setTitle("A4. ข้อมูลวิจัยมีความสำคัญต่อ Senior Project อย่างไร?")
    .setChoices([
      "ก. ไม่สำคัญมากนัก สิ่งสำคัญคือการนำเสนอให้ดูดี",
      "ข. ข้อมูลอย่างเป็นระบบและเชื่อถือได้เป็นรากฐานของการตั้งข้อสรุปที่มีความหมาย",
      "ค. ข้อมูลควรมีจำนวนมากที่สุดเท่าที่จะได้",
      "ง. ข้อมูลชนิดใดก็ได้ เพราะแค่มีข้อมูลก็พอ"
    ])
    .setRequired(true);
  
  // A5
  form.addMultipleChoiceItem()
    .setTitle("A5. ผู้ที่ให้คำแนะนำในการทำ Senior Project เรียกว่า?")
    .setChoices([
      "ก. เพื่อนร่วมชั้น",
      "ข. ที่ปรึกษา (Advisor)",
      "ค. ผู้บริหารห้องเรียน",
      "ง. ไม่จำเป็นต้องมีผู้ให้คำแนะนำ"
    ])
    .setRequired(true);
  
  // A6
  form.addMultipleChoiceItem()
    .setTitle("A6. ความแตกต่างระหว่าง Literature Review กับ Experiment คืออะไร?")
    .setChoices([
      "ก. ไม่แตกต่างกัน ทั้งสองเป็นสิ่งเดียวกัน",
      "ข. Literature Review คือการศึกษาจากงานวิจัยที่มีอยู่ ส่วน Experiment คือการทำการทดลองหรือเก็บข้อมูลด้วยตัวเอง",
      "ค. Literature Review ทำหลังจากสำเร็จการศึกษา",
      "ง. ไม่มีความสำคัญในการทำ Senior Project"
    ])
    .setRequired(true);
}

// ========== SECTION B: Hard Skills ==========
function addSectionB(form) {
  form.addSectionHeaderItem()
    .setTitle("SECTION B: ทักษะเชิงเทคนิค (Hard Skills)")
    .setHelpText("ให้ระดับความมั่นใจในแต่ละด้าน (1 = ไม่เข้าใจเลย, 5 = เข้าใจมากที่สุด)");
  
  const hardSkills = [
    "B1. การออกแบบการทดลอง (Experimental Design)",
    "B2. การใช้เครื่องมือวิทยาศาสตร์ (Laboratory Equipment)",
    "B3. การวิเคราะห์ข้อมูลทางสถิติ (Statistical Analysis)",
    "B4. การตีความผลลัพธ์จากข้อมูล (Data Interpretation)",
    "B5. การเขียนรายงานวิจัยเป็นภาษาอังกฤษ (English Scientific Writing)",
    "B6. การใช้ Microsoft Excel/Google Sheets สำหรับวิเคราะห์ข้อมูล",
    "B7. การสร้างตารางและกราฟให้มีความชัดเจน (Visualization)",
    "B8. การอ้างอิงต้นทาง (Citation & Referencing)"
  ];
  
  hardSkills.forEach(function(skill) {
    form.addScaleItem()
      .setTitle(skill)
      .setBounds(1, 5)
      .setLabels("ไม่เข้าใจ", "เข้าใจมากที่สุด")
      .setRequired(true);
  });
}

// ========== SECTION C: Soft Skills ==========
function addSectionC(form) {
  form.addSectionHeaderItem()
    .setTitle("SECTION C: ทักษะทั่วไป (Soft Skills)")
    .setHelpText("ให้ระดับความมั่นใจในแต่ละด้าน (1 = ไม่เข้าใจเลย, 5 = เข้าใจมากที่สุด)");
  
  const softSkills = [
    "C1. การสื่อสารอย่างมีประสิทธิภาพ (Effective Communication)",
    "C2. การแก้ปัญหาอย่างสร้างสรรค์ (Problem-Solving)",
    "C3. การทำงานเป็นทีมและบทบาทในกลุ่ม (Teamwork & Collaboration)",
    "C4. การจัดการเวลาและสไตล์การเรียน (Time Management)",
    "C5. ความคิดริเริ่มและความอยากรู้อยากเห็น (Initiative & Curiosity)",
    "C6. ความหนักแน่นและการทำงานจนเสร็จสิ้น (Perseverance & Completion)"
  ];
  
  softSkills.forEach(function(skill) {
    form.addScaleItem()
      .setTitle(skill)
      .setBounds(1, 5)
      .setLabels("ไม่เข้าใจ", "เข้าใจมากที่สุด")
      .setRequired(true);
  });
}

// ========== SECTION D: AI Tools ==========
function addSectionD(form) {
  form.addSectionHeaderItem()
    .setTitle("SECTION D: ความรู้เรื่องเครื่องมือ AI (AI Tools Awareness)");
  
  // D1
  form.addMultipleChoiceItem()
    .setTitle("D1. เคยใช้ ChatGPT หรือไม่?")
    .setChoices([
      "ก. ไม่เคยใช้เลย",
      "ข. ใช้น้อย",
      "ค. ใช้บ้าง",
      "ง. ใช้บ่อยมาก"
    ])
    .setRequired(true);
  
  // D2
  form.addMultipleChoiceItem()
    .setTitle("D2. เคยใช้ Claude (Anthropic) หรือไม่?")
    .setChoices([
      "ก. ไม่เคยใช้เลย",
      "ข. ใช้น้อย",
      "ค. ใช้บ้าง",
      "ง. ใช้บ่อยมาก"
    ])
    .setRequired(true);
  
  // D3
  form.addMultipleChoiceItem()
    .setTitle("D3. เคยใช้ Google Consensus สำหรับค้นหาบทความวิจัย หรือไม่?")
    .setChoices([
      "ก. ไม่เคยใช้เลย",
      "ข. ใช้น้อย",
      "ค. ใช้บ้าง",
      "ง. ใช้บ่อยมาก"
    ])
    .setRequired(true);
  
  // D4
  form.addMultipleChoiceItem()
    .setTitle("D4. เคยใช้เครื่องมือ AI อื่นๆ (เช่น Perplexity, Copilot) หรือไม่?")
    .setChoices([
      "ก. ไม่เคยใช้เลย",
      "ข. ใช้น้อย",
      "ค. ใช้บ้าง",
      "ง. ใช้บ่อยมาก"
    ])
    .setRequired(true);
  
  // D5
  form.addMultipleChoiceItem()
    .setTitle("D5. คิดว่า AI tools มีประโยชน์ต่อการทำ Senior Project อย่างไร?")
    .setChoices([
      "ก. ไม่มีประโยชน์เลย",
      "ข. ช่วยหาข้อมูลและ literature review",
      "ค. ช่วยในการเขียนร่างและจัดโครงสร้างรายงาน",
      "ง. ก, ข, และ ค ทั้งหมด"
    ])
    .setRequired(true);
}

// ========== FINAL COMMENTS ==========
function addCommentsQuestion(form) {
  form.addParagraphTextItem()
    .setTitle("ความคิดเห็นเพิ่มเติม")
    .setHelpText("มีข้อแนะนำหรือความคิดเห็นเพิ่มเติมอื่นๆ หรือไม่?")
    .setRequired(false);
}

// ========== MENU: Add to Extensions ==========
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📋 Pre-Test Form")
    .addItem("✅ Create Google Form", "createPreTestForm")
    .addSeparator()
    .addItem("🔗 Open Form", "openFormInBrowser")
    .addToUi();
}

// ========== HELPER: Open Form ==========
function openFormInBrowser() {
  try {
    const forms = FormApp.getOpenByName("KAAG 474 Senior Project — Pre-Test Assessment");
    if (forms && forms.length > 0) {
      const url = forms[0].getPublishedUrl();
      Logger.log("🔗 Form URL: " + url);
      SpreadsheetApp.getUi().alert("✅ Form created!\n\nURL:\n" + url);
    } else {
      SpreadsheetApp.getUi().alert("❌ Form not found. Please create it first.");
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Error: " + error.message);
  }
}
