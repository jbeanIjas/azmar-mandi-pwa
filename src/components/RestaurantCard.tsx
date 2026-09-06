"use client";

import Image from 'next/image';
import { Check, Plus, Star, X } from 'lucide-react';
import React, { TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MenuItem } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

const categoryGallery: Record<string, string[]> = {
  signatures: [
    '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
    '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
  ],
  alfaham: [
    '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
    '/product-images/pexels-ali-dashti-506667798-27359368.jpg',
    '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
  ],
  mandi: [
    '/product-images/pexels-ali-dashti-506667798-17650170.jpg',
    '/product-images/pexels-ali-dashti-506667798-17649393.jpg',
    '/product-images/pexels-ali-dashti-506667798-27359368.jpg',
  ],
  coastal: [
    '/product-images/pexels-ali-dashti-506667798-17650193.jpg',
    '/product-images/pexels-ali-dashti-506667798-17650168.jpg',
    '/product-images/pexels-ali-dashti-506667798-17650195.jpg',
  ],
  beverages: [
    '/product-images/pexels-ali-dashti-506667798-17696657.jpg',
  ],
};

function readGalleryImages(specs: unknown): string[] {
  try {
    const parsed = typeof specs === 'string' ? JSON.parse(specs) : specs;
    if (!parsed || typeof parsed !== 'object') return [];
    const gallery = 'gallery' in parsed ? parsed.gallery : 'images' in parsed ? parsed.images : [];
    return Array.isArray(gallery) ? gallery.filter((image): image is string => typeof image === 'string' && image.length > 0) : [];
  } catch {
    return [];
  }
}

export default function RestaurantCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideCycle, setSlideCycle] = useState(0);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState('full');
  const touchStartX = useRef<number | null>(null);
  const featured = item.tags?.includes('Best Seller') || item.tags?.includes('Signature');
  const slides = useMemo(() => Array.from(new Set([
    item.image,
    ...readGalleryImages(item.specs),
    ...(categoryGallery[item.categoryId] ?? []),
  ])).slice(0, 3), [item.categoryId, item.image, item.specs]);
  const basePrice = parseFloat(item.price.replace(/[^0-9.-]+/g, '')) || 0;
  const variants = [
    { id: 'quarter', label: 'Quarter', price: Math.round(basePrice * 0.4), available: false },
    { id: 'half', label: 'Half', price: Math.round(basePrice * 0.6), available: true },
    { id: 'full', label: 'Full', price: basePrice, available: true },
  ];

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
      setSlideCycle((current) => current + 1);
    }, 3_000);

    return () => window.clearTimeout(timer);
  }, [activeSlide, slideCycle, slides.length]);

  const moveSlide = (direction: number) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
    setSlideCycle((current) => current + 1);
  };

  const selectSlide = (index: number) => {
    setActiveSlide(index);
    setSlideCycle((current) => current + 1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || slides.length < 2) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 35) return;
    moveSlide(distance < 0 ? 1 : -1);
  };

  return (
      <article className="product-card" onClick={() => router.push(`/product/${item.id}`)}>
        <div className="product-image" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {slides.map((slide, index) => (
            <Image
              key={slide}
              className={index === activeSlide ? 'product-slide-image product-slide-image--active' : 'product-slide-image'}
              src={slide}
              alt={index === activeSlide ? `${item.name} — image ${index + 1} of ${slides.length}` : ''}
              aria-hidden={index !== activeSlide}
              fill
              loading="lazy"
              sizes="(max-width: 600px) 54vw, 260px"
            />
          ))}
          {featured && <span className="product-badge">Popular</span>}
          <span className="product-rating"><Star size={11} fill="currentColor" /> 4.8</span>
          {slides.length > 1 && (
            <div className="product-slide-dots" aria-label={`Image ${activeSlide + 1} of ${slides.length}`}>
              {slides.map((slide, index) => (
                <button
                  key={`${slide}-${index === activeSlide ? slideCycle : 'inactive'}`}
                  type="button"
                  className={index === activeSlide ? 'product-slide-dot product-slide-dot--active' : 'product-slide-dot'}
                  aria-label={`Show image ${index + 1} of ${item.name}`}
                  aria-current={index === activeSlide ? 'true' : undefined}
                  onClick={(event) => { event.stopPropagation(); selectSlide(index); }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="product-content">
          <span className="product-category">{item.categoryId}</span>
          <h3>{item.name}</h3>
          <p>{item.description}</p>
          <div className="product-footer">
            <strong>{item.price}</strong>
            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowVariantSelector(true);
              }}
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus size={19} />
            </button>
          </div>
        </div>
        {showVariantSelector && createPortal(
          <div
            className="variant-selector-overlay"
            onClick={(event) => { event.stopPropagation(); setShowVariantSelector(false); }}
            style={{ position: 'fixed', inset: 0, zIndex: 4500, display: 'grid', padding: '16px', placeItems: 'center', background: 'rgba(15,44,39,.72)', backdropFilter: 'blur(10px)' }}
          >
            <div
              className="variant-selector-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`variant-title-${item.id}`}
              onClick={(event) => event.stopPropagation()}
              style={{ width: 'min(100%, 410px)', padding: '20px', border: '1px solid rgba(255,255,255,.55)', borderRadius: '24px', background: '#fff', boxShadow: '0 28px 80px rgba(10,42,36,.34)', animation: 'cart-added-pop .4s cubic-bezier(.2,.9,.3,1.2)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', flex: '0 0 64px', overflow: 'hidden', borderRadius: '13px', background: '#eef3f0' }}><Image src={item.image} alt="" fill sizes="64px" style={{ objectFit: 'cover' }} /></div>
                <div style={{ minWidth: 0, flex: 1 }}><small style={{ color: 'var(--accent-red)', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>Choose your portion</small><h2 id={`variant-title-${item.id}`} style={{ margin: '3px 0 0', overflow: 'hidden', color: '#17342f', fontSize: '18px', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h2></div>
                <button type="button" aria-label="Close variant selector" onClick={() => setShowVariantSelector(false)} style={{ display: 'grid', width: '36px', height: '36px', padding: 0, placeItems: 'center', border: 0, borderRadius: '50%', background: '#f0f3f1', color: '#38534e', cursor: 'pointer' }}><X size={18} /></button>
              </div>

              <div style={{ display: 'grid', marginTop: '18px', gap: '9px' }}>
                {variants.map((variant) => {
                  const selected = selectedVariant === variant.id;
                  return <button key={variant.id} type="button" disabled={!variant.available} onClick={() => setSelectedVariant(variant.id)} style={{ display: 'flex', minHeight: '58px', padding: '0 14px', alignItems: 'center', justifyContent: 'space-between', border: selected ? '1.5px solid var(--accent-red)' : '1px solid var(--border-subtle)', borderRadius: '14px', background: selected ? 'rgba(var(--accent-red-rgb),.07)' : '#fff', color: variant.available ? '#17342f' : '#a8b0ad', cursor: variant.available ? 'pointer' : 'not-allowed', opacity: variant.available ? 1 : .58 }}><span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}><span style={{ display: 'grid', width: '22px', height: '22px', placeItems: 'center', border: selected ? '6px solid var(--accent-red)' : '2px solid #cbd5d1', borderRadius: '50%' }} />{variant.label}{!variant.available && <small>Out of stock</small>}</span><strong>₹{variant.price}</strong></button>;
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  const variant = variants.find((option) => option.id === selectedVariant) ?? variants[2];
                  addToCart({ ...item, price: `₹${variant.price}`, specs: { ...(item.specs && typeof item.specs === 'object' && !Array.isArray(item.specs) ? item.specs : {}), selectedVariant: variant.label } });
                  setShowVariantSelector(false);
                }}
                style={{ display: 'flex', width: '100%', minHeight: '52px', marginTop: '16px', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 0, borderRadius: '14px', background: 'var(--accent-red)', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 10px 22px rgba(var(--accent-red-rgb),.22)' }}
              >
                <Check size={17} /> Add {variants.find((variant) => variant.id === selectedVariant)?.label} · ₹{variants.find((variant) => variant.id === selectedVariant)?.price}
              </button>
            </div>
          </div>,
          document.body
        )}
      </article>
  );
}
