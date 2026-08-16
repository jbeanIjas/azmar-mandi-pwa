"use client";

import { useRouter } from 'next/navigation';
import EventBooking from './EventBooking';

export default function CateringPageClient() {
  const router = useRouter();
  return <main style={{ minHeight: '100vh', paddingBottom: '76px', background: 'var(--bg-darker)' }}><EventBooking pageMode isOpen onClose={() => router.back()} /></main>;
}
