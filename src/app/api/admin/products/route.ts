import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '../../../../lib/prisma';
import { isAdminRequest, unauthorizedResponse } from '../../../../lib/adminAuth';

function productData(body: Record<string, unknown> | null) {
  const tags = Array.isArray(body?.tags) ? body.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map((tag) => tag.trim()) : [];
  const gallery = Array.isArray(body?.gallery) ? body.gallery.filter((image): image is string => typeof image === 'string' && image.trim().length > 0).map((image) => image.trim()) : [];
  return {
    id: typeof body?.id === 'string' ? body.id.trim().toLowerCase() : '',
    name: typeof body?.name === 'string' ? body.name.trim() : '',
    description: typeof body?.description === 'string' ? body.description.trim() : '',
    price: typeof body?.price === 'string' ? body.price.trim() : '',
    image: typeof body?.image === 'string' ? body.image.trim() : '',
    categoryId: typeof body?.categoryId === 'string' ? body.categoryId.trim() : '',
    tags,
    specs: gallery.length ? { gallery } : undefined,
  };
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorizedResponse();
  const data = productData(await request.json().catch(() => null));
  if (!data.id || !data.name || !data.description || !data.price || !data.image || !data.categoryId || !/^[a-z0-9-]+$/.test(data.id)) return Response.json({ error: 'All product fields and a valid ID are required.' }, { status: 400 });
  try {
    const product = await prisma.menuItem.create({ data });
    revalidatePath('/');
    revalidatePath(`/collection/${data.categoryId}`);
    return Response.json(product, { status: 201 });
  } catch {
    return Response.json({ error: 'Could not create product. Check its ID and collection.' }, { status: 409 });
  }
}
