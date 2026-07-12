"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { ShoppingBag, X, Plus, Minus, Send, MapPin, Navigation, Banknote, Smartphone } from "lucide-react";
import { useCart } from "../context/CartContext";

const RESTAURANT_LAT = 8.475091650738907; // Trivandrum, Kerala
const RESTAURANT_LNG = 76.94724385255535; // Trivandrum, Kerala
const MAX_DISTANCE_KM = 5;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default function Cart() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();
  
  const [orderType, setOrderType] = React.useState<'delivery' | 'pickup'>('pickup');
  const [paymentMethod, setPaymentMethod] = React.useState<'cod' | 'upi'>('cod');
  const [locationStatus, setLocationStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationError, setLocationError] = React.useState('');
  const [userLocation, setUserLocation] = React.useState<{lat: number, lng: number} | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isCartOpen]);

  const handleVerifyLocation = () => {
    setLocationStatus('loading');
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        const distance = calculateDistance(latitude, longitude, RESTAURANT_LAT, RESTAURANT_LNG);
        
        if (distance <= MAX_DISTANCE_KM) {
          setLocationStatus('success');
        } else {
          setLocationStatus('error');
          setLocationError(`Sorry, you are ${distance.toFixed(1)}km away. We only deliver within ${MAX_DISTANCE_KM}km.`);
        }
      },
      (error) => {
        setLocationStatus('error');
        setLocationError('Unable to retrieve your location. Please allow location access in your browser settings.');
      }
    );
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (orderType === 'delivery' && locationStatus !== 'success') return;

    let message = `Hello Azmar Mandi, I would like to order for ${orderType.toUpperCase()}:\n\n`;
    items.forEach((item) => {
      message += `${item.quantity}x ${item.name} - ${item.price}\n`;
    });
    message += `\nTotal: ₹${cartTotal.toFixed(0)}`;
    message += `\nPayment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}`;

    if (orderType === 'delivery' && userLocation) {
      message += `\n\nDelivery Location:\nhttps://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
    }

    const whatsappUrl = `https://wa.me/918590109472?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Floating Cart Button (Desktop) */}
      <button
        onClick={() => setIsCartOpen(true)}
        style={{
          display: 'none', // We use bottom nav on mobile
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 40,
          background: 'linear-gradient(135deg, #f4d068 0%, #c19a3b 100%)',
          color: '#121215',
          padding: '16px',
          borderRadius: '50%',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingBag size={24} />
          {totalItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#dc2626',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '2px solid #121215'
            }}>
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Cart Drawer Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          cursor: 'pointer',
          display: isCartOpen ? 'block' : 'none',
          opacity: isCartOpen ? 1 : 0,
          transition: 'opacity 0.3s'
        }}
      />

      {/* Cart Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '450px',
          height: '100vh',
          backgroundColor: '#121215',
          zIndex: 100,
          borderLeft: '1px solid rgba(244,208,104,0.2)',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid rgba(244,208,104,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.05em', color: 'white', margin: 0 }}>
            YOUR CART
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {items.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', gap: '16px' }}>
              <ShoppingBag size={48} opacity={0.2} />
              <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your cart is empty
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{ display: 'flex', gap: '16px', backgroundColor: '#0a0a0c', padding: '12px', border: '1px solid rgba(244,208,104,0.1)' }}
              >
                <div style={{ position: 'relative', width: '80px', height: '80px', backgroundColor: '#121215', border: '1px solid rgba(244,208,104,0.05)', flexShrink: 0 }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-gold)' }}>
                    {item.price}
                  </span>
                  
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(244,208,104,0.2)', backgroundColor: 'transparent', color: 'var(--accent-gold)', cursor: 'pointer' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', width: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(244,208,104,0.2)', backgroundColor: 'transparent', color: 'var(--accent-gold)', cursor: 'pointer' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(244,208,104,0.1)', padding: '24px', backgroundColor: '#121215' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.7)' }}>
              Total
            </span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-gold)' }}>
              ₹{cartTotal.toFixed(0)}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setOrderType('pickup')}
              style={{ flex: 1, padding: '8px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: orderType === 'pickup' ? 'rgba(244,208,104,0.1)' : 'transparent',
                border: orderType === 'pickup' ? '1px solid var(--accent-gold)' : '1px solid rgba(244,208,104,0.2)',
                color: orderType === 'pickup' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)'
              }}
            >
              Pickup
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              style={{ flex: 1, padding: '8px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: orderType === 'delivery' ? 'rgba(244,208,104,0.1)' : 'transparent',
                border: orderType === 'delivery' ? '1px solid var(--accent-gold)' : '1px solid rgba(244,208,104,0.2)',
                color: orderType === 'delivery' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)'
              }}
            >
              Delivery
            </button>
          </div>

          {orderType === 'delivery' && (
            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid rgba(244,208,104,0.2)', backgroundColor: '#0a0a0c', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="var(--accent-gold)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
                  We currently only deliver within a {MAX_DISTANCE_KM}km radius of our restaurant.
                </p>
              </div>
              
              {locationStatus === 'idle' && (
                <button
                  onClick={handleVerifyLocation}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 0', border: '1px solid var(--accent-gold)', background: 'transparent', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}
                >
                  <Navigation size={12} />
                  <span>Verify My Location</span>
                </button>
              )}

              {locationStatus === 'loading' && (
                <div style={{ fontSize: '12px', color: 'var(--accent-gold)', textAlign: 'center', padding: '8px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Locating...
                </div>
              )}

              {locationStatus === 'success' && (
                <div style={{ fontSize: '12px', color: '#4ade80', textAlign: 'center', padding: '8px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Location Verified! Proceed to checkout.
                </div>
              )}

              {locationStatus === 'error' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#f87171', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold', padding: '0 8px' }}>
                    {locationError}
                  </div>
                  <button
                    onClick={handleVerifyLocation}
                    style={{ width: '100%', fontSize: '10px', textDecoration: 'underline', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => setPaymentMethod('cod')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: paymentMethod === 'cod' ? 'rgba(244,208,104,0.1)' : 'transparent',
                border: paymentMethod === 'cod' ? '1px solid var(--accent-gold)' : '1px solid rgba(244,208,104,0.2)',
                color: paymentMethod === 'cod' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)'
              }}
            >
              <Banknote size={16} />
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cash on Delivery</span>
            </button>
            <button
              onClick={() => setPaymentMethod('upi')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: paymentMethod === 'upi' ? 'rgba(244,208,104,0.1)' : 'transparent',
                border: paymentMethod === 'upi' ? '1px solid var(--accent-gold)' : '1px solid rgba(244,208,104,0.2)',
                color: paymentMethod === 'upi' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)'
              }}
            >
              <Smartphone size={16} />
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UPI</span>
            </button>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || (orderType === 'delivery' && locationStatus !== 'success')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              border: 'none',
              cursor: (items.length === 0 || (orderType === 'delivery' && locationStatus !== 'success')) ? 'not-allowed' : 'pointer',
              background: (items.length === 0 || (orderType === 'delivery' && locationStatus !== 'success')) ? '#374151' : 'linear-gradient(135deg, #f4d068 0%, #c19a3b 100%)',
              color: (items.length === 0 || (orderType === 'delivery' && locationStatus !== 'success')) ? '#6b7280' : '#121215',
            }}
          >
            <span>Checkout via WhatsApp</span>
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
