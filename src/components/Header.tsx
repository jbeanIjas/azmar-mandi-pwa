"use client";

import { MapPin, Wallet, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import LocationSelector from './LocationSelector';
import AddressEditor from './AddressEditor';

export default function Header() {
  const { locationStatus, isDeliveryAvailable, locationName, locationAddress } = useLocation();
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);

  return (
    <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', gap: '12px' }}>
      <div 
        style={{ display: 'flex', flexDirection: 'column', flex: 1, cursor: 'pointer', minWidth: 0 }}
        onClick={() => setIsLocationSelectorOpen(true)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={18} color="white" style={{ flexShrink: 0 }} />
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', color: 'white', overflow: 'hidden' }}>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{locationName}</span>
            <span style={{ fontSize: '12px', flexShrink: 0 }}>▼</span>
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
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={16} color="white" />
        </div>
        <div style={{ background: '#1c4c96', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          AM
        </div>
      </div>
    </div>
      
      {isLocationSelectorOpen && (
        <LocationSelector 
          onClose={() => setIsLocationSelectorOpen(false)}
          onAddAddress={() => {
            setIsLocationSelectorOpen(false);
            setIsAddressEditorOpen(true);
          }}
        />
      )}
      
      {isAddressEditorOpen && (
        <AddressEditor 
          onClose={() => setIsAddressEditorOpen(false)}
        />
      )}
    </>
  );
}
