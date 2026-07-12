"use client";

import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import React from 'react';
import { MenuItem } from '../data/menuData';
import { useCart } from '../context/CartContext';

export default function RestaurantCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();

  return (
    <div style={{ minWidth: '160px', width: '160px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ height: '180px', position: 'relative' }}>
        <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 160px, 160px" />
        <div style={{ position: 'absolute', top: '8px', left: '0', background: 'var(--accent-red)', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }}>
          50% OFF up to ₹100
        </div>
        <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: '#16a34a', color: 'white', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
          4.2 <span style={{ fontSize: '8px' }}>★</span>
        </div>
      </div>
      <div style={{ padding: '12px 0' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.category.toUpperCase()} • {item.price}</p>
        <button
          onClick={(e) => {
            e.preventDefault();
            addToCart(item);
          }}
          style={{ 
            marginTop: '8px',
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            background: 'rgba(244, 208, 104, 0.1)', 
            color: 'var(--accent-gold)', 
            border: '1px solid rgba(244, 208, 104, 0.2)', 
            padding: '4px 8px', 
            borderRadius: '8px', 
            fontSize: '12px', 
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <span>ADD</span>
          <ShoppingBag size={12} />
        </button>
      </div>
    </div>
  );
}
