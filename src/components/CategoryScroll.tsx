"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import gsap from 'gsap';
import ScrollToPlugin from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);

const categories = [
  { id: 'all', name: 'All', image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg' },
  { id: 'signatures', name: 'Signatures', image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg' },
  { id: 'alfaham', name: 'Al Faham', image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg' },
  { id: 'mandi', name: 'Mandi', image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg' },
  { id: 'coastal', name: 'Coastal', image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg' },
  { id: 'beverages', name: 'Drinks', image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg' },
];

export default function CategoryScroll() {
  const [activeId, setActiveId] = React.useState('all');

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActiveId(id);
    const target = id === 'all' ? 0 : document.getElementById(id) ?? 0;
    gsap.to(window, { duration: 0.65, scrollTo: { y: target, offsetY: 108 }, ease: 'power3.inOut' });
  };

  return (
    <nav className="category-nav" aria-label="Menu categories">
      <div className="category-rail hide-scrollbar">
        {categories.map((category) => {
          const isActive = activeId === category.id;
          return (
            <Link key={category.id} href={`/#${category.id}`} onClick={(event) => handleNavClick(event, category.id)} className={isActive ? 'category-chip category-chip--active' : 'category-chip'}>
              <span className="category-thumb"><Image src={category.image} alt="" fill sizes="42px" /></span>
              <span>{category.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
