"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Crosshair, MapPin, Phone, Search, ChevronRight } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

interface AddressEditorProps {
  onClose: () => void;
}

export default function AddressEditor({ onClose }: AddressEditorProps) {
  const [mounted, setMounted] = useState(false);
  const { setLocationManually, addSavedAddress, fetchCurrentLocation } = useLocation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [addressDetails, setAddressDetails] = useState('');
  const [name, setName] = useState('Ijas');
  const [phone, setPhone] = useState('8590109472');

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPinBouncing, setIsPinBouncing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    setIsPinBouncing(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsPinBouncing(false), 300);
  };

  const handleSave = () => {
    const fullAddress = addressDetails ? `Manacaud, Thiruvananthapuram, Kerala, India (${addressDetails})` : 'Manacaud, Thiruvananthapuram, Kerala, India';
    const title = addressDetails || 'Home';
    const lat = 8.475091650738907;
    const lng = 76.94724385255535;

    addSavedAddress({ name, title, address: fullAddress, phone, lat, lng });
    setLocationManually(title, fullAddress, lat, lng);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#1a1d24',
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none'
    }}>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      
      {/* Mock Map Background (Static blocks to simulate streets) */}
      <div 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div style={{ position: 'absolute', width: '400%', height: '400%', top: '-150%', left: '-150%', background: '#1c2230', transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`, transition: isDragging ? 'none' : 'transform 0.1s ease-out' }}>
          {/* Simple visual mock of the map blocks in the screenshot */}
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{ 
              position: 'absolute', 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`, 
              width: `${Math.random() * 150 + 50}px`, 
              height: `${Math.random() * 150 + 50}px`, 
              background: i % 2 === 0 ? '#252b3d' : '#2a3246', 
              transform: `rotate(${Math.random() * 90}deg)`, 
              borderRadius: '8px',
              opacity: 0.8
            }} />
          ))}
          
          {/* Map Labels Mock */}
          <div style={{ position: 'absolute', top: '45%', left: '48%', color: '#8892b0', fontSize: '12px', fontWeight: 'bold' }}>Sut Mother And Child Hospital</div>
          <div style={{ position: 'absolute', top: '25%', left: '55%', color: '#8892b0', fontSize: '12px', fontWeight: 'bold' }}>Medical Mission Hospital</div>
          <div style={{ position: 'absolute', top: '65%', left: '40%', color: '#8892b0', fontSize: '12px', fontWeight: 'bold' }}>Manacaud Post Office</div>
        </div>
      </div>

      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px', zIndex: 50, position: 'relative', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)', pointerEvents: 'none' }}>
        <button 
          onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'white' }}>Select delivery location</h1>
      </div>

      {/* Map Pin Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, position: 'relative', marginTop: '-100px' }}>
        
        {/* Pin */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: isPinBouncing ? 'bounce 0.4s infinite' : 'none', transition: 'all 0.2s' }}>
          <div style={{ background: 'var(--accent-red)', width: '32px', height: '32px', borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.4)' }}>
            <div style={{ width: '12px', height: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '50%' }} />
          </div>
          <div style={{ width: '8px', height: '4px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', marginTop: '4px' }} />
        </div>
        
        {/* Use Current Location Button */}
        <button 
          onClick={() => {
            fetchCurrentLocation();
            onClose();
          }}
          style={{ position: 'absolute', bottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-red)', padding: '10px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <Crosshair size={18} />
          Use current location
        </button>
      </div>

      {/* Bottom Drawer Form */}
      <div ref={drawerRef} style={{ 
        background: 'var(--bg-dark)', 
        borderTopLeftRadius: '24px', 
        borderTopRightRadius: '24px', 
        padding: '24px', 
        zIndex: 10
      }}>
        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 24px' }} />
        
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Delivery details</div>
        
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={18} color="var(--accent-red)" />
          </div>
          <div style={{ flex: 1, fontSize: '16px', color: 'white', fontWeight: '500', lineHeight: '1.4' }}>
            Manacaud, Thiruvananthapuram, Kerala, India
          </div>
          <ChevronRight />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px', padding: '0 16px' }}>
          <input 
            type="text" 
            placeholder="Address details*" 
            value={addressDetails}
            onChange={(e) => setAddressDetails(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', padding: '16px 0' }}
          />
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '-16px', marginBottom: '24px' }}>
          E.g. Floor, House no.
        </div>

        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Receiver details for this address</div>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</div>
            <input 
              type="text" 
              placeholder="e.g. Ijas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', fontWeight: '500' }}
            />
          </div>

          <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone number</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} color="var(--text-secondary)" />
              <input 
                type="text" 
                placeholder="8590109472"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', fontWeight: '500' }}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          style={{ width: '100%', background: 'var(--accent-red)', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Save address
        </button>

      </div>
    </div>,
    document.body
  );
}


