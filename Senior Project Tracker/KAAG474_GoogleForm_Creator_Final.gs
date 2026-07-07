/**
 * KAAG 474 Senior Project — Pre-Test Assessment
 * Google Apps Script - Create Google Form from Google_Form_Import Sheet
 * 
 * ✅ FINAL VERSION - Comprehensive Question Type Support
 * Supports: Short answer, Multiple choice, Paragraph, Linear scale, Checkboxes
 */

function createGoogleFormFromSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const importSheet = ss.getSheetByName("Google_Form_Import");
    
    if (!importSheet) {
      throw new Error("❌ Sheet 'Google_Form_Import' not found!");
    }
    
    // Get all data
    const data = importSheet.getDataRange().getValues();
    Logger.log("📊 Processing " + (data.length - 1) + " questions...");
    
    // Create Google Form
    const form = FormApp.create("KAAG 474 Senior Project — Pre-Test Assessment (2026)");
    form.setDescription("แบบประเมิน Pre-Test นักศึกษาโครงงานวิจัย Senior Project\nประเมินความเข้าใจ ทักษะ และการใช้ AI tools");
    form.setCollectEmail(true);
    form.setLimitOneResponsePerUser(true);
    form.setShowLinkToRespondAgain(false);
    form.setConfirmationMessage("ขอบคุณที่ตอบแบบประเมิน! ข้อมูลของท่านจะช่วยปรับปรุงการสอน");
    
    let currentSection = "";
    let itemCount = 0;
    let errorCount = 0;
    
    // Process rows (skip header at index 0)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Extract fields
      const section = row[0];
      const questionId = row[1];
      const questionTitle = row[2];
      const questionType = row[3];
      const required = row[4] === "Yes" || row[4] === true;
      const points = row[5];
      const option1 = row[6];
      const option2 = row[7];
      const option3 = row[8];
      const option4 = row[9];
      const option5 = row[10];
      
      // Skip empty rows
      if (!questionId || !questionTitle || !questionType) continue;
      
      // Add section header if changed
      if (section && section !== currentSection) {
        currentSection = section;
        form.addSectionHeaderItem()
          .setTitle(String(section));
      }
      
      try {
        const type = String(questionType).toLowerCase().trim();
        
        if (type === "short answer") {
          form.addTextItem()
            .setTitle(String(questionTitle))
            .setRequired(required);
          itemCount++;
          
        } else if (type === "paragraph") {
          form.addParagraphTextItem()
            .setTitle(String(questionTitle))
            .setRequired(required);
          itemCount++;
          
        } else if (type === "multiple choice") {
          const options = collectOptions(option1, option2, option3, option4, option5);
          if (options.length > 0) {
            form.addMultipleChoiceItem()
              .setTitle(String(questionTitle))
              .setChoices(options)
              .setRequired(required);
            itemCount++;
          } else {
            Logger.log("⚠️ " + questionId + ": No options found");
            errorCount++;
          }
          
        } else if (type === "checkboxes") {
          const options = collectOptions(option1, option2, option3, option4, option5);
          if (options.length > 0) {
            form.addCheckboxItem()
              .setTitle(String(questionTitle))
              .setChoices(options)
              .setRequired(required);
            itemCount++;
          } else {
            Logger.log("⚠️ " + questionId + ": No options found");
            errorCount++;
          }
          
        } else if (type === "linear scale") {
          form.addScaleItem()
            .setTitle(String(questionTitle))
            .setBounds(1, 5)
            .setLabels("ยังไม่มั่นใจ/ทำไม่ได้", "ทำได้ดีมาก/พร้อมใช้งานจริง")
            .setRequired(required);
          itemCount++;
          
        } else {
          Logger.log("⚠️ Unknown type: " + type + " for " + questionId);
          errorCount++;
        }
        
      } catch (questionError) {
        Logger.log("❌ Error with " + questionId + ": " + questionError.message);
        errorCount++;
      }
    }
    
    // Get form URL
    const formUrl = form.getPublishedUrl();
    const formId = form.getId();
    
    // Report
    Logger.log("✅✅✅ SUCCESS!");
    Logger.log("📄 Form ID: " + formId);
    Logger.log("🔗 Form URL: " + formUrl);
    Logger.log("📊 Questions added: " + itemCount);
    Logger.log("⚠️  Errors: " + errorCount);
    
    // Alert
    SpreadsheetApp.getUi().alert(
      "✅ Google Form created successfully!\n\n" +
      "📊 Questions added: " + itemCount + "\n" +
      "⚠️  Errors: " + errorCount + "\n\n" +
      "Form URL:\n" + formUrl + "\n\n" +
      "Check Execution log for details."
    );
    
  } catch (error) {
    Logger.log("❌ CRITICAL ERROR: " + error.message);
    Logger.log("Stack: " + error.stack);
    SpreadsheetApp.getUi().alert("❌ ERROR:\n" + error.message);
  }
}

// Helper function to collect options (robust type conversion)
function collectOptions(opt1, opt2, opt3, opt4, opt5) {
  const rawOptions = [opt1, opt2, opt3, opt4, opt5];
  const options = [];

  for (let i = 0; i < rawOptions.length; i++) {
    const opt = rawOptions[i];

    // Skip null, undefined, or empty
    if (opt == null || opt === "" || opt === false) {
      continue;
    }

    // Convert ANY type to string (handles number, boolean, object, etc.)
    let optStr = String(opt).trim();

    // Skip if empty after conversion or invalid values
    if (optStr.length === 0 || optStr === "false" || optStr === "null" || optStr === "undefined") {
      continue;
    }

    // Force string type for FormApp (avoid mixed types)
    options.push(optStr + "");
  }

  return options;
}

// Menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📋 Pre-Test Form")
    .addItem("✅ Create Google Form Now", "createGoogleFormFromSheet")
    .addSeparator()
    .addItem("📖 See Instructions", "showInstructions")
    .addToUi();
}

function showInstructions() {
  const message = 
    "✅ วิธีใช้งาน:\n\n" +
    "1️⃣ ตรวจสอบ Sheet 'Google_Form_Import' - ต้องมีคอลัมน์:\n" +
    "   Section, Question_ID, Question_Title, Question_Type\n" +
    "   Required, Points, Option_1-5\n\n" +
    "2️⃣ คลิก 'Create Google Form Now'\n\n" +
    "3️⃣ ดู Execution log (Ctrl+Enter)\n\n" +
    "4️⃣ Copy Form URL\n\n" +
    "Question Types ที่รองรับ:\n" +
    "✓ short answer\n" +
    "✓ paragraph\n" +
    "✓ multiple choice\n" +
    "✓ checkboxes\n" +
    "✓ linear scale";
    
  SpreadsheetApp.getUi().alert(message);
}
