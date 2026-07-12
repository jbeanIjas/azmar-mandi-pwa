"use client";

import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X, Bookmark, Share2 } from 'lucide-react';
import { MenuItem } from '@prisma/client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  item: MenuItem;
  onClose: () => void;
}

export default function ProductModal({ item, onClose }: ProductModalProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('full');

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out"
    });
    gsap.from(modalRef.current, {
      y: "100%",
      duration: 0.4,
      ease: "power3.out"
    });
  }, { scope: containerRef });

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    });
    gsap.to(modalRef.current, {
      y: "100%",
      duration: 0.3,
      ease: "power3.in",
      onComplete: onClose
    });
  };

  // Parse price
  const basePrice = parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0;
  
  // Calculate total price based on option and quantity
  let optionPrice = basePrice;
  if (selectedOption === 'quarter') optionPrice = basePrice * 0.4;
  else if (selectedOption === 'half') optionPrice = basePrice * 0.6;
  
  const totalPrice = Math.round(optionPrice * quantity);

  if (!mounted) return null;

  return createPortal(
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}>
      
      {/* Floating Close Button */}
      <button 
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(30, 30, 30, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          zIndex: 2001,
          cursor: 'pointer'
        }}
      >
        <X size={24} />
      </button>

      <div ref={modalRef} style={{
        background: 'var(--bg-dark)',
        width: '100%',
        height: '85vh',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Scrollable Content */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingBottom: '120px' }}>
          
          {/* Image Header */}
          <div style={{ position: 'relative', width: '100%', height: '280px', padding: '16px' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
              <Image 
                src={item.image} 
                alt={item.name} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
            </div>
          </div>

          {/* Details Section */}
          <div style={{ padding: '0 20px' }}>
            
            {/* Veg/NonVeg Icon (Mocking Non-Veg as per Mandi default) */}
            <div style={{ 
              width: '16px', height: '16px', 
              border: '1px solid #e74c3c', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px', borderRadius: '4px'
            }}>
              <div style={{ width: '8px', height: '8px', background: '#e74c3c', borderRadius: '50%' }} />
            </div>

            {/* Title & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', margin: 0, lineHeight: 1.2 }}>
                {item.name}
              </h1>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                  <Bookmark size={18} />
                </button>
                <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Highly Reordered Tag */}
            {item.tags?.includes('Best Seller') || item.tags?.includes('Signature') ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '24px', height: '4px', background: '#16a34a', borderRadius: '2px' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Highly reordered</span>
              </div>
            ) : null}

            {/* Description */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              {item.description}
            </p>

          </div>

          <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)' }} />

          {/* Quantity Options Section */}
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', margin: '0 0 4px 0' }}>Quantity</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>Required • Select any 1 option</p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { id: 'quarter', label: 'Quarter', price: Math.round(basePrice * 0.4), stock: false },
                { id: 'half', label: 'Half', price: Math.round(basePrice * 0.6), stock: true },
                { id: 'full', label: 'Full', price: basePrice, stock: true },
              ].map(opt => (
                <div 
                  key={opt.id} 
                  onClick={() => opt.stock && setSelectedOption(opt.id)}
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    opacity: opt.stock ? 1 : 0.4,
                    cursor: opt.stock ? 'pointer' : 'not-allowed'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '16px', color: 'white', marginBottom: '4px' }}>{opt.label}</div>
                    {!opt.stock && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Out of stock</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>₹{opt.price}</span>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      border: selectedOption === opt.id ? '6px solid var(--accent-red)' : '2px solid rgba(255,255,255,0.2)',
                      background: 'transparent',
                      transition: 'all 0.2s'
                    }} />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Sticky Bottom Bar */}
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, 
          background: 'var(--bg-dark)', 
          padding: '16px 20px 32px 20px', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: '16px', alignItems: 'center'
        }}>
          
          {/* Quantity Selector */}
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px 16px',
            width: '120px'
          }}>
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', fontSize: '20px', cursor: 'pointer', padding: 0 }}
            >
              -
            </button>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', fontSize: '20px', cursor: 'pointer', padding: 0 }}
            >
              +
            </button>
          </div>

          {/* Add Item Button */}
          <button 
            onClick={() => {
              for(let i=0; i<quantity; i++) {
                addToCart(item);
              }
              handleClose();
            }}
            style={{ 
              flex: 1, 
              background: '#f43f5e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '16px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Add item - ₹{totalPrice}
          </button>
          
        </div>
      </div>
    </div>,
    document.body
  );
}
