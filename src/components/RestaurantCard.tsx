"use client";

import Image from 'next/image';
import { Plus, Star } from 'lucide-react';
import React, { useState } from 'react';
import { MenuItem } from '@prisma/client';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

export default function RestaurantCard({ item }: { item: MenuItem }) {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const featured = item.tags?.includes('Best Seller') || item.tags?.includes('Signature');

  return (
    <>
      <article className="product-card" onClick={() => setIsModalOpen(true)}>
        <div className="product-image">
          <Image src={item.image} alt={item.name} fill sizes="(max-width: 600px) 54vw, 260px" />
          {featured && <span className="product-badge">Popular</span>}
          <span className="product-rating"><Star size={11} fill="currentColor" /> 4.8</span>
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
