import { checkOtpRateLimit } from '@/lib/otpRateLimit';
import { createPendingOtpToken, pendingOtpCookie } from '@/lib/otpSession';
import { normalizeIndianPhone } from '@/lib/phone';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { phone } = await request.json().catch(() => ({ phone: null }));
  const mobile = normalizeIndianPhone(phone);
  if (!mobile) {
    return Response.json({ error: 'Enter a valid 10-digit Indian mobile number.' }, { status: 400 });
  }

  const ip = request.headers.get('x-real-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'local';
  const rateLimit = checkOtpRateLimit(`${ip}:${mobile}`, 5, 5 * 60 * 1000);
  if (!rateLimit.allowed) {
    return Response.json(
      { error: `Too many OTP requests. Try again in ${rateLimit.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfter) } },
    );
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const integratedNumber = process.env.MSG91_INTEGRATED_NUMBER;
  const whatsappOtpTemplate = process.env.MSG91_WHATSAPP_TEMPLATE_OTP || 'otp_verification';

  if (!authKey || !integratedNumber) {
    return Response.json({ error: 'WhatsApp OTP service is not configured.' }, { status: 503 });
  }

  // 1. Generate a secure 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Prepare WhatsApp Outbound message payload
  const payload = {
    integrated_number: integratedNumber,
    content_type: 'template',
    payload: {
      messaging_product: 'whatsapp',
      type: 'template',
      template: {
        name: whatsappOtpTemplate,
        language: {
          code: 'en',
          policy: 'deterministic',
        },
        to_and_components: [
          {
            to: [mobile],
            components: {
              body_1: {
                type: 'text',
                value: otp,
              },
              button_1: {
                subtype: 'url',
                type: 'text',
                value: otp,
              },
            },
          },
        ],
      },
    },
  };

  const endpoints = [
    'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
    'https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/',
  ];

  let lastError = 'Could not send WhatsApp OTP';

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
        signal: AbortSignal.timeout(8_000),
      });

      const result = await response.json().catch(() => null) as { status?: string; message?: string } | null;

      if (!response.ok || result?.status === 'error' || result?.status === 'fail') {
        console.error('[WhatsApp OTP Send Error]:', { status: response.status, result });
        lastError = result?.message || lastError;
        continue;
      }

      // Set signed pending OTP token cookie
      const token = createPendingOtpToken(mobile, otp);
      const cookieStore = await cookies();
      cookieStore.set(pendingOtpCookie.name, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: pendingOtpCookie.maxAge,
      });

      console.info(`[WhatsApp OTP] Code sent successfully to ${mobile}.`);
      return Response.json({ success: true });
    } catch (error) {
      console.warn(`[WhatsApp OTP] Endpoint ${endpoint} failed, trying next:`, error);
    }
  }

  return Response.json({ error: lastError }, { status: 502 });
}
