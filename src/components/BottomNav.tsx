"use client";

import Link from "next/link";
import { Home, Menu, Flame, Phone, ShoppingBag } from "lucide-react";
import React from 'react';
import { useCart } from "../context/CartContext";

export default function BottomNav() {
  const { items, setIsCartOpen } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: "Home", href: "/", icon: Home, active: true },
    { name: "Signatures", href: "/#signatures", icon: Flame },
    { name: "Mandi", href: "/#mandi", icon: Menu },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: '#121215',
      borderTop: '1px solid rgba(244, 208, 104, 0.2)',
      zIndex: 50,
      padding: '12px 16px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                width: '20%',
                color: isActive ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none'
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            width: '20%',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <div style={{ position: 'relative' }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#dc2626',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '1px solid #121215'
              }}>
                {totalItems}
              </span>
            )}
          </div>
          <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Cart
          </span>
        </button>
      </div>
    </div>
  );
}
