import { SlidersHorizontal, Zap } from 'lucide-react';
import React from 'react';

export default function FilterBar() {
  return (
    <div style={{ display: 'flex', overflowX: 'auto', padding: '0 16px 16px', gap: '12px' }} className="hide-scrollbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
        <SlidersHorizontal size={14} />
        <span style={{ fontSize: '14px' }}>Filters <span style={{ fontSize: '10px' }}>▼</span></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
        <Zap size={14} color="#4ade80" />
        <span style={{ fontSize: '14px' }}>Near & Fast</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '14px' }}>Under ₹200</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: '14px' }}>Schedule</span>
      </div>
    </div>
  );
}
