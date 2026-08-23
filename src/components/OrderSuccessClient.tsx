"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ClipboardList, Home, AlertCircle, Loader2, CreditCard } from 'lucide-react';

export default function OrderSuccessClient({ orderNumber }: { orderNumber?: string }) {
  const [loading, setLoading] = useState(Boolean(orderNumber));
  const [paymentStatus, setPaymentStatus] = useState<string>('VERIFYING');

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function verifyPayment() {
      try {
        const res = await fetch('/api/cashfree/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderNumber }),
        });
        const data = await res.json().catch(() => ({}));
        if (isMounted) {
          if (data.paymentStatus) {
            setPaymentStatus(data.paymentStatus);
          } else {
            setPaymentStatus('PLACED');
          }
        }
      } catch (err) {
        console.error('Payment status check failed:', err);
        if (isMounted) setPaymentStatus('UNKNOWN');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [orderNumber]);

  return (
    <main style={{ display: 'grid', minHeight: '100vh', padding: '28px 18px 120px', placeItems: 'center', background: 'radial-gradient(circle at top, rgba(var(--accent-red-rgb),.13), transparent 44%), #f7f3f0', color: '#212121' }}>
      <section style={{ width: 'min(100%, 520px)', padding: '38px 24px', border: '1px solid #eadfda', borderRadius: '26px', background: '#fff', boxShadow: '0 24px 70px rgba(50,30,25,.11)', textAlign: 'center' }}>
        
        {paymentStatus === 'FAILED' ? (
          <span style={{ display: 'grid', width: '72px', height: '72px', margin: '0 auto 20px', placeItems: 'center', borderRadius: '50%', background: '#fee2e2', color: '#dc2626' }}>
            <AlertCircle size={38} />
          </span>
        ) : (
          <span style={{ display: 'grid', width: '72px', height: '72px', margin: '0 auto 20px', placeItems: 'center', borderRadius: '50%', background: 'rgba(var(--accent-red-rgb),.1)', color: 'var(--accent-red)' }}>
            <CheckCircle2 size={38} />
          </span>
        )}

        <small style={{ color: paymentStatus === 'FAILED' ? '#dc2626' : 'var(--accent-red)', fontSize: '9px', fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase' }}>
          {paymentStatus === 'FAILED' ? 'Payment Unsuccessful' : 'Order Placed'}
        </small>
        
        <h1 style={{ margin: '8px 0 10px', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(32px, 8vw, 44px)', lineHeight: 1 }}>
          {paymentStatus === 'FAILED' ? 'Payment Failed' : 'Thank you!'}
        </h1>

        <p style={{ margin: '0 auto', color: '#777', fontSize: '13px', lineHeight: 1.65 }}>
          {paymentStatus === 'FAILED'
            ? 'Your payment could not be processed. You can retry paying from your orders page.'
            : 'Your order has been received by Azmar Mandi. We’ll contact you on WhatsApp for updates.'}
        </p>

        {orderNumber && (
          <div style={{ margin: '22px 0', padding: '16px', borderRadius: '14px', background: '#f8f4f2', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <small style={{ color: '#999', fontSize: '8px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}>Order Number</small>
            <strong style={{ color: 'var(--accent-red)', fontSize: '18px' }}>{orderNumber}</strong>

            {/* Payment Status Badge */}
            <div style={{ marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: paymentStatus === 'PAID' ? '#dcfce7' : (paymentStatus === 'FAILED' ? '#fee2e2' : '#fef3c7'), color: paymentStatus === 'PAID' ? '#15803d' : (paymentStatus === 'FAILED' ? '#b91c1c' : '#b45309') }}>
              {loading ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span style={{ fontSize: '10px', fontWeight: 800 }}>Verifying Payment…</span>
                </>
              ) : (
                <>
                  <CreditCard size={12} />
                  <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>
                    Payment: {paymentStatus}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '9px' }}>
          <Link href="/account/orders" style={{ display: 'flex', minHeight: '47px', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px', background: 'var(--accent-red)', color: '#fff', fontSize: '12px', fontWeight: 900, textDecoration: 'none' }}>
            <ClipboardList size={17} /> View my orders
          </Link>
          <Link href="/" style={{ display: 'flex', minHeight: '45px', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #e6ded9', borderRadius: '12px', color: '#555', fontSize: '11px', fontWeight: 800, textDecoration: 'none' }}>
            <Home size={16} /> Back to menu
          </Link>
        </div>
      </section>
    </main>
  );
}
