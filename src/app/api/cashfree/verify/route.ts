import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getCashfreeOrderDetails, getCashfreePayments } from '../../../../lib/cashfree';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const dbOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: orderId },
          { id: orderId },
          { cfOrderId: orderId }
        ]
      },
      include: { items: true }
    });

    if (!dbOrder) {
      return NextResponse.json({ error: 'Order not found in database' }, { status: 404 });
    }

    // Fetch order details from Cashfree API
    const cfOrder = await getCashfreeOrderDetails(dbOrder.orderNumber);
    const payments = await getCashfreePayments(dbOrder.orderNumber);

    const isPaid = cfOrder.order_status === 'PAID';
    const successfulPayment = payments.find((p: { payment_status: string }) => p.payment_status === 'SUCCESS');
    const paymentStatus = isPaid ? 'PAID' : (cfOrder.order_status === 'EXPIRED' ? 'FAILED' : dbOrder.paymentStatus);

    const updatedOrder = await prisma.order.update({
      where: { id: dbOrder.id },
      data: {
        paymentStatus,
        cfOrderId: String(cfOrder.cf_order_id || dbOrder.cfOrderId || ''),
        cfPaymentId: successfulPayment?.cf_payment_id ? String(successfulPayment.cf_payment_id) : dbOrder.cfPaymentId,
        status: isPaid && dbOrder.status === 'PENDING' ? 'PLACED' : dbOrder.status,
      },
      include: { items: true }
    });

    return NextResponse.json({
      success: true,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.status,
      order: updatedOrder
    });

  } catch (error: any) {
    console.error('Error verifying Cashfree payment:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}
