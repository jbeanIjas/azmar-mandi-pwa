import { MapPin, Wallet } from 'lucide-react';
import React from 'react';

export default function Header() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={18} color="white" />
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '4px', color: 'white' }}>
            Manacaud <span style={{ fontSize: '12px' }}>▼</span>
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Thiruvananthapuram, Kerala,...
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'var(--accent-gold)', borderRadius: '20px', padding: '4px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: '900', color: 'black', lineHeight: 1 }}>GOLD</span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'black', lineHeight: 1 }}>₹1</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Wallet size={16} color="white" />
        </div>
        <div style={{ background: '#1c4c96', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          I
        </div>
      </div>
    </div>
  );
}
