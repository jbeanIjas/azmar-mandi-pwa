import { Search, Mic } from 'lucide-react';
import React from 'react';

export default function SearchBar() {
  return (
    <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder='Search "mandi"' 
          style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', padding: '0 12px' }}
        />
        <Mic size={20} color="var(--accent-red)" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>VEG</span>
        <span style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>MODE</span>
        <div style={{ width: '32px', height: '18px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '10px', position: 'relative' }}>
          <div style={{ width: '14px', height: '14px', background: 'var(--text-secondary)', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }} />
        </div>
      </div>
    </div>
  );
}
