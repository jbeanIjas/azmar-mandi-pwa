import { NextRequest } from 'next/server';
import prisma from '../../../../lib/prisma';
import { isAdminRequest, unauthorizedResponse } from '../../../../lib/adminAuth';

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 200 });
  return Response.json(orders);
}
