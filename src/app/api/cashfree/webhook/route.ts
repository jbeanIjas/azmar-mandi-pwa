import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyWebhookSignature } from '../../../../lib/cashfree';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';
    const timestamp = request.headers.get('x-webhook-timestamp') || '';

    if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
      console.warn('Invalid Cashfree webhook signature received');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    const orderData = payload.data?.order;
    const paymentData = payload.data?.payment;

    if (!orderData?.order_id) {
      return NextResponse.json({ status: 'ignored' });
    }

    const orderNumber = orderData.order_id;

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK') {
      await prisma.order.updateMany({
        where: { orderNumber },
        data: {
          paymentStatus: 'PAID',
          cfOrderId: String(orderData.cf_order_id || ''),
          cfPaymentId: String(paymentData?.cf_payment_id || ''),
          status: 'PLACED',
        },
      });
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK') {
      await prisma.order.updateMany({
        where: { orderNumber },
        data: {
          paymentStatus: 'FAILED',
          cfOrderId: String(orderData.cf_order_id || ''),
        },
      });
    }

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Cashfree Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
