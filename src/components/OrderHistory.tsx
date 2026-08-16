"use client";

import Link from 'next/link';
import { ArrowLeft, Clock3, RotateCcw, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  orderType: string;
  paymentMethod: string;
  deliveryAddress: string | null;
  total: number;
  createdAt: string;
  items: Array<{ productId: string; name: string; price: number; image: string; quantity: number }>;
};

const statusLabels: Record<string, string> = {
  PLACED: 'Order placed', CONFIRMED: 'Confirmed', PREPARING: 'Preparing', READY: 'Ready', COMPLETED: 'Completed', CANCELLED: 'Cancelled',
};

export default function OrderHistory({ orders, signedIn }: { orders: Order[]; signedIn: boolean }) {
  const { addItemsToCart } = useCart();

  const reorder = (order: Order) => {
    addItemsToCart(order.items.map((item) => ({
      id: item.productId,
      name: item.name,
      description: '',
      price: `₹${item.price}`,
      image: item.image,
      categoryId: '',
      tags: [],
      specs: null,
      quantity: item.quantity,
    })));
  };

  return (
    <main style={{ minHeight: '100vh', padding: '24px 16px 120px', background: '#f7f4f2', color: '#212121' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'var(--accent-red)', textDecoration: 'none', fontSize: '12px', fontWeight: 800 }}><ArrowLeft size={16} /> Back to menu</Link>
        <header style={{ margin: '24px 0' }}><small style={{ color: 'var(--accent-red)', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase' }}>Your account</small><h1 style={{ margin: '5px 0 7px', fontFamily: 'var(--font-playfair)', fontSize: '38px' }}>Order history</h1><p style={{ margin: 0, color: '#777', fontSize: '13px' }}>Track current orders and add past favourites back to your cart.</p></header>

        {!signedIn ? <section style={{ padding: '45px 24px', border: '1px solid #e7dfda', borderRadius: '20px', background: '#fff', textAlign: 'center' }}><ShoppingBag size={40} color="var(--accent-red)" /><h2>Sign in to see your orders</h2><p style={{ color: '#777', fontSize: '13px' }}>Use the account button on the home page, then return here.</p><Link href="/" style={{ display: 'inline-block', marginTop: '8px', padding: '12px 18px', borderRadius: '10px', background: 'var(--accent-red)', color: '#fff', textDecoration: 'none', fontWeight: 800 }}>Go to sign in</Link></section> : orders.length === 0 ? <section style={{ padding: '45px 24px', border: '1px solid #e7dfda', borderRadius: '20px', background: '#fff', textAlign: 'center' }}><ShoppingBag size={40} color="var(--accent-red)" /><h2>No orders yet</h2><p style={{ color: '#777', fontSize: '13px' }}>Your first online order will appear here.</p></section> : (
          <div style={{ display: 'grid', gap: '14px' }}>{orders.map((order) => <article key={order.id} style={{ padding: '20px', border: '1px solid #e7dfda', borderRadius: '18px', background: '#fff', boxShadow: '0 8px 25px rgba(33,33,33,.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><div><strong style={{ fontSize: '15px' }}>{order.orderNumber}</strong><span style={{ display: 'flex', marginTop: '5px', alignItems: 'center', gap: '5px', color: '#888', fontSize: '10px' }}><Clock3 size={12} /> {new Date(order.createdAt).toLocaleString()}</span></div><span style={{ height: 'fit-content', padding: '6px 9px', borderRadius: '999px', background: 'rgba(189,29,75,.09)', color: 'var(--accent-red)', fontSize: '9px', fontWeight: 900 }}>{statusLabels[order.status] || order.status}</span></div>
            <div style={{ margin: '16px 0', padding: '12px 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>{order.items.map((item) => <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#555', fontSize: '12px' }}><span>{item.quantity} × {item.name}</span><strong>₹{item.price * item.quantity}</strong></div>)}</div>
            {order.deliveryAddress && <p style={{ margin: '0 0 12px', color: '#777', fontSize: '11px', lineHeight: 1.5 }}>{order.deliveryAddress}</p>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><small style={{ color: '#999', textTransform: 'uppercase' }}>{order.orderType} · {order.paymentMethod}</small><strong style={{ display: 'block', marginTop: '2px', fontSize: '18px', color: 'var(--accent-red)' }}>₹{order.total}</strong></div><button onClick={() => reorder(order)} style={{ display: 'inline-flex', padding: '11px 14px', alignItems: 'center', gap: '7px', border: 0, borderRadius: '10px', background: '#212121', color: '#fff', fontWeight: 800, cursor: 'pointer' }}><RotateCcw size={15} /> Reorder</button></div>
          </article>)}</div>
        )}
      </div>
    </main>
  );
}
