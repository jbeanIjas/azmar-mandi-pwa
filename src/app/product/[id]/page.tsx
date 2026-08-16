import { notFound } from 'next/navigation';
import prisma from '../../../lib/prisma';
import ProductPageClient from '../../../components/ProductPageClient';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) notFound();
  return <ProductPageClient item={item} />;
}
