import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import RestaurantCard from '../../../components/RestaurantCard';
import prisma from '../../../lib/prisma';

export default async function CollectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  const items = category.toLowerCase() === 'all' 
    ? await prisma.menuItem.findMany()
    : await prisma.menuItem.findMany({
        where: {
          categoryId: category.toLowerCase()
        }
      });
  
  // Format category title
  const title = category.replace(/-/g, ' ').toUpperCase();

  return (
    <main style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: '#f8f7f6' }}>
      
      {/* Header */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 40,
        background: 'rgba(255,255,255,.96)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        boxShadow: '0 8px 24px rgba(33,33,33,.06)',
        backdropFilter: 'blur(16px)'
      }}>
        <Link href="/" style={{ display: 'grid', placeItems: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(189,29,75,.1)', color: 'var(--accent-red)' }}>
          <ArrowLeft size={24} />
        </Link>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#212121', margin: 0, letterSpacing: '0.04em' }}>
          {title}
        </h1>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Showing {items.length} items from {title}
        </p>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
            <p>No items found in this category.</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
            gap: '16px',
            justifyItems: 'center'
          }}>
            {items.map(item => (
              <RestaurantCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
