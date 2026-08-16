import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '../../../../../lib/prisma';
import { isAdminRequest, unauthorizedResponse } from '../../../../../lib/adminAuth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();
  const { id } = await params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const image = typeof body?.image === 'string' ? body.image.trim() : '';
  if (!name || !image) return Response.json({ error: 'Name and image are required.' }, { status: 400 });
  const category = await prisma.category.update({ where: { id }, data: { name, image } }).catch(() => null);
  if (!category) return Response.json({ error: 'Collection not found.' }, { status: 404 });
  revalidatePath('/');
  revalidatePath(`/collection/${id}`);
  return Response.json(category);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();
  const { id } = await params;
  const productCount = await prisma.menuItem.count({ where: { categoryId: id } });
  if (productCount > 0) return Response.json({ error: 'Move or delete the products in this collection first.' }, { status: 409 });
  const deleted = await prisma.category.delete({ where: { id } }).catch(() => null);
  if (!deleted) return Response.json({ error: 'Collection not found.' }, { status: 404 });
  revalidatePath('/');
  return Response.json({ ok: true });
}
