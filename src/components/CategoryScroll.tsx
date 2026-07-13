"use client";

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const categories = [
  { id: 'all', name: 'All', image: '/product-images/pexels-ali-dashti-506667798-17649393.jpg', active: true },
  { id: 'signatures', name: 'Signatures', image: '/product-images/pexels-ali-dashti-506667798-17650168.jpg' },
  { id: 'alfaham', name: 'Al Faham', image: '/product-images/pexels-ali-dashti-506667798-17650195.jpg' },
  { id: 'mandi', name: 'Mandi', image: '/product-images/pexels-ali-dashti-506667798-17650170.jpg' },
  { id: 'coastal', name: 'Coastal', image: '/product-images/pexels-ali-dashti-506667798-17650193.jpg' },
  { id: 'beverages', name: 'Beverages', image: '/product-images/pexels-ali-dashti-506667798-17696657.jpg' },
];

export default function CategoryScroll() {
  const [activeId, setActiveId] = React.useState('all');
  const [isStuck, setIsStuck] = React.useState(false);
  const stickySentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const sentinel = stickySentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsStuck(entry.boundingClientRect.top < 0);
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);
    
    // Add micro-interaction
    const imgContainer = e.currentTarget.querySelector('.cat-img');
    if (imgContainer) {
      gsap.fromTo(imgContainer, 
        { scale: 0.9 }, 
        { scale: 1, duration: 0.4, ease: "back.out(2)" }
      );
    }

    if (id === 'all') {
      gsap.to(window, { duration: 0.8, scrollTo: { y: 0 }, ease: "power3.inOut" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        // Offset for the sticky header (approx 140px)
        gsap.to(window, { duration: 0.8, scrollTo: { y: element, offsetY: 140 }, ease: "power3.inOut" });
      }
    }
  };

  return (
    <>
      <div ref={stickySentinelRef} aria-hidden="true" style={{ height: '1px', marginBottom: '-1px' }} />
      <nav
        aria-label="Menu categories"
        style={{ position: 'sticky', top: 0, zIndex: 40, width: '100%', background: 'var(--bg-dark)' }}
      >
        <div style={{ display: 'flex', overflowX: 'auto', padding: '16px', gap: '16px' }} className="hide-scrollbar">
          {!isStuck && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', background: '#3b82f6', borderRadius: '12px', padding: '12px 8px', justifyContent: 'space-between' }}>
              <div style={{ background: 'white', color: 'red', fontWeight: 'bold', fontSize: '10px', padding: '2px 4px' }}>MEALS UNDER</div>
              <div style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>₹250</div>
              <div style={{ color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center' }}>Explore &gt;</div>
            </div>
          )}

          {categories.map((cat) => {
            const isActive = activeId === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/#${cat.id}`}
                onClick={(e) => handleNavClick(e, cat.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '70px', gap: '8px', opacity: isActive ? 1 : 0.6, textDecoration: 'none', color: 'inherit' }}
              >
                <div className="cat-img" style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: isActive ? '2px solid var(--accent-red)' : '2px solid transparent' }}>
                  <Image src={cat.image} alt={cat.name} width={60} height={60} style={{ objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: isActive ? 'bold' : 'normal', borderBottom: isActive ? '2px solid var(--accent-red)' : 'none', paddingBottom: '4px' }}>{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
