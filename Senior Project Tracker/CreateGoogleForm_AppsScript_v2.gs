/**
 * KAAG 474 Senior Project — Pre-Test Assessment
 * Google Apps Script v2 - Read from KAAG474_Google_Form_Import.xlsx
 * ✅ FULLY FIXED: Ensure all options are proper strings
 */

function createFormFromImportData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const formImportSheet = ss.getSheetByName("Form_Import");
    
    if (!formImportSheet) {
      throw new Error("❌ Sheet 'Form_Import' not found!");
    }
    
    const data = formImportSheet.getDataRange().getValues();
    Logger.log("📊 Total rows: " + data.length);
    
    // Create Google Form
    const form = FormApp.create("KAAG 474 Senior Project — Pre-Test Assessment");
    form.setDescription("แบบประเมิน Pre-Test เพื่อประเมินความเข้าใจและทักษะของนักศึกษาก่อนเรียนวิชา Senior Project");
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(true);
    form.setShowLinkToRespondAgain(false);
    form.setConfirmationMessage("ขอบคุณที่ตอบแบบประเมิน! คณะลงทะเบียนรับทราบแล้ว");
    
    let currentSection = "";
    let itemCount = 0;
    
    // Process rows (skip header at index 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const itemId = row[0];
      const section = row[1];
      const questionType = row[2];
      const questionTitle = row[3];
      const helpText = row[4];
      const required = row[5] === "TRUE" || row[5] === true;
      
      // Ensure all options are properly converted to strings
      const rawOptions = [row[6], row[7], row[8], row[9], row[10]];
      const options = [];
      
      for (let j = 0; j < rawOptions.length; j++) {
        const opt = rawOptions[j];
        if (opt != null && opt !== "") {
          const optStr = String(opt).trim();
          if (optStr.length > 0) {
            options.push(optStr);
          }
        }
      }
      
      // Skip empty rows
      if (!itemId || !questionType) continue;
      
      // Add section header if changed
      if (section !== currentSection && section) {
        currentSection = section;
        form.addSectionHeaderItem()
          .setTitle(String(section))
          .setHelpText(helpText ? String(helpText) : "");
      }
      
      // Add question based on type
      const type = String(questionType).toLowerCase().trim();
      
      try {
        if (type === "short answer") {
          form.addTextItem()
            .setTitle(String(questionTitle))
            .setHelpText(helpText ? String(helpText) : "")
            .setRequired(required);
          itemCount++;
          Logger.log("✅ Added Short Answer: " + itemId);
          
        } else if (type === "multiple choice") {
          if (options && options.length > 0) {
            // Verify all options are strings
            const verifiedOptions = options.map(o => String(o));
            form.addMultipleChoiceItem()
              .setTitle(String(questionTitle))
              .setChoices(verifiedOptions)
              .setHelpText(helpText ? String(helpText) : "")
              .setRequired(required);
            itemCount++;
            Logger.log("✅ Added Multiple Choice: " + itemId + " with " + options.length + " options");
          } else {
            Logger.log("⚠️ Skipped " + itemId + " - no options found");
          }
          
        } else if (type === "date") {
          form.addDateItem()
            .setTitle(String(questionTitle))
            .setHelpText(helpText ? String(helpText) : "")
            .setRequired(required);
          itemCount++;
          Logger.log("✅ Added Date: " + itemId);
          
        } else if (type === "scale") {
          form.addScaleItem()
            .setTitle(String(questionTitle))
            .setHelpText(helpText ? String(helpText) : "")
            .setBounds(1, 5)
            .setLabels("ไม่เข้าใจ", "เข้าใจมากที่สุด")
            .setRequired(required);
          itemCount++;
          Logger.log("✅ Added Scale: " + itemId);
          
        } else if (type === "paragraph") {
          form.addParagraphTextItem()
            .setTitle(String(questionTitle))
            .setHelpText(helpText ? String(helpText) : "")
            .setRequired(required);
          itemCount++;
          Logger.log("✅ Added Paragraph: " + itemId);
        } else {
          Logger.log("⚠️ Unknown question type: " + type + " for " + itemId);
        }
        
      } catch (questionError) {
        Logger.log("❌ Error adding question " + itemId + ": " + questionError.message);
      }
    }
    
    const formUrl = form.getPublishedUrl();
    const formId = form.getId();
    
    Logger.log("✅✅✅ Google Form created successfully!");
    Logger.log("📄 Form ID: " + formId);
    Logger.log("🔗 Form URL: " + formUrl);
    Logger.log("📊 Total items added: " + itemCount);
    
    SpreadsheetApp.getUi().alert(
      "✅ Google Form created successfully!\n\n" +
      "📊 Items added: " + itemCount + "\n\n" +
      "Form URL:\n" + formUrl + "\n\n" +
      "คุณสามารถแชร์ link นี้ให้นักศึกษาได้แล้ว!"
    );
    
  } catch (error) {
    Logger.log("❌ CRITICAL Error: " + error.message);
    Logger.log("Stack: " + error.stack);
    SpreadsheetApp.getUi().alert("❌ CRITICAL Error:\n" + error.message);
  }
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📋 Pre-Test Form")
    .addItem("✅ Create Google Form from Import Data", "createFormFromImportData")
    .addSeparator()
    .addItem("📖 See Instructions", "showInstructions")
    .addToUi();
}

function showInstructions() {
  const message = 
    "✅ วิธีใช้งาน:\n\n" +
    "1️⃣ ตรวจสอบ Sheet 'Form_Import'\n" +
    "2️⃣ คลิก 'Create Google Form from Import Data'\n" +
    "3️⃣ รอสักครู่...\n" +
    "4️⃣ ดู Execution log ที่ด้านล่างขวา\n" +
    "5️⃣ Copy Form URL\n\n" +
    "Question Types:\n" +
    "- short answer\n" +
    "- multiple choice\n" +
    "- date\n" +
    "- scale\n" +
    "- paragraph";
    
  SpreadsheetApp.getUi().alert(message);
}
