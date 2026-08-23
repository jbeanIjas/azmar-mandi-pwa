import { notFound } from 'next/navigation';
import type { MenuItem } from '@prisma/client';
import prisma from '../../../lib/prisma';
import { menuItems } from '../../../data/menuData';
import ProductPageClient from '../../../components/ProductPageClient';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: MenuItem | null = null;

  try {
    item = await prisma.menuItem.findUnique({ where: { id } });
  } catch (error) {
    console.error(`Failed to load product ${id} from Prisma:`, error);
  }

  if (!item) {
    const fallbackItem = menuItems.find((candidate) => candidate.id === id);
    if (fallbackItem) {
      item = {
        id: fallbackItem.id,
        name: fallbackItem.name,
        description: fallbackItem.description,
        price: fallbackItem.price,
        image: fallbackItem.image,
        categoryId: fallbackItem.category,
        tags: fallbackItem.tags ?? [],
        specs: fallbackItem.specs ?? null,
      };
    }
  }

  if (!item) notFound();
  return <ProductPageClient item={item} />;
}
