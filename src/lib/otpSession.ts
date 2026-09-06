import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'azmar_phone_session';
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 30;

type PhoneSession = {
  phone: string;
  expiresAt: number;
};

function sessionSecret() {
  return process.env.OTP_SESSION_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'azmar-mandi-default-otp-secret-key-32chars';
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

  try {
    const expected = Buffer.from(sign(payload));
    const supplied = Buffer.from(signature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;

    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PhoneSession;
    if (!session.phone || session.expiresAt <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getPhoneSession() {
  try {
    const cookieStore = await cookies();
    return verifyPhoneSessionToken(cookieStore.get(COOKIE_NAME)?.value);
  } catch {
    return null;
  }
}

export const phoneSessionCookie = {
  name: COOKIE_NAME,
  maxAge: SESSION_AGE_SECONDS,
};

const PENDING_OTP_COOKIE = 'azmar_pending_otp';
const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes

type PendingOtpPayload = {
  phone: string;
  hash: string;
  expiresAt: number;
};

// In-memory fallback map for server environments
const inMemoryOtpStore = new Map<string, { hash: string; expiresAt: number }>();

function hashOtp(phone: string, otp: string) {
  return createHmac('sha256', sessionSecret()).update(`${phone}:${otp}`).digest('hex');
}

export function createPendingOtpToken(phone: string, otp: string) {
  const expiresAt = Date.now() + OTP_EXPIRY_SECONDS * 1000;
  const hash = hashOtp(phone, otp);

  // Also save to in-memory store as redundancy
  inMemoryOtpStore.set(phone, { hash, expiresAt });

  const payload = Buffer.from(JSON.stringify({
    phone,
    hash,
    expiresAt,
  } satisfies PendingOtpPayload)).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

export function verifyPendingOtp(phone: string, enteredOtp: string, token?: string): boolean {
  const now = Date.now();
  const cleanOtp = enteredOtp.replace(/\D/g, '');
  if (!cleanOtp) return false;

  const expectedHash = hashOtp(phone, cleanOtp);

  // 1. Try In-Memory Store
  const mem = inMemoryOtpStore.get(phone);
  if (mem) {
    if (mem.expiresAt > now) {
      const isMatch = timingSafeEqual(Buffer.from(mem.hash), Buffer.from(expectedHash));
      if (isMatch) {
        inMemoryOtpStore.delete(phone);
        return true;
      }
    } else {
      inMemoryOtpStore.delete(phone);
    }
  }

  // 2. Try Cookie Token
  if (!token) return false;
  const [payloadStr, signature] = token.split('.');
  if (!payloadStr || !signature) return false;

  try {
    const expectedSig = Buffer.from(sign(payloadStr));
    const suppliedSig = Buffer.from(signature);
    if (expectedSig.length !== suppliedSig.length || !timingSafeEqual(expectedSig, suppliedSig)) return false;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8')) as PendingOtpPayload;
    if (payload.phone !== phone || payload.expiresAt <= now) return false;

    const isMatch = timingSafeEqual(Buffer.from(payload.hash), Buffer.from(expectedHash));
    if (isMatch) {
      inMemoryOtpStore.delete(phone);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export const pendingOtpCookie = {
  name: PENDING_OTP_COOKIE,
  maxAge: OTP_EXPIRY_SECONDS,
};
