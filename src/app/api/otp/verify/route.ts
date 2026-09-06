import { createPhoneSessionToken, pendingOtpCookie, phoneSessionCookie, verifyPendingOtp } from '@/lib/otpSession';
import { checkOtpRateLimit } from '@/lib/otpRateLimit';
import { normalizeIndianPhone } from '@/lib/phone';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ phone: null, otp: null }));
  const mobile = normalizeIndianPhone(body.phone);
  const otp = typeof body.otp === 'string' ? body.otp.replace(/\D/g, '') : '';

  if (!mobile || !/^\d{4,8}$/.test(otp)) {
    return Response.json({ error: 'Enter the valid OTP sent to your WhatsApp.' }, { status: 400 });
  }

  const ip = request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'local';
  const rateLimit = checkOtpRateLimit(`verify:${ip}:${mobile}`, 10, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many verification attempts. Try again in ${rateLimit.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  const cookieStore = await cookies();
  const pendingToken = cookieStore.get(pendingOtpCookie.name)?.value;

  const isValid = verifyPendingOtp(mobile, otp, pendingToken);

  if (!isValid) {
    return Response.json({ error: 'That OTP is incorrect or has expired.' }, { status: 400 });
  }

  // Clear pending OTP cookie
  cookieStore.delete(pendingOtpCookie.name);

  // Set long-lived authenticated customer session cookie (30 days)
  cookieStore.set(phoneSessionCookie.name, createPhoneSessionToken(mobile), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: phoneSessionCookie.maxAge,
    priority: 'high',
  });

  return Response.json({ success: true, phone: mobile });
}
