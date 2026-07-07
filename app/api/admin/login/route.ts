/**
 * POST /api/admin/login — ตรวจ password แล้ว set cookie
 */
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';
const COOKIE_NAME = 'admin-auth';
const COOKIE_TTL = 60 * 60 * 8; // 8 ชั่วโมง

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.formData();
  const password = (body.get('password') as string) ?? '';

  if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL('/admin/login?error=1', req.url));
  }

  const res = NextResponse.redirect(new URL('/admin', req.url));
  res.cookies.set(COOKIE_NAME, ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_TTL,
    path: '/',
  });
  return res;
}
