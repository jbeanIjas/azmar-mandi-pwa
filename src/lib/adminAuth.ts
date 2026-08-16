import { createHash, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { getCustomerIdentity } from './customerAuth';

export const ADMIN_COOKIE = 'azmar_admin_session';

function configuredPassword() {
  return process.env.ADMIN_PASSWORD ?? '';
}

export function adminSessionToken() {
  const password = configuredPassword();
  if (!password) return '';
  return createHash('sha256').update(`azmar-mandi-admin:${password}`).digest('hex');
}

export function verifyAdminPassword(candidate: string) {
  const password = configuredPassword();
  if (!password || !candidate) return false;
  const expected = Buffer.from(password);
  const received = Buffer.from(candidate);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function verifyAdminSession(value?: string) {
  const expected = adminSessionToken();
  if (!expected || !value) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(value);
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function isAdminRequest(request: NextRequest) {
  if (verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) return true;
  const customer = await getCustomerIdentity();
  const adminEmail = (process.env.ADMIN_EMAIL || 'azmarmandi@gmail.com').toLowerCase();
  return customer?.email?.toLowerCase() === adminEmail;
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
