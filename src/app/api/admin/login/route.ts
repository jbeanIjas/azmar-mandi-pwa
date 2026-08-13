import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminSessionToken, verifyAdminPassword } from '../../../../lib/adminAuth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!verifyAdminPassword(password)) {
    return Response.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
