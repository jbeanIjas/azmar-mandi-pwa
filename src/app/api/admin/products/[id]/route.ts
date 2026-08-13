import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '../../../../../lib/prisma';
import { isAdminRequest, unauthorizedResponse } from '../../../../../lib/adminAuth';

function readProductData(body: Record<string, unknown> | null) {
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map((tag) => tag.trim()) : [];
  const gallery = Array.isArray(body?.gallery) ? body.gallery.filter((image): image is string => typeof image === 'string' && image.trim().length > 0).map((image) => image.trim()) : [];
  return {
    name: typeof body?.name === 'string' ? body.name.trim() : '',
    description: typeof body?.description === 'string' ? body.description.trim() : '',
    price: typeof body?.price === 'string' ? body.price.trim() : '',
    image: typeof body?.image === 'string' ? body.image.trim() : '',
    categoryId: typeof body?.categoryId === 'string' ? body.categoryId.trim() : '',
    tags,
    specs: gallery.length ? { gallery } : undefined,
  };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) return unauthorizedResponse();
  const { id } = await params;
  const data = readProductData(await request.json().catch(() => null));
  if (!data.name || !data.description || !data.price || !data.image || !data.categoryId) return Response.json({ error: 'All product fields are required.' }, { status: 400 });
  const product = await prisma.menuItem.update({ where: { id }, data }).catch(() => null);
  if (!product) return Response.json({ error: 'Could not update product.' }, { status: 404 });
  revalidatePath('/');
  revalidatePath(`/collection/${data.categoryId}`);
  return Response.json(product);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) return unauthorizedResponse();
  const { id } = await params;
  const product = await prisma.menuItem.delete({ where: { id } }).catch(() => null);
  if (!product) return Response.json({ error: 'Product not found.' }, { status: 404 });
  revalidatePath('/');
  revalidatePath(`/collection/${product.categoryId}`);
  return Response.json({ ok: true });
}
