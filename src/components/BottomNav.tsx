"use client";

import Link from "next/link";
import { Home, Menu, Flame, Phone, ShoppingBag } from "lucide-react";
import React from 'react';
import { useCart } from "../context/CartContext";
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

export default function BottomNav() {
  const { items, setIsCartOpen } = useCart();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { name: "Home", href: "/", icon: Home, active: true },
    { name: "Signatures", href: "/#signatures", icon: Flame },
    { name: "Mandi", href: "/#mandi", icon: Menu },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // GSAP micro-interaction on the target element
    const iconContainer = e.currentTarget.querySelector('.nav-icon');
    if (iconContainer) {
      gsap.fromTo(iconContainer, 
        { scale: 0.8 }, 
        { scale: 1, duration: 0.4, ease: "back.out(2)" }
      );
    }

    // Smooth scroll for hash links
    if (href.startsWith('/#')) {
      e.preventDefault();
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        // Offset for the sticky header (approx 140px)
        gsap.to(window, { duration: 0.8, scrollTo: { y: element, offsetY: 140 }, ease: "power3.inOut" });
      }
    }
  };

  const handleCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const iconContainer = e.currentTarget.querySelector('.nav-icon');
    if (iconContainer) {
      gsap.fromTo(iconContainer, 
        { scale: 0.8, y: -5 }, 
        { scale: 1, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
      );
    }
    setIsCartOpen(true);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderTop: '1px solid var(--border-subtle)',
      zIndex: 50,
      padding: '10px 16px calc(10px + env(safe-area-inset-bottom))',
      boxShadow: '0 -8px 30px rgba(33,33,33,0.08)',
      backdropFilter: 'blur(18px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '720px', margin: '0 auto' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                width: '20%',
                color: isActive ? 'var(--accent-red)' : '#929292',
                textDecoration: 'none'
              }}
            >
              <div className="nav-icon">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
              <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {item.name}
              </span>
            </Link>
          );
        })}
        
        {/* Cart Button */}
        <button
          onClick={handleCartClick}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            width: '20%',
            color: '#929292',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <div className="nav-icon" style={{ position: 'relative' }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: 'var(--accent-red)',
                color: 'white',
                fontSize: '8px',
                fontWeight: 'bold',
                width: '16px',
                height: '16px',
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
          <span style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Cart
          </span>
        </button>
      </div>
    </div>
  );
}
