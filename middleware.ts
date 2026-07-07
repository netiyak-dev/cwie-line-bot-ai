/**
 * middleware.ts — protect /admin routes
 * ทุก request ไป /admin/* (ยกเว้น /admin/login) ต้องมี cookie admin-auth ที่ถูกต้อง
 */
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const authCookie = request.cookies.get('admin-auth');
    const expected = process.env.ADMIN_PASSWORD ?? '';

    if (!expected || !authCookie || authCookie.value !== expected) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
