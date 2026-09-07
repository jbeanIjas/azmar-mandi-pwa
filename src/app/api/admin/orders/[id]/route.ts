import { NextRequest } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { isAdminRequest, unauthorizedResponse } from '../../../../../lib/adminAuth';
import { sendWhatsAppOrderStatusNotification } from '../../../../../lib/msg91Whatsapp';

const STATUS_FLOW = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
const ALL_STATUSES = [...STATUS_FLOW, 'CANCELLED'];

export async function PATCH(request: NextRequest, context: RouteContext<'/api/admin/orders/[id]'>) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as { status?: string } | null;
  const newStatus = body?.status?.toUpperCase();
  if (!newStatus || !ALL_STATUSES.includes(newStatus)) {
    return Response.json({ error: 'Invalid order status.' }, { status: 400 });
  }

  try {
    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return Response.json({ error: 'Order not found.' }, { status: 404 });
    }

    const currentStatus = existingOrder.status;

    // 1. If order is already completed or cancelled, lock it completely
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
      return Response.json(
        { error: `This order is already ${currentStatus.toLowerCase()} and cannot be modified.` },
        { status: 400 }
      );
    }

    // 2. Cancellation Rule: Can only cancel if currently PLACED (or PENDING). Cannot cancel once Confirmed or beyond.
    if (newStatus === 'CANCELLED') {
      if (currentStatus !== 'PLACED' && currentStatus !== 'PENDING') {
        return Response.json(
          { error: `Order cannot be cancelled once it has been confirmed by the kitchen.` },
          { status: 400 }
        );
      }
    } else {
      // 3. Forward Progression Rule: Cannot move backwards to a previous step
      const currentIndex = STATUS_FLOW.indexOf(currentStatus);
      const newIndex = STATUS_FLOW.indexOf(newStatus);

      if (currentIndex !== -1 && newIndex <= currentIndex) {
        return Response.json(
          { error: `Order is already at ${currentStatus}. Status cannot be reverted to a previous step.` },
          { status: 400 }
        );
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: { items: true },
    });

    // Notify customer on WhatsApp for the new stage
    try {
      await sendWhatsAppOrderStatusNotification(order, newStatus);
    } catch (err) {
      console.error(`[MSG91 WhatsApp] Failed to send stage notification for order ${order.orderNumber}:`, err);
    }

    return Response.json(order);
  } catch {
    return Response.json({ error: 'Failed to update order status.' }, { status: 500 });
  }
}

