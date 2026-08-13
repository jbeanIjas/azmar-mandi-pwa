import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'azmar_phone_session';
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

type PhoneSession = {
  phone: string;
  expiresAt: number;
};

function sessionSecret() {
  const secret = process.env.OTP_SESSION_SECRET;
  if (!secret) throw new Error('OTP session secret is not configured.');
  return secret;
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}

export function createPhoneSessionToken(phone: string) {
  const payload = Buffer.from(JSON.stringify({
    phone,
    expiresAt: Date.now() + SESSION_AGE_SECONDS * 1000,
  } satisfies PhoneSession)).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

export function verifyPhoneSessionToken(token?: string): PhoneSession | null {
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PhoneSession;
    if (!session.phone || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getPhoneSession() {
  const cookieStore = await cookies();
  return verifyPhoneSessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export const phoneSessionCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_AGE_SECONDS,
};
