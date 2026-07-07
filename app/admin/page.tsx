/**
 * /admin — Admin Dashboard (Server Component)
 * แสดง aggregate stats เท่านั้น — ห้ามแสดงข้อมูลรายบุคคล (privacy by design)
 */
import type { ReactNode } from 'react';
import { getAllAssessments } from '@/lib/assessment/store';
import { getAllFollowups } from '@/lib/assessment/followup';
import { SKILLS } from '@/lib/assessment/skills';

const PRIMARY = '#003F88';
const GOLD = '#C9A227';
const GREEN = '#2D6A4F';
const ORANGE = '#E07B39';
const BG = '#F5F5F5';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [assessments, followups] = await Promise.all([
    getAllAssessments(),
    getAllFollowups(),
  ]);

  const total = assessments.length;

  // คำนวณ skill averages
  const skillIds = Object.keys(SKILLS);
  const skillAverages: Record<string, number> = {};
  for (const id of skillIds) {
    if (total === 0) { skillAverages[id] = 0; continue; }
    const scores = assessments.map((a) => a.skillScores[id] ?? 0);
    skillAverages[id] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  // Follow-up stats
  const optInCount = followups.filter((f) => f.optIn).length;
  const sent2wCount = followups.filter((f) => f.sent2w).length;
  const sent1mCount = followups.filter((f) => f.sent1m).length;
  const sent3mCount = followups.filter((f) => f.sent3m).length;

  // Hard vs Soft avg
  const avgHard = total > 0 ? Math.round(assessments.reduce((s, a) => s + a.hardScore, 0) / total) : 0;
  const avgSoft = total > 0 ? Math.round(assessments.reduce((s, a) => s + a.softScore, 0) / total) : 0;

  // Sort skills by average (ascending = จุดอ่อนก่อน)
  const sortedSkills = skillIds
    .map((id) => ({ id, avg: skillAverages[id], skill: SKILLS[id] }))
    .sort((a, b) => a.avg - b.avg);

  return (
    <div style={{ fontFamily: 'sans-serif', background: BG, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: PRIMARY, color: '#fff', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: GOLD, color: PRIMARY, fontWeight: 700, padding: '4px 12px', borderRadius: 6 }}>AGSP</span>
          <span style={{ fontWeight: 600, fontSize: 18 }}>Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/api/admin/export" style={{ background: GOLD, color: PRIMARY, padding: '7px 18px', borderRadius: 6, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            ⬇ Export CSV
          </a>
          <a href="/api/admin/logout" style={{ color: '#ccc', fontSize: 13, textDecoration: 'none' }}>ออกจากระบบ</a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="นักศึกษาที่ทำแบบประเมิน" value={total} unit="คน" color={PRIMARY} />
          <StatCard label="Hard Skill เฉลี่ย" value={avgHard} unit="%" color={GREEN} />
          <StatCard label="Soft Skill เฉลี่ย" value={avgSoft} unit="%" color="#5B6ABF" />
          <StatCard label="เปิดรับการแจ้งเตือน" value={optInCount} unit="คน" color={ORANGE} />
        </div>

        {/* Skill gap chart */}
        <Section title="ทักษะที่ต้องพัฒนา (เรียงจากคะแนนน้อยที่สุด)">
          {total === 0 ? (
            <p style={{ color: '#999', fontSize: 14 }}>ยังไม่มีข้อมูล</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedSkills.map(({ id, avg, skill }) => (
                <SkillBar key={id} id={id} name={skill.name} avg={avg} emoji={skill.emoji} />
              ))}
            </div>
          )}
        </Section>

        {/* Follow-up stats */}
        <Section title="สถิติ Follow-up">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <MiniStat label="ส่งที่ 2 สัปดาห์" value={sent2wCount} total={optInCount} />
            <MiniStat label="ส่งที่ 1 เดือน" value={sent1mCount} total={optInCount} />
            <MiniStat label="ส่งที่ 3 เดือน" value={sent3mCount} total={optInCount} />
          </div>
        </Section>

        <p style={{ color: '#bbb', fontSize: 12, textAlign: 'right', marginTop: 24 }}>
          ข้อมูลเป็น aggregate เท่านั้น ไม่แสดงผลรายบุคคล (Privacy by Design)
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}<span style={{ fontSize: 16, fontWeight: 400, marginLeft: 4 }}>{unit}</span></div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: PRIMARY, margin: '0 0 20px' }}>{title}</h2>
      {children}
    </div>
  );
}

function SkillBar({ id, name, avg, emoji }: { id: string; name: string; avg: number; emoji: string }) {
  const color = avg <= 50 ? ORANGE : avg <= 75 ? GOLD : GREEN;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 140, fontSize: 13, color: '#555', flexShrink: 0 }}>{emoji} {id}: {name}</div>
      <div style={{ flex: 1, background: '#eee', borderRadius: 4, height: 18, overflow: 'hidden' }}>
        <div style={{ width: `${avg}%`, background: color, height: '100%', borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
      <div style={{ width: 40, fontSize: 13, fontWeight: 600, color, textAlign: 'right' }}>{avg}%</div>
    </div>
  );
}

function MiniStat({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ background: BG, borderRadius: 8, padding: '14px 18px', textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: PRIMARY }}>{value}</div>
      <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
      {total > 0 && <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{pct}% ของที่ opt-in</div>}
    </div>
  );
}
