"use client";

import { useRouter } from 'next/navigation';
import AddressEditor from './AddressEditor';

export default function AddressPageClient({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  return <AddressEditor pageMode initialSearch={initialSearch} onClose={() => router.back()} />;
}
