import { phoneSessionCookie } from '@/lib/otpSession';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(phoneSessionCookie.name);
  return Response.json({ success: true });
}
