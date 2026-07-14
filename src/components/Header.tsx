"use client";

import { ChevronDown, MapPin, ShoppingBag } from 'lucide-react';
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import LocationSelector from './LocationSelector';
import AddressEditor from './AddressEditor';

export default function Header() {
  const { locationStatus, isDeliveryAvailable, locationName, locationAddress } = useLocation();
  const { items, setIsCartOpen } = useCart();
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);
  const [isAddressEditorOpen, setIsAddressEditorOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="app-header">
        <button className="location-trigger" onClick={() => setIsLocationSelectorOpen(true)}>
          <span className="location-icon"><MapPin size={18} /></span>
          <span className="location-copy">
            <small>{locationStatus === 'loading' ? 'Finding your location' : 'Deliver to'}</small>
            <strong>{locationName}<ChevronDown size={14} /></strong>
            <span>{locationAddress}</span>
          </span>
        </button>

        <button className="header-cart" onClick={() => setIsCartOpen(true)} aria-label={`Open cart with ${itemCount} items`}>
          <ShoppingBag size={20} />
          {itemCount > 0 && <span>{itemCount}</span>}
        </button>
        <div className="profile-avatar" aria-label="Azmar Mandi profile">AM</div>
      </header>

      {locationStatus === 'success' && (
        <div className={`delivery-pill ${isDeliveryAvailable ? 'delivery-pill--available' : 'delivery-pill--unavailable'}`}>
          {isDeliveryAvailable ? 'Delivery available in your area' : 'Outside our current delivery area'}
        </div>
      )}

      {isLocationSelectorOpen && (
        <LocationSelector
          onClose={() => setIsLocationSelectorOpen(false)}
          onAddAddress={(searchQuery = '') => {
            setIsLocationSelectorOpen(false);
            setLocationSearch(searchQuery);
            setIsAddressEditorOpen(true);
          }}
        />
      )}
      {isAddressEditorOpen && <AddressEditor onClose={() => setIsAddressEditorOpen(false)} initialSearch={locationSearch} />}
    </>
  );
}
