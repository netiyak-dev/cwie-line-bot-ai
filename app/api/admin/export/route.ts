/**
 * GET /api/admin/export — download CSV ของผลประเมินทั้งหมด (anonymized)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAllAssessments } from '@/lib/assessment/store';
import { SKILLS } from '@/lib/assessment/skills';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authCookie = req.cookies.get('admin-auth');
  if (!authCookie || authCookie.value !== (process.env.ADMIN_PASSWORD ?? '')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const assessments = await getAllAssessments();
  const skillIds = Object.keys(SKILLS);
  const skillNames = skillIds.map((id) => SKILLS[id].name);

  const header = [
    'assessmentAt',
    'hardScore',
    'softScore',
    'overallScore',
    ...skillIds.map((id, i) => `${id}_${skillNames[i]}`),
  ].join(',');

  const rows = assessments
    .sort((a, b) => a.assessmentAt.localeCompare(b.assessmentAt))
    .map((a) =>
      [
        a.assessmentAt,
        a.hardScore,
        a.softScore,
        a.overallScore,
        ...skillIds.map((id) => a.skillScores[id] ?? 0),
      ].join(',')
    );

  const csv = '﻿' + [header, ...rows].join('\n'); // BOM for Excel Thai support

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="agsp-assessments-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
