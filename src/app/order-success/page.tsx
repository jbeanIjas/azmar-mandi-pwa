import Link from 'next/link';
import { CheckCircle2, ClipboardList, Home } from 'lucide-react';

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ number?: string | string[] }> }) {
  const value = (await searchParams).number;
  const orderNumber = Array.isArray(value) ? value[0] : value;

  return (
    <main style={{ display: 'grid', minHeight: '100vh', padding: '28px 18px 120px', placeItems: 'center', background: 'radial-gradient(circle at top, rgba(var(--accent-red-rgb),.13), transparent 44%), #f7f3f0', color: '#212121' }}>
      <section style={{ width: 'min(100%, 520px)', padding: '38px 24px', border: '1px solid #eadfda', borderRadius: '26px', background: '#fff', boxShadow: '0 24px 70px rgba(50,30,25,.11)', textAlign: 'center' }}>
        <span style={{ display: 'grid', width: '72px', height: '72px', margin: '0 auto 20px', placeItems: 'center', borderRadius: '50%', background: 'rgba(var(--accent-red-rgb),.1)', color: 'var(--accent-red)' }}><CheckCircle2 size={38} /></span>
        <small style={{ color: 'var(--accent-red)', fontSize: '9px', fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase' }}>Order successful</small>
        <h1 style={{ margin: '8px 0 10px', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(34px, 9vw, 48px)', lineHeight: 1 }}>Thank you!</h1>
        <p style={{ margin: '0 auto', color: '#777', fontSize: '13px', lineHeight: 1.65 }}>Your order has been received by Azmar Mandi. We’ll contact you on WhatsApp if we need anything.</p>
        {orderNumber && <div style={{ margin: '22px 0', padding: '14px', borderRadius: '13px', background: '#f8f4f2' }}><small style={{ display: 'block', marginBottom: '4px', color: '#999', fontSize: '8px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>Order number</small><strong style={{ color: 'var(--accent-red)', fontSize: '17px' }}>{orderNumber}</strong></div>}
        <div style={{ display: 'grid', gap: '9px' }}>
          <Link href="/account/orders" style={{ display: 'flex', minHeight: '47px', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px', background: 'var(--accent-red)', color: '#fff', fontSize: '12px', fontWeight: 900, textDecoration: 'none' }}><ClipboardList size={17} /> View my orders</Link>
          <Link href="/" style={{ display: 'flex', minHeight: '45px', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #e6ded9', borderRadius: '12px', color: '#555', fontSize: '11px', fontWeight: 800, textDecoration: 'none' }}><Home size={16} /> Back to menu</Link>
        </div>
      </section>
    </main>
  );
}
