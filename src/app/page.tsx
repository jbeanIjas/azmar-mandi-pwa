import React from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import PromoBanner from '../components/PromoBanner';
import CategoryScroll from '../components/CategoryScroll';
import RestaurantCard from '../components/RestaurantCard';
import BottomNav from '../components/BottomNav';
import Footer from '../components/Footer';
import { menuItems } from '../data/menuData';

export default function Home() {
  // Select some top items for the "Recommended For You" section
  const recommendedItems = menuItems.filter(item => 
    item.tags?.includes('Best Seller') || item.tags?.includes('Signature') || item.tags?.includes('Classic')
  ).slice(0, 12);

  return (
    <main style={{ paddingBottom: '80px', minHeight: '100vh' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #7c1212 0%, #b81d22 100%)', 
        paddingBottom: '24px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        marginBottom: '24px'
      }}>
        <Header />
        <SearchBar />
        <PromoBanner />
      </div>
      
      <CategoryScroll />
      
      <div style={{ padding: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Recommended For You
        </h2>
        
        <div 
          className="hide-scrollbar"
          style={{ 
            display: 'grid', 
            gridTemplateRows: recommendedItems.length < 6 ? '1fr' : 'repeat(2, 1fr)', 
            gridAutoFlow: 'column',
            gridAutoColumns: '40%', // 2.5 columns visible (100 / 2.5 = 40%)
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '8px',
            scrollSnapType: 'x mandatory'
          }}
        >
          {recommendedItems.map(item => (
            <RestaurantCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      {['signatures', 'alfaham', 'mandi', 'coastal', 'beverages'].map(category => {
        const catItems = menuItems.filter(item => item.category === category);
        if (catItems.length === 0) return null;
        
        const catTitles: Record<string, string> = {
          'signatures': 'AZMAR SIGNATURES',
          'alfaham': 'AL FAHAM COLLECTION',
          'mandi': 'MANDI SELECTION',
          'coastal': 'COASTAL SIGNATURES',
          'beverages': 'FRESH JUICES & COOLERS'
        };

        return (
          <div key={category} style={{ padding: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {catTitles[category]}
            </h2>
            
            <div 
              className="hide-scrollbar"
              style={{ 
                display: 'grid', 
                gridTemplateRows: catItems.length < 6 ? '1fr' : 'repeat(2, 1fr)', 
                gridAutoFlow: 'column',
                gridAutoColumns: '40%', // 2.5 columns visible
                gap: '16px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollSnapType: 'x mandatory'
              }}
            >
              {catItems.map(item => (
                <RestaurantCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        );
      })}
      
      <Footer />
      <BottomNav />
    </main>
  );
}
