"use client";

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Crosshair, Plus, Home, MapPin } from 'lucide-react';
import { useLocation, RESTAURANT_LAT, RESTAURANT_LNG } from '../context/LocationContext';

interface LocationSelectorProps {
  onClose: () => void;
  onAddAddress: () => void;
}

export default function LocationSelector({ onClose, onAddAddress }: LocationSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const { fetchCurrentLocation, locationStatus, locationAddress, locationName, setLocationManually, savedAddresses } = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      backdropFilter: 'blur(4px)'
    }}>
      <div ref={modalRef} style={{
        background: 'var(--bg-dark)',
        width: '100%',
        height: '90vh',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        overflowY: 'auto'
      }}>
      
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}
          >
            <ChevronDown size={24} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>Select a location</h1>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 16px', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search for area, street name..." 
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', width: '100%' }}
            />
          </div>
        </div>

        {/* Primary Actions */}
        <div style={{ padding: '0 16px', marginBottom: '32px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            
            <div 
              onClick={() => {
                fetchCurrentLocation();
                onClose();
              }}
              style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
            >
              <Crosshair size={20} color="var(--accent-red)" style={{ marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--accent-red)', marginBottom: '4px' }}>
                  Use current location
                </div>
                {locationStatus === 'loading' ? (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Fetching location...</div>
                ) : (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {locationStatus === 'success' ? `${locationName}, ${locationAddress}` : 'Enable location services'}
                  </div>
                )}
              </div>
              <ChevronDown size={20} color="var(--text-secondary)" style={{ transform: 'rotate(-90deg)' }} />
            </div>

            <div 
              onClick={onAddAddress}
              style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
            >
              <Plus size={20} color="var(--accent-red)" />
              <div style={{ flex: 1, fontSize: '16px', fontWeight: '500', color: 'var(--accent-red)' }}>
                Add Address
              </div>
              <ChevronDown size={20} color="var(--text-secondary)" style={{ transform: 'rotate(-90deg)' }} />
            </div>

          </div>
        </div>

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div style={{ padding: '0 16px', marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '16px' }}>SAVED ADDRESSES</div>
            
            {savedAddresses.map(addr => (
              <div 
                key={addr.id}
                onClick={() => {
                  setLocationManually(addr.title, addr.address, addr.lat, addr.lng);
                  onClose();
                }}
                style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', marginBottom: '12px' }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Home size={20} color="white" />
                    {/* Mock distance for UI */}
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>5.4 km</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{addr.title}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '8px' }}>
                      {addr.address}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Phone number: {addr.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nearby Locations */}
        <div style={{ padding: '0 16px', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '16px' }}>NEARBY LOCATIONS</div>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
            
            {[
              { name: 'Sut Mother And Child Hospital', dist: '44 m', addr: 'Manacaud, Thiruvananthapuram, Kerala' },
              { name: 'Medical Mission Hospital', dist: '116 m', addr: 'Manacaud, Thiruvananthapuram, Kerala' },
              { name: 'Manacaud Sastha Kovil', dist: '135 m', addr: 'Manacaud, Thiruvananthapuram' },
              { name: 'Manacaud Post Office', dist: '265 m', addr: 'Manacaud, Thiruvananthapuram' }
            ].map((loc, i, arr) => (
              <div 
                key={loc.name}
                onClick={() => {
                  setLocationManually(loc.name, loc.addr, RESTAURANT_LAT, RESTAURANT_LNG); // Mock coords
                  onClose();
                }}
                style={{ 
                  padding: '16px', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '16px', 
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '32px' }}>
                  <MapPin size={20} color="white" />
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{loc.dist}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: 'white', marginBottom: '4px' }}>{loc.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{loc.addr}</div>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
