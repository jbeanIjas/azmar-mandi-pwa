"use client";

import Image from 'next/image';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function CartAddedFeedback() {
  const router = useRouter();
  const { addedFeedback, dismissAddedFeedback } = useCart();
  if (!addedFeedback) return null;

  const { item, quantity } = addedFeedback;
  const price = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;

  return (
    <div className="cart-added-overlay" style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'grid', padding: '24px', placeItems: 'center', background: 'rgba(15,44,39,.72)', backdropFilter: 'blur(10px)' }}>
      <div className="cart-added-card" role="status" aria-live="polite" style={{ width: 'min(100%, 400px)', padding: '24px', border: '1px solid rgba(255,255,255,.55)', borderRadius: '24px', background: '#fff', boxShadow: '0 28px 80px rgba(10,42,36,.34)', animation: 'cart-added-pop .45s cubic-bezier(.2,.9,.3,1.2)' }}>
        <div style={{ display: 'grid', width: '58px', height: '58px', margin: '0 auto 12px', placeItems: 'center', borderRadius: '50%', background: 'var(--accent-red)', color: '#fff' }}><Check size={29} strokeWidth={3} /></div>
        <h2 style={{ margin: 0, color: '#17342f', textAlign: 'center', fontSize: '23px' }}>Added to your cart!</h2>
        <p style={{ margin: '6px 0 18px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '12px' }}>Your next delicious choice is ready.</p>
        <div style={{ display: 'flex', padding: '11px', alignItems: 'center', gap: '12px', border: '1px solid var(--border-subtle)', borderRadius: '15px', background: '#f7faf8' }}>
          <div style={{ position: 'relative', width: '60px', height: '60px', flex: '0 0 60px', overflow: 'hidden', borderRadius: '11px' }}><Image src={item.image} alt="" fill sizes="60px" style={{ objectFit: 'cover' }} /></div>
          <div style={{ minWidth: 0, flex: 1 }}><strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</strong><small style={{ color: 'var(--text-secondary)' }}>{quantity} item{quantity === 1 ? '' : 's'}</small></div>
          <strong style={{ color: 'var(--accent-red)' }}>₹{Math.round(price * quantity)}</strong>
        </div>
        <div style={{ display: 'grid', marginTop: '16px', gap: '9px' }}>
          <button onClick={() => { dismissAddedFeedback(); router.push('/cart'); }} style={{ display: 'flex', minHeight: '50px', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 0, borderRadius: '13px', background: 'var(--accent-red)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}><ShoppingBag size={17} /> Go to cart <ArrowRight size={16} /></button>
          <button onClick={dismissAddedFeedback} style={{ minHeight: '46px', border: '1px solid var(--border-subtle)', borderRadius: '13px', background: '#fff', color: 'var(--accent-red)', fontWeight: 800, cursor: 'pointer' }}>Continue shopping</button>
        </div>
      </div>
    </div>
  );
}
