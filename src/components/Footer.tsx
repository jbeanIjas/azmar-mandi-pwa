import { ExternalLink, Mail, MapPin, MessageCircle } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-intro">
          <div className="footer-brand">
            <span><Image src="/brand/azmar-mark.png" alt="Azmar Mandi" width={54} height={54} /></span>
            <div><strong>AZMAR MANDI</strong><small>Crafted the Arabian way</small></div>
          </div>
          <p>Slow-cooked Arabian flavours, prepared fresh for every order.</p>
          <div className="footer-socials" aria-label="Follow Azmar Mandi">
            <a href="https://www.instagram.com/azmarmandi/" target="_blank" rel="noreferrer" aria-label="Azmar Mandi on Instagram">
              <svg className="footer-social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.25" />
                <circle className="footer-social-icon-dot" cx="17.4" cy="6.7" r="1.15" />
              </svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61591425304798" target="_blank" rel="noreferrer" aria-label="Azmar Mandi on Facebook">
              <svg className="footer-social-icon footer-social-icon--facebook" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14.35 21v-8h2.75l.42-3.2h-3.17V7.76c0-.93.26-1.56 1.6-1.56h1.7V3.35c-.3-.04-1.3-.13-2.48-.13-2.45 0-4.13 1.5-4.13 4.25V9.8H8.25V13h2.79v8h3.31Z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-contact-grid">
          <a className="footer-contact-card" href="https://maps.app.goo.gl/21HJJnTb5Aq1V5hA9" target="_blank" rel="noreferrer">
            <span className="footer-contact-icon"><MapPin size={20} /></span>
            <span><small>Visit us</small><strong>Open in Google Maps</strong></span>
            <ExternalLink size={15} />
          </a>
          <a className="footer-contact-card" href="https://wa.me/918589889800" target="_blank" rel="noreferrer">
            <span className="footer-contact-icon footer-contact-icon--whatsapp"><MessageCircle size={20} /></span>
            <span><small>WhatsApp</small><strong>+91 85898 89800</strong></span>
            <ExternalLink size={15} />
          </a>
          <a className="footer-contact-card" href="mailto:azmarmandi@gmail.com">
            <span className="footer-contact-icon"><Mail size={20} /></span>
            <span><small>Email us</small><strong>azmarmandi@gmail.com</strong></span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Azmar Mandi. All rights reserved.</small>
        <span>Authentic Arabian cuisine</span>
      </div>
    </footer>
  );
}
