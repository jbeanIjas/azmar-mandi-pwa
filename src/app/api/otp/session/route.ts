import { getPhoneSession } from '@/lib/otpSession';

export async function GET() {
  const session = await getPhoneSession();
  if (!session?.phone) {
    return Response.json({ authenticated: false });
  }

  const cleanPhone = session.phone.replace(/\D/g, '').slice(-10);
  return Response.json({
    authenticated: true,
    phone: cleanPhone,
    fullPhone: session.phone,
  });
}
