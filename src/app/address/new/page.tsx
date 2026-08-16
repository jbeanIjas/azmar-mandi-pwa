import AddressPageClient from '../../../components/AddressPageClient';

export default async function NewAddressPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const query = (await searchParams).q;
  return <AddressPageClient initialSearch={Array.isArray(query) ? query[0] || '' : query || ''} />;
}
