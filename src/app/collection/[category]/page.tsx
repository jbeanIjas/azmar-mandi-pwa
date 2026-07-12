import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { menuItems } from '../../../data/menuData';
import RestaurantCard from '../../../components/RestaurantCard';
import BottomNav from '../../../components/BottomNav';

export default async function CollectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  
  // Filter items by category
  const items = menuItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
  
  // Format category title
  const title = category.replace(/-/g, ' ').toUpperCase();

  return (
    <main style={{ paddingBottom: '100px', minHeight: '100vh', backgroundColor: '#0a0a0c' }}>
      
      {/* Header */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 40,
        background: 'linear-gradient(135deg, #7c1212 0%, #b81d22 100%)', 
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <Link href="/" style={{ color: 'white' }}>
          <ArrowLeft size={24} />
        </Link>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: 0, letterSpacing: '0.1em' }}>
          {title}
        </h1>
      </div>

      <div style={{ padding: '24px 16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Showing {items.length} items from {title}
        </p>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.5)' }}>
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

      <BottomNav />
    </main>
  );
}
