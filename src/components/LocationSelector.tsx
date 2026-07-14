"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Search, Crosshair, Plus, Home, MapPin, X, Loader2 } from 'lucide-react';
import { useLocation, RESTAURANT_LAT, RESTAURANT_LNG } from '../context/LocationContext';

interface LocationSelectorProps {
  onClose: () => void;
  onAddAddress: (searchQuery?: string) => void;
}

type LocationSuggestion = {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
};

export default function LocationSelector({ onClose, onAddAddress }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [suggestionStatus, setSuggestionStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  const { fetchCurrentLocation, locationStatus, locationAddress, locationName, setLocationManually, savedAddresses } = useLocation();

  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = searchQuery.trim();
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setSuggestionStatus('idle');
        return;
      }

      setSuggestionStatus('loading');
      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(query)}&suggest=1`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (response.ok) setSuggestions(data.results ?? []);
      } catch (suggestionError) {
        if (!(suggestionError instanceof DOMException && suggestionError.name === 'AbortError')) {
          console.error('Location suggestions failed', suggestionError);
        }
      } finally {
        if (!controller.signal.aborted) setSuggestionStatus('complete');
      }
    }, query.length < 3 ? 0 : 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  return createPortal(
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'flex-end',
      backdropFilter: 'blur(4px)'
    }}>
      <div ref={modalRef} style={{
        background: 'var(--bg-dark)',
        width: '100%',
        height: '90vh',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -4px 24px rgba(33,33,33,0.14)',
        overflowY: 'auto'
      }}>
      
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px', gap: '16px', position: 'sticky', top: 0, background: 'var(--bg-dark)', zIndex: 10 }}>
          <button 
            onClick={onClose}
            style={{ background: '#f3f1f1', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#212121', cursor: 'pointer' }}
          >
            <ChevronDown size={24} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: '#212121' }}>Select a location</h1>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 16px', marginBottom: '24px' }}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (searchQuery.trim().length >= 3) onAddAddress(searchQuery.trim());
            }}
            className="location-search-shell"
          >
            <Search size={20} color="var(--accent-red)" style={{ flexShrink: 0 }} />
            <input 
              type="text" 
              placeholder="Area, street, landmark or postcode" 
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="location-search-input"
              autoComplete="off"
            />
            {searchQuery && (
              <button type="button" aria-label="Clear location search" onClick={() => setSearchQuery('')} className="location-search-clear">
                <X size={15} />
              </button>
            )}
            <button type="submit" disabled={suggestionStatus === 'loading'} className="location-search-submit">
              {suggestionStatus === 'loading' ? <Loader2 size={17} className="location-spinner" /> : 'Search'}
            </button>
          </form>
          {searchQuery.trim().length >= 3 && suggestionStatus !== 'idle' && (
            <div className="location-suggestions">
              <div className="location-suggestions-header">
                <span>Suggested locations</span>
                {suggestions.length > 0 && <span>{suggestions.length} results</span>}
              </div>
              {suggestionStatus === 'loading' ? (
                <div className="location-suggestions-state"><Loader2 size={16} className="location-spinner" /> Finding nearby places…</div>
              ) : suggestions.length === 0 ? (
                <div className="location-suggestions-state">No locations found. Try a nearby landmark.</div>
              ) : suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.lat}-${suggestion.lng}`}
                  type="button"
                  onClick={() => {
                    setLocationManually(suggestion.name, suggestion.displayName, suggestion.lat, suggestion.lng);
                    onClose();
                  }}
                  className="location-suggestion-item"
                >
                  <span className="location-suggestion-pin"><MapPin size={17} /></span>
                  <span className="location-suggestion-copy">
                    <strong className="location-suggestion-title">{suggestion.name}</strong>
                    <span className="location-suggestion-address">{suggestion.displayName}</span>
                  </span>
                  <ChevronRight size={17} color="#aaa" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Primary Actions */}
        <div style={{ padding: '0 16px', marginBottom: '32px' }}>
          <div style={{ background: '#fafafa', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            
            <div 
              onClick={() => {
                fetchCurrentLocation();
                onClose();
              }}
              style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
            >
              <Crosshair size={20} color="var(--accent-red)" style={{ marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '500', color: 'var(--accent-red)', marginBottom: '4px' }}>
                  Use current location
                </div>
                {locationStatus === 'loading' ? (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Fetching location...</div>
                ) : (
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {locationStatus === 'success' ? `${locationName}, ${locationAddress}` : 'Enable location services'}
                  </div>
                )}
              </div>
              <ChevronDown size={20} color="var(--text-secondary)" style={{ transform: 'rotate(-90deg)' }} />
            </div>

            <div 
              onClick={() => onAddAddress()}
              style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
            >
              <Plus size={20} color="var(--accent-red)" />
              <div style={{ flex: 1, fontSize: '16px', fontWeight: '500', color: 'var(--accent-red)' }}>
                Add Address
              </div>
              <ChevronDown size={20} color="var(--text-secondary)" style={{ transform: 'rotate(-90deg)' }} />
            </div>

          </div>
        </div>

        {/* Saved Addresses */}
        {savedAddresses.length > 0 && (
          <div style={{ padding: '0 16px', marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '16px' }}>SAVED ADDRESSES</div>
            
            {savedAddresses.map(addr => (
              <div 
                key={addr.id}
                onClick={() => {
                  setLocationManually(addr.title, addr.address, addr.lat, addr.lng);
                  onClose();
                }}
                style={{ background: '#fafafa', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-subtle)', cursor: 'pointer', marginBottom: '12px' }}
              >
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Home size={20} color="var(--accent-red)" />
                    {/* Mock distance for UI */}
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>5.4 km</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#212121', marginBottom: '4px' }}>{addr.title}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '8px' }}>
                      {addr.address}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                      Phone number: {addr.phone}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nearby Locations */}
        <div style={{ padding: '0 16px', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '16px' }}>NEARBY LOCATIONS</div>
          
          <div style={{ background: '#fafafa', borderRadius: '16px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            
            {[
              { name: 'Sut Mother And Child Hospital', dist: '44 m', addr: 'Manacaud, Thiruvananthapuram, Kerala' },
              { name: 'Medical Mission Hospital', dist: '116 m', addr: 'Manacaud, Thiruvananthapuram, Kerala' },
              { name: 'Manacaud Sastha Kovil', dist: '135 m', addr: 'Manacaud, Thiruvananthapuram' },
              { name: 'Manacaud Post Office', dist: '265 m', addr: 'Manacaud, Thiruvananthapuram' }
            ].map((loc, i, arr) => (
              <div 
                key={loc.name}
                onClick={() => {
                  setLocationManually(loc.name, loc.addr, RESTAURANT_LAT, RESTAURANT_LNG); // Mock coords
                  onClose();
                }}
                style={{ 
                  padding: '16px', 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '16px', 
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '32px' }}>
                  <MapPin size={20} color="var(--accent-red)" />
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{loc.dist}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#212121', marginBottom: '4px' }}>{loc.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{loc.addr}</div>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
