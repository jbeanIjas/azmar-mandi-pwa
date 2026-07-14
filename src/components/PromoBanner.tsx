import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="promo-card">
      <div className="promo-copy">
        <span className="promo-kicker"><Sparkles size={13} /> Weekend special</span>
        <h1>A feast made<br />the Arabian way.</h1>
        <p>Signature mandi, flame-grilled chicken and more.</p>
        <Link href="#signatures">Order now <ArrowUpRight size={16} /></Link>
      </div>
      <div className="promo-image">
        <Image src="/product-images/pexels-ali-dashti-506667798-17650168.jpg" alt="Azmar signature mandi" fill priority sizes="(max-width: 600px) 48vw, 360px" />
      </div>
      <span className="promo-ring promo-ring--one" />
      <span className="promo-ring promo-ring--two" />
    </section>
  );
}
