import crypto from 'crypto';

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = process.env.CASHFREE_ENV || 'SANDBOX';

const BASE_URL = CASHFREE_ENV.toUpperCase() === 'PRODUCTION'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const API_VERSION = '2023-08-01';

export type CreateCashfreeOrderParams = {
  orderId: string;
  amount: number;
  customerId: string;
  customerPhone: string;
  customerName?: string;
  customerEmail?: string;
  returnUrl?: string;
  notifyUrl?: string;
};

export type CashfreeOrderResponse = {
  cf_order_id: string | number;
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
  payment_session_id: string;
};

export async function createCashfreeOrder(params: CreateCashfreeOrderParams): Promise<CashfreeOrderResponse> {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error('Cashfree App ID or Secret Key is missing in environment variables.');
  }

  // Clean customer ID (alphanumeric and underscores only, max 50 chars)
  const cleanCustomerId = params.customerId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) || 'guest_customer';
  
  // Format phone (10 digits)
  const cleanPhone = params.customerPhone.replace(/\D/g, '').slice(-10);

  const payload = {
    order_id: params.orderId,
    order_amount: params.amount,
    order_currency: 'INR',
    customer_details: {
      customer_id: cleanCustomerId,
      customer_name: params.customerName || 'Customer',
      customer_email: params.customerEmail || 'customer@azmarmandi.com',
      customer_phone: cleanPhone,
    },
    order_meta: {
      return_url: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL || ''}/order-success?order_id={order_id}`,
      notify_url: params.notifyUrl,
    },
  };

  const response = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': API_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Cashfree order creation error:', data);
    throw new Error(data.message || data.error || 'Failed to create payment session with Cashfree.');
  }

  return {
    cf_order_id: data.cf_order_id,
    order_id: data.order_id,
    order_amount: data.order_amount,
    order_currency: data.order_currency,
    order_status: data.order_status,
    payment_session_id: data.payment_session_id,
  };
}

export async function getCashfreeOrderDetails(orderId: string) {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error('Cashfree App ID or Secret Key is missing.');
  }

  const response = await fetch(`${BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': API_VERSION,
    },
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch Cashfree order status.');
  }

  return data; // returns order_status ('PAID', 'ACTIVE', etc.), order_amount, cf_order_id
}

export async function getCashfreePayments(orderId: string) {
  if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
    throw new Error('Cashfree App ID or Secret Key is missing.');
  }

  const response = await fetch(`${BASE_URL}/orders/${encodeURIComponent(orderId)}/payments`, {
    method: 'GET',
    headers: {
      'x-client-id': CASHFREE_APP_ID,
      'x-client-secret': CASHFREE_SECRET_KEY,
      'x-api-version': API_VERSION,
    },
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    return [];
  }

  return Array.isArray(data) ? data : [];
}

export function verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
  if (!signature || !timestamp || !CASHFREE_SECRET_KEY) return false;
  const data = timestamp + rawBody;
  const expectedSignature = crypto.createHmac('sha256', CASHFREE_SECRET_KEY).update(data).digest('base64');
  return expectedSignature === signature;
}
