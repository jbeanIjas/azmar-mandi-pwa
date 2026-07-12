import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const categories = [
  { id: 'all', name: 'All', image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg', active: true },
  { id: 'signatures', name: 'Signatures', image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg' },
  { id: 'alfaham', name: 'Al Faham', image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg' },
  { id: 'mandi', name: 'Mandi', image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg' },
  { id: 'coastal', name: 'Coastal', image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg' },
  { id: 'beverages', name: 'Beverages', image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg' },
];

export default function CategoryScroll() {
  return (
    <div style={{ display: 'flex', overflowX: 'auto', padding: '16px', gap: '16px', background: 'var(--bg-dark)' }} className="hide-scrollbar">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', background: '#3b82f6', borderRadius: '12px', padding: '12px 8px', justifyContent: 'space-between' }}>
        <div style={{ background: 'white', color: 'red', fontWeight: 'bold', fontSize: '10px', padding: '2px 4px' }}>MEALS UNDER</div>
        <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>₹250</div>
        <div style={{ color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center' }}>Explore &gt;</div>
      </div>
      
      {categories.map((cat) => (
        <Link 
          key={cat.id} 
          href={cat.id === 'all' ? '/' : `/collection/${cat.id}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', gap: '8px', opacity: cat.active ? 1 : 0.6, textDecoration: 'none', color: 'inherit' }}
        >
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: cat.active ? '2px solid var(--accent-gold)' : '2px solid transparent' }}>
            <Image src={cat.image} alt={cat.name} width={60} height={60} style={{ objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: cat.active ? 'bold' : 'normal', borderBottom: cat.active ? '2px solid var(--accent-gold)' : 'none', paddingBottom: '4px' }}>{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
