import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      backgroundColor: '#121215',
      borderTop: '1px solid rgba(244, 208, 104, 0.15)',
      padding: '48px 16px',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto', zIndex: 10 }}>
        
        {/* Brand Info */}
        <div style={{ marginBottom: '48px' }}>
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '0.2em', color: 'white' }}>
              AZMAR MANDI
            </span>
            <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--accent-gold)', fontWeight: '600', marginTop: '-4px' }}>
              Crafted The Arabian Way
            </span>
          </Link>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '320px', marginTop: '24px' }}>
            Savor the culinary heritage of Yemen and the Arabian Gulf. Every dish is cooked using time-honored slow-cooking techniques and fresh, premium ingredients.
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '24px' }}>
            Navigation
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link></li>
            <li><Link href="/about" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>About Us</Link></li>
            <li><Link href="/menu" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Menu</Link></li>
            <li><Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Contact</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '0.1em', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '24px' }}>
            Contact Info
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <MapPin size={20} color="var(--accent-gold)" />
              <span>Jumeirah Beach Road, Block D, Dubai, UAE</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Phone size={20} color="var(--accent-gold)" />
              <span>+971 4 123 4567</span>
            </li>
            <li style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Mail size={20} color="var(--accent-gold)" />
              <span>info@azmarmandi.com</span>
            </li>
          </ul>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(244, 208, 104, 0.1)', paddingTop: '32px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} AZMAR MANDI. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
