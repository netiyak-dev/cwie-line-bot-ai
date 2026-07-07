/**
 * skills.ts — metadata ของ 11 skill groups
 * พร้อม recommendations แยกตาม level (1=P1≤50, 2=P2 51-75)
 * อ้างอิง PLO หลักสูตรวิทยาศาสตร์การเกษตร มหิดล
 */

export interface SkillRecommendations {
  1: string; // P1: score ≤50
  2: string; // P2: score 51-75
}

export interface Skill {
  id: string;
  type: 'hard' | 'soft';
  name: string;
  plo: string;
  emoji: string;
  recommendations: SkillRecommendations;
}

export const SKILLS: Record<string, Skill> = {
  HS1: {
    id: 'HS1', type: 'hard',
    name: 'ทักษะภาคสนามและการผลิต',
    plo: 'PLO1.3, PLO3',
    emoji: '🌱',
    recommendations: {
      1: 'ขอเข้าร่วมโครงการ Farm Training หรือฝึกงานฟาร์มในสมัยปิดเทอม + ทำ Field Lab เพิ่มเติมกับอาจารย์ที่ปรึกษา (สอดคล้อง PLO3: ทักษะปฏิบัติการเกษตร)',
      2: 'เข้าร่วม Workshop การวินิจฉัยโรคพืช/สัตว์ขั้นสูง และลองเป็น TA ใน Lab ภาคสนามเพื่อสั่งสมประสบการณ์ (PLO3.2)',
    },
  },
  HS2: {
    id: 'HS2', type: 'hard',
    name: 'ทักษะห้องปฏิบัติการ',
    plo: 'PLO3.1, PLO3.2',
    emoji: '🔬',
    recommendations: {
      1: 'ฝึก Lab Safety Certification ของภาควิชา + ทำ Lab Manual exercises ซ้ำกับอุปกรณ์ที่ยังไม่คุ้นเคย (PLO3.1: ปฏิบัติการปลอดภัย)',
      2: 'ออกแบบ mini-experiment ของตัวเองพร้อม GLP documentation + ขอ feedback จากอาจารย์ก่อน run จริง (PLO3.2: มาตรฐาน GLP)',
    },
  },
  HS3: {
    id: 'HS3', type: 'hard',
    name: 'การวิจัยและข้อมูล',
    plo: 'PLO2.1, PLO2.3, PLO2.4',
    emoji: '📊',
    recommendations: {
      1: 'ฝึก Systematic Review ด้วย PRISMA flow + เรียน SPSS/R พื้นฐานผ่าน Coursera (สอดคล้อง PLO2.1: ออกแบบวิจัย)',
      2: 'ทำ Meta-analysis เล็กๆ ในหัวข้อที่สนใจ + เรียน Advanced Statistics (PLO2.3-2.4: วิเคราะห์และรายงานผล)',
    },
  },
  HS4: {
    id: 'HS4', type: 'hard',
    name: 'เทคโนโลยีและ AI Literacy',
    plo: 'PLO6',
    emoji: '🤖',
    recommendations: {
      1: 'เริ่มจาก AI Literacy Course ฟรีบน Google / Microsoft Learn + ทดลองใช้ AI Tools ใน workflow นักศึกษา 1 เดือน (PLO6: ดิจิทัลและนวัตกรรม)',
      2: 'เรียน Prompt Engineering สำหรับงานวิจัย + ศึกษา Responsible AI Framework และลองประเมิน AI output ในหัวข้อเกษตร (PLO6.2)',
    },
  },
  HS5: {
    id: 'HS5', type: 'hard',
    name: 'ฐานความรู้เกษตรศาสตร์',
    plo: 'PLO1.1, PLO1.3',
    emoji: '📚',
    recommendations: {
      1: 'ทบทวน Core Textbooks (Plant Physiology, Soil Science) + จด Concept Map เชื่อมโยงความรู้ข้ามวิชา (PLO1.1: ความรู้ด้านวิทยาศาสตร์)',
      2: 'อ่าน Review Articles ใน Journal of Agricultural Science + เข้า Seminar ของภาควิชาสม่ำเสมอ (PLO1.3)',
    },
  },
  SS1: {
    id: 'SS1', type: 'soft',
    name: 'การคิดวิเคราะห์และแก้ปัญหา',
    plo: 'PLO1',
    emoji: '🧠',
    recommendations: {
      1: 'ฝึก Case-based Problem Solving ผ่านกรณีศึกษาเกษตร + เรียน Design Thinking พื้นฐาน (สอดคล้อง PLO1: การคิดวิเคราะห์)',
      2: 'เข้าร่วม Hackathon เกษตรหรือ Challenge จากภายนอก เพื่อฝึกแก้ปัญหาจริงภายใต้เวลา (PLO1.2)',
    },
  },
  SS2: {
    id: 'SS2', type: 'soft',
    name: 'การบริหารโครงการ',
    plo: 'PLO2',
    emoji: '📋',
    recommendations: {
      1: 'เรียน Project Management พื้นฐาน (PMBOK/Agile) + ฝึกใช้ Trello หรือ Notion วางแผนงานประจำสัปดาห์ (PLO2: บริหารจัดการ)',
      2: 'รับผิดชอบ Lead งานกลุ่มโครงการใหญ่ 1 ครั้ง + ทำ Lessons Learned หลังจบโครงการ (PLO2.2)',
    },
  },
  SS3: {
    id: 'SS3', type: 'soft',
    name: 'การสื่อสารและนำเสนอ',
    plo: 'PLO4',
    emoji: '🎤',
    recommendations: {
      1: 'เข้า Public Speaking Club หรือ Toastmasters + ฝึกนำเสนองาน 3 นาทีต่อสัปดาห์กับเพื่อน (PLO4: การสื่อสาร)',
      2: 'ส่งบทความสั้นไปยัง Journal นักศึกษาหรือ Blog วิชาการ + ฝึก Science Communication สำหรับสาธารณะ (PLO4.2)',
    },
  },
  SS4: {
    id: 'SS4', type: 'soft',
    name: 'ทีมงานและความหลากหลาย',
    plo: 'PLO5',
    emoji: '🤝',
    recommendations: {
      1: 'เข้าร่วม Interdisciplinary Team Project + ศึกษา Cross-cultural Communication พื้นฐาน (PLO5: ความร่วมมือ)',
      2: 'รับบท Facilitator ในการประชุมทีม + เข้าร่วม International Exchange Program หรือ Virtual Collaboration (PLO5.2)',
    },
  },
  SS5: {
    id: 'SS5', type: 'soft',
    name: 'จริยธรรมและ Responsible AI',
    plo: 'PLO1.2, PLO2.2, PLO6.2',
    emoji: '⚖️',
    recommendations: {
      1: 'เรียน Research Ethics หลักสูตรออนไลน์ (CITI Program) + ศึกษา APA/Vancouver Citation อย่างจริงจัง (PLO1.2: จริยธรรมวิชาการ)',
      2: 'ศึกษา UNESCO Recommendation on the Ethics of AI + ฝึกประเมิน AI-generated content ในงานเกษตรอย่างมีวิจารณญาณ (PLO6.2)',
    },
  },
  SS6: {
    id: 'SS6', type: 'soft',
    name: 'การเรียนรู้และพัฒนาตน',
    plo: 'PLO6.1',
    emoji: '🚀',
    recommendations: {
      1: 'สร้าง Personal Development Plan (PDP) ด้วย SMART Goals + ทำ Weekly Reflection Journal (PLO6.1: การพัฒนาตนเอง)',
      2: 'เรียน MOOCs ด้านที่สนใจ 1 คอร์สต่อเดือน + หา Mentor ในสายงานที่อยากพัฒนา (PLO6.1)',
    },
  },
};

export const HARD_SKILL_IDS = ['HS1', 'HS2', 'HS3', 'HS4', 'HS5'] as const;
export const SOFT_SKILL_IDS = ['SS1', 'SS2', 'SS3', 'SS4', 'SS5', 'SS6'] as const;
export type HardSkillId = typeof HARD_SKILL_IDS[number];
export type SoftSkillId = typeof SOFT_SKILL_IDS[number];
export type SkillId = HardSkillId | SoftSkillId;
