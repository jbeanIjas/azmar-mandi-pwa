"use client";

import { useRouter } from 'next/navigation';
import LocationSelector from './LocationSelector';

export default function LocationPageClient() {
  const router = useRouter();
  return <LocationSelector pageMode onClose={() => router.back()} onAddAddress={(query = '') => router.push(`/address/new${query ? `?q=${encodeURIComponent(query)}` : ''}`)} />;
}
