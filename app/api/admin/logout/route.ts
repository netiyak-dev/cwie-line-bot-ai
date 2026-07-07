import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.redirect(new URL('/admin/login', req.url));
  res.cookies.delete('admin-auth');
  return res;
}
