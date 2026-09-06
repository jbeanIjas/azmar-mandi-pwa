import { getPhoneSession } from './otpSession';

export type CustomerIdentity = {
  id: string;
  phone?: string;
  email?: string;
};

export async function getCustomerIdentity(): Promise<CustomerIdentity | null> {
  const phoneSession = await getPhoneSession();
  if (phoneSession) {
    return {
      id: `phone:${phoneSession.phone}`,
      phone: phoneSession.phone,
    };
  }

  return null;
}

