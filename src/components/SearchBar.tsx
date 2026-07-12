import { Search, Mic } from 'lucide-react';
import React from 'react';

export default function SearchBar() {
  return (
    <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', position: 'sticky', top: '16px', zIndex: 40 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Search size={20} color="var(--text-secondary)" />
        <input 
          type="text" 
          placeholder='Search "mandi"' 
          style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none', padding: '0 12px' }}
        />
        <Mic size={20} color="var(--accent-red)" />
      </div>
    </div>
  );
}
