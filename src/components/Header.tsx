"use client";

import { MapPin, Wallet, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const RESTAURANT_LAT = 8.475091650738907; // Trivandrum, Kerala
const RESTAURANT_LNG = 76.94724385255535; // Trivandrum, Kerala
const MAX_DISTANCE_KM = 5;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Header() {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean>(false);
  const [locationName, setLocationName] = useState('Manacaud');
  const [locationAddress, setLocationAddress] = useState('Thiruvananthapuram, Kerala,...');
  
  useEffect(() => {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, RESTAURANT_LAT, RESTAURANT_LNG);
        setIsDeliveryAvailable(distance <= MAX_DISTANCE_KM);
        
        // Reverse geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const name = data.address.suburb || data.address.neighbourhood || data.address.city || 'Current Location';
            const address = [data.address.city || data.address.town || data.address.county, data.address.state].filter(Boolean).join(', ');
            setLocationName(name);
            setLocationAddress(address || 'Location found');
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        }

        setLocationStatus('success');
      },
      (error) => {
        console.error("Location error", error);
        setLocationStatus('error');
      }
    );
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={18} color="white" />
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', color: 'white' }}>
            {locationName} <span style={{ fontSize: '12px' }}>▼</span>
          </h2>
        </div>
        
        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {locationStatus === 'loading' ? 'Checking location...' : locationAddress}
        </p>
        
        {locationStatus === 'success' && (
          <div style={{ 
            marginTop: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            background: isDeliveryAvailable ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
            border: `1px solid ${isDeliveryAvailable ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)'}`,
            padding: '2px 6px',
            borderRadius: '4px',
            width: 'fit-content'
          }}>
            <p style={{ 
              fontSize: '10px', 
              fontWeight: 'bold',
              color: isDeliveryAvailable ? '#4ade80' : '#f87171', 
              margin: 0
            }}>
              {isDeliveryAvailable ? '✓ Delivery Available (Within 5km)' : '✗ Delivery Not Available (Too far)'}
            </p>
          </div>
        )}

        {locationStatus === 'error' && (
          <p style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', margin: 0, marginTop: '4px' }}>
            Location services disabled
          </p>
        )}
        
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--accent-gold)', borderRadius: '20px', padding: '4px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: 'black', lineHeight: 1 }}>GOLD</span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'black', lineHeight: 1 }}>₹1</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={16} color="white" />
        </div>
        <div style={{ background: '#1c4c96', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          I
        </div>
      </div>
    </div>
  );
}
