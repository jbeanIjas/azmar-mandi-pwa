import { checkOtpRateLimit } from '@/lib/otpRateLimit';
import { normalizeIndianPhone } from '@/lib/phone';

export async function POST(request: Request) {
  const { phone } = await request.json().catch(() => ({ phone: null }));
  const mobile = normalizeIndianPhone(phone);
  if (!mobile) {
    return Response.json({ error: 'Enter a valid 10-digit Indian mobile number.' }, { status: 400 });
  }

  const ip = request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'local';
  const rateLimit = checkOtpRateLimit(`${ip}:${mobile}`, 3, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many OTP requests. Try again in ${rateLimit.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
  if (!authKey || !templateId) {
    return Response.json({ error: 'OTP service is not configured.' }, { status: 503 });
  }

  const url = new URL('https://control.msg91.com/api/v5/otp');
  url.searchParams.set('template_id', templateId);
  url.searchParams.set('mobile', mobile);
  url.searchParams.set('authkey', authKey);
  url.searchParams.set('otp_expiry', '5');
  url.searchParams.set('otp_length', '6');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json().catch(() => null) as { type?: string; message?: string } | null;

    if (!response.ok || result?.type !== 'success') {
      console.error('MSG91 send error', { status: response.status, message: result?.message });
      return Response.json({ error: 'We could not send the OTP. Please try again.' }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('MSG91 connection error', error);
    return Response.json({ error: 'OTP service is temporarily unavailable.' }, { status: 503 });
  }
}
