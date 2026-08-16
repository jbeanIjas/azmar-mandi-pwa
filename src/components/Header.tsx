"use client";

import { ChevronDown, MapPin, ShoppingBag, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';

export default function Header({ phone }: { phone?: string }) {
  const { locationStatus, isDeliveryAvailable, locationName, locationAddress } = useLocation();
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="app-header">
        <Link className="header-brand" href="/" aria-label="Azmar Mandi home">
          <Image src="/brand/azmar-mark.png" alt="" width={44} height={44} priority />
          <span><strong>AZMAR</strong><small>MANDI</small></span>
        </Link>
        <Link className="location-trigger" href="/location">
          <span className="location-icon"><MapPin size={18} /></span>
          <span className="location-copy">
            <small>{locationStatus === 'loading' ? 'Finding your location' : 'Deliver to'}</small>
            <strong>{locationName}<ChevronDown size={14} /></strong>
            <span>{locationAddress}</span>
          </span>
        </Link>

        <Link className="header-cart" href="/cart" aria-label={`Open cart with ${itemCount} items`}>
          <ShoppingBag size={20} />
          {itemCount > 0 && <span>{itemCount}</span>}
        </Link>
        <Link className="profile-avatar" href={phone ? '/account/orders' : '/account/login'} aria-label={phone ? 'Open account' : 'Log in or sign up'}><UserRound size={18} /></Link>
      </header>

      {locationStatus === 'success' && (
        <div className={`delivery-pill ${isDeliveryAvailable ? 'delivery-pill--available' : 'delivery-pill--unavailable'}`}>
          {isDeliveryAvailable ? 'Delivery available in your area' : 'Outside our current delivery area'}
        </div>
      )}
    </>
  );
}
