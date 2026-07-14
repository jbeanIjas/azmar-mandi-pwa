import { Clock3, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span>AM</span>
        <div><strong>AZMAR MANDI</strong><small>Crafted the Arabian way</small></div>
      </div>
      <p>Slow-cooked Arabian flavours, prepared fresh for every order.</p>
      <div className="footer-info">
        <span><MapPin size={16} /> Jumeirah Beach Road, Dubai</span>
        <span><Clock3 size={16} /> Open daily · 11 AM–12 AM</span>
        <span><Phone size={16} /> +971 4 123 4567</span>
      </div>
      <small>© {new Date().getFullYear()} Azmar Mandi. All rights reserved.</small>
    </footer>
  );
}
