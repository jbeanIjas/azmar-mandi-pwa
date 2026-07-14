"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ShoppingBag, X, Plus, Minus, Send, MapPin, Navigation, Banknote, Smartphone } from "lucide-react";
import { useCart } from "../context/CartContext";
import { MAX_DISTANCE_KM, useLocation } from "../context/LocationContext";
import AddressEditor from "./AddressEditor";

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
  const [isAddressEditorOpen, setIsAddressEditorOpen] = React.useState(false);
  const {
    fetchCurrentLocation,
    isDeliveryAvailable,
    locationAddress,
    locationLat,
    locationLng,
    locationName,
    locationStatus,
  } = useLocation();
  const deliveryReady = locationStatus === 'success' && isDeliveryAvailable && locationLat !== null && locationLng !== null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isCartOpen]);

  const handleVerifyLocation = () => {
    fetchCurrentLocation();
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (orderType === 'delivery' && !deliveryReady) return;

    let message = `Hello Azmar Mandi, I would like to order for ${orderType.toUpperCase()}:\n\n`;
    items.forEach((item) => {
      message += `${item.quantity}x ${item.name} - ${item.price}\n`;
    });
    message += `\nTotal: ₹${cartTotal.toFixed(0)}`;
    message += `\nPayment Method: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}`;

    if (orderType === 'delivery' && locationLat !== null && locationLng !== null) {
      message += `\n\nDelivery Address:\n${locationName}, ${locationAddress}`;
      message += `\nMap: https://www.google.com/maps?q=${locationLat},${locationLng}`;
    }

    const whatsappUrl = `https://wa.me/918590109472?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

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
          background: 'var(--accent-red)',
          color: '#fff',
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
              background: 'var(--accent-red)',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '2px solid #fff'
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
          backgroundColor: 'var(--bg-dark)',
          zIndex: 100,
          borderLeft: '1px solid var(--border-subtle)',
          transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(33,33,33,0.14)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.05em', color: '#212121', margin: 0 }}>
            YOUR CART
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
            style={{ background: '#f4f2f2', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'grid', placeItems: 'center', color: '#555', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {items.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999', gap: '16px' }}>
              <ShoppingBag size={48} opacity={0.2} />
              <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Your cart is empty
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                style={{ display: 'flex', gap: '16px', backgroundColor: '#fafafa', padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: '14px' }}
              >
                <div style={{ position: 'relative', width: '80px', height: '80px', backgroundColor: '#f2f2f2', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between', padding: '4px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#212121', margin: 0 }}>
                      {item.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--accent-red)' }}>
                    {item.price}
                  </span>
                  
                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(189,29,75,0.2)', backgroundColor: 'transparent', color: 'var(--accent-red)', cursor: 'pointer' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', width: '16px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(189,29,75,0.2)', backgroundColor: 'transparent', color: 'var(--accent-red)', cursor: 'pointer' }}
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
        <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>
              Total
            </span>
            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-red)' }}>
              ₹{cartTotal.toFixed(0)}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => setOrderType('pickup')}
              style={{ flex: 1, padding: '8px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: orderType === 'pickup' ? 'rgba(189,29,75,0.1)' : 'transparent',
                border: orderType === 'pickup' ? '1px solid var(--accent-red)' : '1px solid rgba(189,29,75,0.2)',
                color: orderType === 'pickup' ? 'var(--accent-red)' : '#777'
              }}
            >
              Pickup
            </button>
            <button
              onClick={() => setOrderType('delivery')}
              style={{ flex: 1, padding: '8px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: orderType === 'delivery' ? 'rgba(189,29,75,0.1)' : 'transparent',
                border: orderType === 'delivery' ? '1px solid var(--accent-red)' : '1px solid rgba(189,29,75,0.2)',
                color: orderType === 'delivery' ? 'var(--accent-red)' : '#777'
              }}
            >
              Delivery
            </button>
          </div>

          {orderType === 'delivery' && (
            <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid rgba(189,29,75,0.18)', borderRadius: '14px', backgroundColor: '#fff8fa', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="var(--accent-red)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: '#444', lineHeight: 1.5, margin: 0 }}>
                  We currently only deliver within a {MAX_DISTANCE_KM}km radius of our restaurant.
                </p>
              </div>
              
              {locationStatus === 'idle' && (
                <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>Choose the exact delivery address on the map or use your current location.</p>
              )}

              {locationStatus === 'loading' && (
                <div style={{ fontSize: '12px', color: 'var(--accent-red)', textAlign: 'center', padding: '8px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Locating...
                </div>
              )}

              {deliveryReady && (
                <div style={{ fontSize: '12px', color: '#4ade80', textAlign: 'center', padding: '8px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Delivery address verified
                </div>
              )}

              {locationStatus === 'success' && !isDeliveryAvailable && (
                <div style={{ fontSize: '11px', color: '#f87171', textAlign: 'center', lineHeight: 1.45 }}>
                  This address is outside our {MAX_DISTANCE_KM}km delivery area. Please choose another address.
                </div>
              )}

              {locationStatus === 'error' && <div style={{ fontSize: '11px', color: '#f87171', textAlign: 'center' }}>We could not access that location. Search for your address on the map instead.</div>}

              {locationStatus === 'success' && (
                <div style={{ padding: '10px', borderRadius: '8px', background: '#fff' }}>
                  <strong style={{ display: 'block', color: '#212121', fontSize: '12px' }}>{locationName}</strong>
                  <span style={{ display: 'block', marginTop: '3px', color: '#666', fontSize: '10px', lineHeight: 1.4 }}>{locationAddress}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setIsAddressEditorOpen(true)} style={{ flex: 1, padding: '9px 6px', border: '1px solid var(--accent-red)', background: 'var(--accent-red)', color: '#fff', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}>
                  Choose on map
                </button>
                <button onClick={handleVerifyLocation} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '9px 6px', border: '1px solid var(--accent-red)', background: '#fff', color: 'var(--accent-red)', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}>
                  <Navigation size={12} /> Current location
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => setPaymentMethod('cod')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: paymentMethod === 'cod' ? 'rgba(189,29,75,0.1)' : 'transparent',
                border: paymentMethod === 'cod' ? '1px solid var(--accent-red)' : '1px solid rgba(189,29,75,0.2)',
                color: paymentMethod === 'cod' ? 'var(--accent-red)' : '#777'
              }}
            >
              <Banknote size={16} />
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cash on Delivery</span>
            </button>
            <button
              onClick={() => setPaymentMethod('upi')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 0', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: paymentMethod === 'upi' ? 'rgba(189,29,75,0.1)' : 'transparent',
                border: paymentMethod === 'upi' ? '1px solid var(--accent-red)' : '1px solid rgba(189,29,75,0.2)',
                color: paymentMethod === 'upi' ? 'var(--accent-red)' : '#777'
              }}
            >
              <Smartphone size={16} />
              <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UPI</span>
            </button>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || (orderType === 'delivery' && !deliveryReady)}
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
              cursor: (items.length === 0 || (orderType === 'delivery' && !deliveryReady)) ? 'not-allowed' : 'pointer',
              background: (items.length === 0 || (orderType === 'delivery' && !deliveryReady)) ? '#374151' : 'var(--accent-red)',
              color: (items.length === 0 || (orderType === 'delivery' && !deliveryReady)) ? '#6b7280' : '#fff',
            }}
          >
            <span>Checkout via WhatsApp</span>
            <Send size={16} />
          </button>
        </div>
      </div>
      {isAddressEditorOpen && <AddressEditor onClose={() => setIsAddressEditorOpen(false)} />}
    </>
  );
}
