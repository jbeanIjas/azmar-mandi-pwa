"use client";

import Image from 'next/image';
import { Plus, Star } from 'lucide-react';
import React, { TouchEvent, useEffect, useMemo, useRef, useState } from 'react';
import { MenuItem } from '@prisma/client';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideCycle, setSlideCycle] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const featured = item.tags?.includes('Best Seller') || item.tags?.includes('Signature');
  const slides = useMemo(() => Array.from(new Set([
    item.image,
    ...readGalleryImages(item.specs),
    ...(categoryGallery[item.categoryId] ?? []),
  ])).slice(0, 3), [item.categoryId, item.image, item.specs]);

  useEffect(() => {
    if (slides.length < 2 || isModalOpen) return;

    const timer = window.setTimeout(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
      setSlideCycle((current) => current + 1);
    }, 3_000);

    return () => window.clearTimeout(timer);
  }, [activeSlide, isModalOpen, slideCycle, slides.length]);

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
    <>
      <article className="product-card" onClick={() => setIsModalOpen(true)}>
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
                addToCart(item);
              }}
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus size={19} />
            </button>
          </div>
        </div>
      </article>
      {isModalOpen && <ProductModal item={item} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
