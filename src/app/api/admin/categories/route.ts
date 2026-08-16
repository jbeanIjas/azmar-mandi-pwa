import { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '../../../../lib/prisma';
import { isAdminRequest, unauthorizedResponse } from '../../../../lib/adminAuth';

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) return unauthorizedResponse();
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === 'string' ? body.id.trim().toLowerCase() : '';
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const image = typeof body?.image === 'string' ? body.image.trim() : '';
  if (!id || !name || !image || !/^[a-z0-9-]+$/.test(id)) return Response.json({ error: 'Valid ID, name, and image are required.' }, { status: 400 });

  try {
    const category = await prisma.category.create({ data: { id, name, image } });
    revalidatePath('/');
    return Response.json(category, { status: 201 });
  } catch {
    return Response.json({ error: 'A collection with that ID already exists.' }, { status: 409 });
  }
}
