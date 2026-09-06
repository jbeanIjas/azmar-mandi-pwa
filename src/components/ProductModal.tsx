"use client";

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ArrowRight, Bookmark, Check, Share2, ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { MenuItem } from '@prisma/client';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  item: MenuItem;
  onClose: () => void;
  pageMode?: boolean;
}

function galleryFromSpecs(specs: unknown) {
  if (!specs) return [];
  try {
    const parsed = typeof specs === 'string' ? JSON.parse(specs) : specs;
    if (parsed && typeof parsed === 'object' && 'gallery' in parsed && Array.isArray(parsed.gallery)) {
      return parsed.gallery.filter((image: unknown): image is string => typeof image === 'string' && image.trim().length > 0);
    }
  } catch { /* Invalid legacy specs should not break the product page. */ }
  return [];
}

export default function ProductModal({ item, onClose, pageMode = false }: ProductModalProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();
  
  const quantity = 1;
  const [selectedOption, setSelectedOption] = useState('full');
  const [selectedImage, setSelectedImage] = useState(item.image);
  const [imageAspectRatio, setImageAspectRatio] = useState(4 / 3);
  const [showAddedConfirmation, setShowAddedConfirmation] = useState(false);
  const galleryImages = Array.from(new Set([item.image, ...galleryFromSpecs(item.specs)]));

  useGSAP(() => {
    if (pageMode) return;
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

  useGSAP(() => {
    if (!showAddedConfirmation || !confirmationRef.current) return;
    const timeline = gsap.timeline();
    timeline
      .fromTo(confirmationRef.current, { y: 36, scale: 0.94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.6)' })
      .fromTo('.added-check-ring', { scale: 0, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.22')
      .fromTo('.added-product-preview', { x: -18, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.18');
  }, { scope: modalRef, dependencies: [showAddedConfirmation] });

  const handleClose = () => {
    if (pageMode) {
      onClose();
      return;
    }
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

  const content = (
    <div ref={containerRef} style={{
      position: pageMode ? 'relative' : 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: pageMode ? 'var(--bg-darker)' : 'rgba(0,0,0,0.7)',
      backdropFilter: pageMode ? undefined : 'blur(4px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: pageMode ? 'stretch' : 'flex-end',
      justifyContent: 'center'
    }}>
      
      {/* Floating Close Button */}
      <button 
        onClick={handleClose}
        style={{
          position: 'fixed',
          top: 'calc(16px + env(safe-area-inset-top))',
          left: '16px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: '#fff',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#212121',
          zIndex: 2001,
          cursor: 'pointer'
        }}
      >
        <X size={24} />
      </button>

      <div ref={modalRef} style={{
        background: 'var(--bg-dark)',
        width: '100%',
        minHeight: pageMode ? 0 : undefined,
        height: pageMode ? 'calc(100dvh - env(safe-area-inset-top))' : '85vh',
        borderTopLeftRadius: pageMode ? 0 : '24px',
        borderTopRightRadius: pageMode ? 0 : '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: pageMode ? 'none' : '0 -10px 40px rgba(33,33,33,0.16)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Scrollable Content */}
        <div className="hide-scrollbar" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: pageMode ? '24px' : '120px' }}>
          
          {/* Image Header */}
          <div style={{ width: '100%', padding: '16px 16px 10px' }}>
            <div style={{ position: 'relative', width: '100%', aspectRatio: imageAspectRatio, borderRadius: '16px', overflow: 'hidden', background: '#f3f3f1' }}>
              <Image 
                src={selectedImage}
                alt={item.name} 
                fill
                sizes="(max-width: 768px) 100vw, 720px"
                style={{ objectFit: 'contain' }}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  if (naturalWidth && naturalHeight) setImageAspectRatio(naturalWidth / naturalHeight);
                }}
              />
            </div>

            <div aria-label="Product gallery" style={{ display: 'flex', gap: '10px', paddingTop: '12px', overflowX: 'auto' }} className="hide-scrollbar">
              {galleryImages.map((image, index) => {
                const selected = image === selectedImage;
                return (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    aria-label={`View ${item.name} image ${index + 1}`}
                    aria-pressed={selected}
                    onClick={() => { setSelectedImage(image); setImageAspectRatio(4 / 3); }}
                    style={{ position: 'relative', width: '64px', height: '64px', padding: 0, flex: '0 0 64px', overflow: 'hidden', border: selected ? '2px solid var(--accent-red)' : '1px solid var(--border-subtle)', borderRadius: '11px', background: '#f3f3f1', cursor: 'pointer', boxShadow: selected ? '0 0 0 2px rgba(var(--accent-red-rgb),.12)' : 'none' }}
                  >
                    <Image src={image} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} />
                  </button>
                );
              })}
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
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#212121', margin: 0, lineHeight: 1.2 }}>
                {item.name}
              </h1>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button aria-label="Save item" style={{ background: '#f4f2f2', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#212121', cursor: 'pointer' }}>
                  <Bookmark size={18} />
                </button>
                <button aria-label="Share item" style={{ background: '#f4f2f2', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#212121', cursor: 'pointer' }}>
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

          <div style={{ height: '8px', background: '#f7f6f5' }} />

          {/* Quantity Options Section */}
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#212121', margin: '0 0 4px 0' }}>Quantity</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>Required • Select any 1 option</p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { id: 'full', label: 'Full', price: basePrice, stock: true },
                { id: 'half', label: 'Half', price: Math.round(basePrice * 0.6), stock: true },
                { id: 'quarter', label: 'Quarter', price: Math.round(basePrice * 0.4), stock: false },
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
                    <div style={{ fontSize: '16px', color: '#212121', marginBottom: '4px' }}>{opt.label}</div>
                    {!opt.stock && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Out of stock</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>₹{opt.price}</span>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      border: selectedOption === opt.id ? '6px solid var(--accent-red)' : '2px solid #d6d6d6',
                      background: 'transparent',
                      transition: 'all 0.2s'
                    }} />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Sticky Add to Cart Footer */}
        <div style={{ 
          position: pageMode ? 'static' : 'absolute', bottom: pageMode ? undefined : 0, left: pageMode ? undefined : 0, right: pageMode ? undefined : 0,
          flexShrink: 0,
          zIndex: 2100,
          background: 'rgba(255,255,255,.96)',
          padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border-subtle)',
          boxShadow: '0 -8px 24px rgba(33,33,33,.08)',
          backdropFilter: 'blur(16px)'
        }}>
          <button 
            onClick={() => {
              for(let i=0; i<quantity; i++) {
                addToCart(item, false);
              }
              setShowAddedConfirmation(true);
            }}
            style={{ 
              width: '100%',
              background: 'var(--accent-red)',
              color: 'white', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '16px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Add to Cart · ₹{totalPrice}
          </button>
          
        </div>

        {showAddedConfirmation && (
          <div className="cart-added-overlay" style={{ position: 'absolute', inset: 0, zIndex: 2200, display: 'grid', padding: '24px', placeItems: 'center', background: 'rgba(15,44,39,.72)', backdropFilter: 'blur(10px)' }}>
            <div className="cart-added-card cart-added-card--detail" ref={confirmationRef} role="status" aria-live="polite" style={{ width: 'min(100%, 420px)', overflowX: 'hidden', overflowY: 'auto', border: '1px solid rgba(255,255,255,.55)', borderRadius: '26px', background: '#fff', boxShadow: '0 28px 80px rgba(10,42,36,.34)' }}>
              <div style={{ position: 'relative', padding: '30px 24px 24px', overflow: 'hidden', background: 'linear-gradient(145deg, #174c43 0%, #246b5e 100%)', color: '#fff', textAlign: 'center' }}>
                <div aria-hidden style={{ position: 'absolute', width: '150px', height: '150px', top: '-90px', right: '-44px', borderRadius: '50%', background: 'rgba(255,255,255,.08)' }} />
                <div className="added-check-ring" style={{ display: 'grid', width: '64px', height: '64px', margin: '0 auto 14px', placeItems: 'center', border: '2px solid rgba(255,255,255,.42)', borderRadius: '50%', background: '#fff', color: 'var(--accent-red)', boxShadow: '0 10px 28px rgba(0,0,0,.2)' }}>
                  <Check size={32} strokeWidth={3} />
                </div>
                <p style={{ margin: '0 0 5px', fontSize: '10px', fontWeight: 800, letterSpacing: '.16em', opacity: .76, textTransform: 'uppercase' }}>Perfect choice</p>
                <h2 style={{ margin: 0, fontSize: '25px', lineHeight: 1.2 }}>Added to your cart!</h2>
              </div>

              <div style={{ padding: '20px' }}>
                <div className="added-product-preview" style={{ display: 'flex', padding: '12px', alignItems: 'center', gap: '13px', border: '1px solid var(--border-subtle)', borderRadius: '16px', background: '#f7faf8' }}>
                  <div style={{ position: 'relative', width: '66px', height: '66px', flex: '0 0 66px', overflow: 'hidden', borderRadius: '12px', background: '#edf2ef' }}>
                    <Image src={selectedImage} alt="" fill sizes="66px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ display: 'block', overflow: 'hidden', color: '#17342f', fontSize: '14px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</strong>
                    <span style={{ display: 'block', marginTop: '5px', color: 'var(--text-secondary)', fontSize: '11px' }}>{quantity} item{quantity === 1 ? '' : 's'} · {selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}</span>
                  </div>
                  <strong style={{ color: 'var(--accent-red)', fontSize: '17px' }}>₹{totalPrice}</strong>
                </div>

                <div style={{ display: 'grid', marginTop: '18px', gap: '10px' }}>
                  <button type="button" onClick={() => router.push('/cart')} style={{ display: 'flex', minHeight: '52px', padding: '0 18px', alignItems: 'center', justifyContent: 'center', gap: '9px', border: 0, borderRadius: '14px', background: 'var(--accent-red)', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 22px rgba(var(--accent-red-rgb),.24)' }}>
                    <ShoppingBag size={18} /> Go to cart <ArrowRight size={17} />
                  </button>
                  <button type="button" onClick={handleClose} style={{ minHeight: '48px', border: '1px solid var(--border-subtle)', borderRadius: '14px', background: '#fff', color: 'var(--accent-red)', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}>
                    Continue shopping
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  return pageMode ? content : createPortal(content, document.body);
}
