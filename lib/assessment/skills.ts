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
      1: 'ลองขอฝึกงานที่ฟาร์มหรือโครงการเกษตรในช่วงปิดเทอม และขอทำ Field Lab เพิ่มกับอาจารย์ที่ปรึกษา จะได้จับงานจริงมากขึ้น (PLO3)',
      2: 'เข้า workshop ดูแลพืช/สัตว์ขั้นสูง หรือลองช่วย TA ใน lab ภาคสนาม จะได้ฝึกทักษะและสอนคนอื่นไปด้วย (PLO3.2)',
    },
  },
  HS2: {
    id: 'HS2', type: 'hard',
    name: 'ทักษะห้องปฏิบัติการ',
    plo: 'PLO3.1, PLO3.2',
    emoji: '🔬',
    recommendations: {
      1: 'ทบทวนกฎความปลอดภัยใน lab และลองฝึกใช้อุปกรณ์ที่ยังไม่คุ้นด้วยตัวเอง เปิด lab manual แล้วทำซ้ำทีละขั้นตอน (PLO3.1)',
      2: 'ลองออกแบบการทดลองเล็กๆ ของตัวเอง แล้วให้อาจารย์ช่วย feedback ก่อนทำจริง จะช่วยให้เข้าใจขั้นตอนวิทยาศาสตร์ดีขึ้น (PLO3.2)',
    },
  },
  HS3: {
    id: 'HS3', type: 'hard',
    name: 'การวิจัยและข้อมูล',
    plo: 'PLO2.1, PLO2.3, PLO2.4',
    emoji: '📊',
    recommendations: {
      1: 'ฝึกค้นงานวิจัยใน Google Scholar และอ่านบทคัดย่อทุกวัน + เริ่มเรียน Excel หรือ SPSS เบื้องต้นเพื่อวิเคราะห์ข้อมูลได้ (PLO2.1)',
      2: 'ลองทำ mini-research เล็กๆ ในหัวข้อที่สนใจ เช่น เก็บข้อมูลในแปลง แล้วนำเสนอผลกับเพื่อนหรืออาจารย์ (PLO2.3–2.4)',
    },
  },
  HS4: {
    id: 'HS4', type: 'hard',
    name: 'เทคโนโลยีและ AI Literacy',
    plo: 'PLO6',
    emoji: '🤖',
    recommendations: {
      1: 'ลองใช้ AI tools เช่น ChatGPT หรือ Gemini ช่วยสรุปบทความวิชาการ แล้วตรวจสอบว่าข้อมูลถูกต้องไหม ฝึก critical thinking ไปด้วย (PLO6)',
      2: 'ศึกษาว่า AI ทำงานอย่างไร และมีข้อจำกัดอะไรบ้าง โดยเฉพาะในงานเกษตร ลองเปรียบเทียบผล AI กับข้อมูลจริงในแปลง (PLO6.2)',
    },
  },
  HS5: {
    id: 'HS5', type: 'hard',
    name: 'ฐานความรู้เกษตรศาสตร์',
    plo: 'PLO1.1, PLO1.3',
    emoji: '📚',
    recommendations: {
      1: 'ทบทวนตำราหลักของวิชาที่เรียน เช่น Plant Physiology หรือ Soil Science แล้วลองวาด mind map เชื่อมความรู้ข้ามวิชา (PLO1.1)',
      2: 'อ่านบทความวิชาการสั้นๆ สัปดาห์ละ 1 ชิ้น และเข้าฟัง seminar ของภาควิชาให้สม่ำเสมอ (PLO1.3)',
    },
  },
  SS1: {
    id: 'SS1', type: 'soft',
    name: 'การคิดวิเคราะห์และแก้ปัญหา',
    plo: 'PLO1',
    emoji: '🧠',
    recommendations: {
      1: 'ฝึกตั้งคำถามกับสิ่งที่เรียนหรือสิ่งที่เห็นในชีวิตประจำวัน เช่น "ทำไมพืชในแปลงนี้ถึงโตช้า?" แล้วหาคำตอบด้วยตัวเอง (PLO1)',
      2: 'เข้าร่วม hackathon หรือ competition เกษตร เพื่อฝึกแก้ปัญหาจริงภายในเวลาจำกัดกับทีม (PLO1.2)',
    },
  },
  SS2: {
    id: 'SS2', type: 'soft',
    name: 'การบริหารโครงการ',
    plo: 'PLO2',
    emoji: '📋',
    recommendations: {
      1: 'เริ่มจากการวางแผนงานตัวเองก่อน เช่น ใช้ Notion หรือ Google Calendar จดตารางงานรายสัปดาห์ และติดตามว่าทำได้ตามแผนไหม (PLO2)',
      2: 'ลองรับบทหัวหน้าในงานกลุ่มสักครั้ง แล้วสรุปบทเรียนหลังจบงานว่าอะไรดี อะไรปรับได้ (PLO2.2)',
    },
  },
  SS3: {
    id: 'SS3', type: 'soft',
    name: 'การสื่อสารและนำเสนอ',
    plo: 'PLO4',
    emoji: '🎤',
    recommendations: {
      1: 'ฝึกอธิบายสิ่งที่เรียนให้เพื่อนฟัง 3 นาทีต่อสัปดาห์ ไม่ต้องสมบูรณ์แบบ แค่ฝึกพูดให้ชัดและคนฟังเข้าใจ (PLO4)',
      2: 'ลองเขียนสรุปงานวิชาการสั้นๆ เป็นภาษาที่คนทั่วไปอ่านเข้าใจ เช่น โพสต์ใน Facebook หรือ blog ส่วนตัว (PLO4.2)',
    },
  },
  SS4: {
    id: 'SS4', type: 'soft',
    name: 'ทีมงานและความหลากหลาย',
    plo: 'PLO5',
    emoji: '🤝',
    recommendations: {
      1: 'เข้าร่วมกิจกรรมหรือโปรเจกต์ที่ทำงานกับคนต่างคณะหรือต่างพื้นเพ เพื่อฝึกการสื่อสารและปรับตัวในทีมที่หลากหลาย (PLO5)',
      2: 'ลองเป็นคนดำเนินการประชุมกลุ่ม เช่น จด agenda และสรุปมติ จะช่วยฝึกทักษะ facilitate ทีม (PLO5.2)',
    },
  },
  SS5: {
    id: 'SS5', type: 'soft',
    name: 'จริยธรรมและความซื่อสัตย์',
    plo: 'PLO1.2, PLO2.2, PLO6.2',
    emoji: '⚖️',
    recommendations: {
      1: 'ทบทวนหลักการอ้างอิงที่ถูกต้อง เช่น APA style และฝึกตรวจสอบข้อมูลก่อนนำไปใช้ว่ามาจากแหล่งน่าเชื่อถือไหม (PLO1.2)',
      2: 'เมื่อใช้ AI ช่วยงานวิชาการ ฝึกตรวจสอบความถูกต้องทุกครั้งและแจ้งให้อาจารย์ทราบ ไม่ใช้แทนการคิดเอง (PLO6.2)',
    },
  },
  SS6: {
    id: 'SS6', type: 'soft',
    name: 'การเรียนรู้และพัฒนาตน',
    plo: 'PLO6.1',
    emoji: '🚀',
    recommendations: {
      1: 'ลองตั้งเป้าหมายส่วนตัวที่ชัดเจนสัก 1 ข้อ เช่น "อ่านบทความวิชาการ 1 ชิ้น/สัปดาห์" แล้วติดตามว่าทำได้ไหม (PLO6.1)',
      2: 'หาคอร์สออนไลน์ฟรีในหัวข้อที่อยากพัฒนา เช่น Coursera หรือ YouTube และตั้งเวลาเรียนให้ชัดเจนทุกสัปดาห์ (PLO6.1)',
    },
  },
};

export const HARD_SKILL_IDS = ['HS1', 'HS2', 'HS3', 'HS4', 'HS5'] as const;
export const SOFT_SKILL_IDS = ['SS1', 'SS2', 'SS3', 'SS4', 'SS5', 'SS6'] as const;
export type HardSkillId = typeof HARD_SKILL_IDS[number];
export type SoftSkillId = typeof SOFT_SKILL_IDS[number];
export type SkillId = HardSkillId | SoftSkillId;
