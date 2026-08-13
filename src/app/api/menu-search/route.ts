import { NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (query.length < 2) return Response.json({ results: [] });

  const results = await prisma.menuItem.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { categoryId: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      price: true,
      image: true,
      categoryId: true,
    },
    orderBy: { name: 'asc' },
    take: 5,
  });

  return Response.json({ results });
}
