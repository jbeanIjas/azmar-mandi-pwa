import { NextRequest } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { isAdminRequest, unauthorizedResponse } from '../../../../../lib/adminAuth';

const statuses = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export async function PATCH(request: NextRequest, context: RouteContext<'/api/admin/orders/[id]'>) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as { status?: string } | null;
  if (!body?.status || !statuses.includes(body.status)) return Response.json({ error: 'Invalid order status.' }, { status: 400 });

  try {
    const order = await prisma.order.update({ where: { id }, data: { status: body.status }, include: { items: true } });
    return Response.json(order);
  } catch {
    return Response.json({ error: 'Order not found.' }, { status: 404 });
  }
}
