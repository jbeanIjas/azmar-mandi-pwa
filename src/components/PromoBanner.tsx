import React from 'react';

export default function PromoBanner() {
  return (
    <div style={{ 
      margin: '0', 
      padding: '24px 16px', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '1px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', color: 'var(--accent-red)' }}>
          Azmar Mandi
        </h1>
        <h2 style={{ fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', marginTop: '4px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
          Feast Weekend
        </h2>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <div style={{ background: 'white', padding: '8px', borderRadius: '4px', transform: 'rotate(-5deg)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '80px', height: '80px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '40px' }}>🍖</span>
            </div>
          </div>
          <div style={{ background: 'white', padding: '8px', borderRadius: '4px', transform: 'rotate(5deg)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '80px', height: '80px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '40px' }}>🍗</span>
            </div>
          </div>
        </div>

        <button style={{ 
          marginTop: '24px', 
          background: 'var(--accent-red)',
          border: 'none', 
          padding: '10px 24px', 
          borderRadius: '20px',
          fontWeight: 'bold',
          color: 'white',
          boxShadow: '0 4px 12px rgba(189, 29, 75, 0.4)'
        }}>
          Celebrate with us &gt;
        </button>
      </div>
      
      {/* Decorative elements */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', color: 'var(--accent-red)', fontSize: '24px' }}>✨</div>
      <div style={{ position: 'absolute', top: '20%', right: '10%', color: 'var(--accent-red)', fontSize: '20px' }}>🎉</div>
      <div style={{ position: 'absolute', bottom: '15%', left: '15%', color: 'var(--accent-red)', fontSize: '16px' }}>🌟</div>
    </div>
  );
}
