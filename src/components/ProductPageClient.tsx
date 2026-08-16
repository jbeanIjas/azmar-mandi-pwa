"use client";

import type { MenuItem } from '@prisma/client';
import { useRouter } from 'next/navigation';
import ProductModal from './ProductModal';

export default function ProductPageClient({ item }: { item: MenuItem }) {
  const router = useRouter();
  return <ProductModal item={item} pageMode onClose={() => router.back()} />;
}
