import { createPhoneSessionToken, phoneSessionCookie } from '@/lib/otpSession';
import { checkOtpRateLimit } from '@/lib/otpRateLimit';
import { normalizeIndianPhone } from '@/lib/phone';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ phone: null, otp: null }));
  const mobile = normalizeIndianPhone(body.phone);
  const otp = typeof body.otp === 'string' ? body.otp.replace(/\D/g, '') : '';

  if (!mobile || !/^\d{4,9}$/.test(otp)) {
    return Response.json({ error: 'Enter the valid OTP sent to your mobile.' }, { status: 400 });
  }

  const ip = request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'local';
  const rateLimit = checkOtpRateLimit(`verify:${ip}:${mobile}`, 8, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many verification attempts. Try again in ${rateLimit.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) {
    return Response.json({ error: 'OTP service is not configured.' }, { status: 503 });
  }

  const url = new URL('https://control.msg91.com/api/v5/otp/verify');
  url.searchParams.set('otp', otp);
  url.searchParams.set('mobile', mobile);

  try {
    const response = await fetch(url, {
      headers: { authkey: authKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json().catch(() => null) as { type?: string; message?: string } | null;
    const verified = response.ok && result?.type === 'success' && /verified|success/i.test(result.message || '');

    if (!verified) {
      return Response.json({ error: 'That OTP is incorrect or has expired.' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set(phoneSessionCookie.name, createPhoneSessionToken(mobile), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: phoneSessionCookie.maxAge,
      priority: 'high',
    });

    return Response.json({ success: true, phone: mobile });
  } catch (error) {
    console.error('MSG91 verification error', error);
    return Response.json({ error: 'OTP verification is temporarily unavailable.' }, { status: 503 });
  }
}
