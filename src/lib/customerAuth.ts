import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getPhoneSession } from './otpSession';

export type CustomerIdentity = {
  id: string;
  email?: string;
  phone?: string;
};

export async function getCustomerIdentity(): Promise<CustomerIdentity | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && key) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    });
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      return {
        id: `supabase:${data.user.id}`,
        email: data.user.email,
        phone: data.user.phone,
      };
    }
  }

  const phoneSession = await getPhoneSession();
  return phoneSession ? { id: `phone:${phoneSession.phone}`, phone: phoneSession.phone } : null;
}
