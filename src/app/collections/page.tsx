import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Layers3 } from 'lucide-react';
import prisma from '../../lib/prisma';

export const metadata: Metadata = {
  title: 'Menu Collections | Azmar Mandi',
  description: 'Explore every Azmar Mandi menu collection.',
};

const fallbackCollections = [
  { id: 'signatures', name: 'Signatures', image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg', count: 0 },
  { id: 'alfaham', name: 'Al Faham', image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg', count: 0 },
  { id: 'mandi', name: 'Mandi', image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg', count: 0 },
  { id: 'coastal', name: 'Coastal', image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg', count: 0 },
  { id: 'beverages', name: 'Beverages', image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg', count: 0 },
];

export default async function CollectionsPage() {
  let collections = fallbackCollections;
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { name: 'asc' },
    });
    if (categories.length) collections = categories.map((category) => ({ ...category, count: category._count.items }));
  } catch (error) {
    console.error('Failed to load collections:', error);
  }

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '110px', background: 'linear-gradient(180deg, #fff 0%, #f7f2ef 40%, #f3eeeb 100%)', color: '#212121' }}>
      <header style={{ position: 'sticky', zIndex: 40, top: 0, display: 'flex', padding: '14px 16px', alignItems: 'center', gap: '13px', borderBottom: '1px solid rgba(33,33,33,.08)', background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(18px)' }}>
        <Link href="/" aria-label="Back to home" style={{ display: 'grid', width: '40px', height: '40px', placeItems: 'center', borderRadius: '50%', background: 'rgba(var(--accent-red-rgb),.09)', color: 'var(--accent-red)' }}><ArrowLeft size={20} /></Link>
        <div><small style={{ display: 'block', color: 'var(--accent-red)', fontSize: '8px', fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase' }}>Explore the menu</small><strong style={{ fontSize: '17px' }}>All collections</strong></div>
      </header>

      <section style={{ maxWidth: '980px', margin: '0 auto', padding: '38px 16px 18px' }}>
        <div style={{ display: 'grid', width: '52px', height: '52px', marginBottom: '17px', placeItems: 'center', borderRadius: '16px', background: 'var(--accent-red)', color: '#fff', boxShadow: '0 12px 30px rgba(var(--accent-red-rgb),.22)' }}><Layers3 size={25} /></div>
        <p style={{ margin: '0 0 5px', color: 'var(--accent-red)', fontSize: '10px', fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase' }}>Made for every craving</p>
        <h1 style={{ maxWidth: '620px', margin: 0, fontFamily: 'var(--font-playfair)', fontSize: 'clamp(38px, 8vw, 64px)', lineHeight: .98, letterSpacing: '-.045em' }}>Choose your feast.</h1>
        <p style={{ maxWidth: '560px', margin: '15px 0 0', color: '#777', fontSize: '13px', lineHeight: 1.65 }}>From slow-cooked mandi and smoky grills to coastal favourites and cool drinks, find exactly what you feel like eating.</p>
      </section>

      <section style={{ display: 'grid', maxWidth: '980px', margin: '0 auto', padding: '18px 16px', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px' }}>
        {collections.map((collection, index) => (
          <Link key={collection.id} href={`/collection/${collection.id}`} style={{ position: 'relative', minHeight: index === 0 ? '300px' : '240px', overflow: 'hidden', borderRadius: '22px', background: '#2a201d', color: '#fff', textDecoration: 'none', boxShadow: '0 16px 35px rgba(33,24,20,.12)' }}>
            <Image src={collection.image} alt="" fill sizes="(max-width: 600px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
            <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,10,8,.04) 20%, rgba(15,10,8,.88) 100%)' }} />
            <span style={{ display: 'flex', position: 'absolute', inset: 'auto 0 0', padding: '22px', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px' }}>
              <span><small style={{ display: 'block', marginBottom: '5px', color: 'rgba(255,255,255,.72)', fontSize: '9px', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase' }}>{collection.count ? `${collection.count} dishes` : 'Explore menu'}</small><strong style={{ display: 'block', fontFamily: 'var(--font-playfair)', fontSize: '29px', lineHeight: 1 }}>{collection.name}</strong></span>
              <span style={{ display: 'grid', width: '42px', height: '42px', flexShrink: 0, placeItems: 'center', border: '1px solid rgba(255,255,255,.35)', borderRadius: '50%', background: 'rgba(255,255,255,.14)', backdropFilter: 'blur(10px)' }}><ArrowUpRight size={19} /></span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
