"use client";

import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Map as LeafletMap } from 'leaflet';
import { ArrowLeft, ChevronRight, Crosshair, Loader2, MapPin, Phone, Search, X } from 'lucide-react';
import {
  RESTAURANT_LAT,
  RESTAURANT_LNG,
  useLocation,
} from '../context/LocationContext';

interface AddressEditorProps {
  onClose: () => void;
  initialSearch?: string;
}

type SearchResult = {
  lat: number;
  lng: number;
  name: string;
  displayName: string;
};

export default function AddressEditor({ onClose, initialSearch = '' }: AddressEditorProps) {
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [error, setError] = useState('');
  const [selectedName, setSelectedName] = useState('Selected location');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedCoords, setSelectedCoords] = useState({
    lat: RESTAURANT_LAT,
    lng: RESTAURANT_LNG,
  });
  const [addressDetails, setAddressDetails] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [phone, setPhone] = useState('');

  const {
    addSavedAddress,
    locationLat,
    locationLng,
    setLocationManually,
  } = useLocation();

  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reverseRequestRef = useRef(0);
  const initialSearchRanRef = useRef(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const requestId = ++reverseRequestRef.current;
    setIsResolvingAddress(true);
    setError('');

    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      if (!response.ok || !data.result) {
        throw new Error(data.error || 'Address could not be found.');
      }
      if (requestId !== reverseRequestRef.current) return;

      setSelectedName(data.result.name);
      setSelectedAddress(data.result.displayName);
    } catch (requestError) {
      if (requestId !== reverseRequestRef.current) return;
      setSelectedAddress('');
      setError(requestError instanceof Error ? requestError.message : 'Address could not be found.');
    } finally {
      if (requestId === reverseRequestRef.current) setIsResolvingAddress(false);
    }
  }, []);

  const searchAddress = useCallback(async (query: string) => {
    setIsSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search failed.');
      setSearchResults(data.results ?? []);
      if (!data.results?.length) setError('No matching locations found. Try adding a city or postcode.');
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Search failed.');
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    let cancelled = false;
    const initialLat = locationLat ?? RESTAURANT_LAT;
    const initialLng = locationLng ?? RESTAURANT_LNG;

    async function initializeMap() {
      const L = await import('leaflet');
      if (cancelled || !mapElementRef.current) return;

      const map = L.map(mapElementRef.current, {
        zoomControl: false,
      }).setView([initialLat, initialLng], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const updateCenter = () => {
        const center = map.getCenter();
        setSelectedCoords({ lat: center.lat, lng: center.lng });
        if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
        reverseTimerRef.current = setTimeout(() => {
          void reverseGeocode(center.lat, center.lng);
        }, 700);
      };

      map.on('moveend', updateCenter);
      mapRef.current = map;
      setMapReady(true);
      setSelectedCoords({ lat: initialLat, lng: initialLng });
      void reverseGeocode(initialLat, initialLng);
      window.setTimeout(() => map.invalidateSize(), 0);
    }

    void initializeMap();

    return () => {
      cancelled = true;
      if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locationLat, locationLng, reverseGeocode]);

  useEffect(() => {
    const query = initialSearch.trim();
    if (!mapReady || query.length < 3 || initialSearchRanRef.current) return;
    initialSearchRanRef.current = true;
    void searchAddress(query);
  }, [initialSearch, mapReady, searchAddress]);

  useEffect(() => {
    const query = searchQuery.trim();
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (query.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/geocode?q=${encodeURIComponent(query)}&suggest=1`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (response.ok) setSearchResults(data.results ?? []);
      } catch (suggestionError) {
        if (!(suggestionError instanceof DOMException && suggestionError.name === 'AbortError')) {
          console.error('Location suggestions failed', suggestionError);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, query.length < 3 ? 0 : 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 3) {
      setError('Enter at least 3 characters to search.');
      return;
    }

    void searchAddress(query);
  };

  const selectSearchResult = (result: SearchResult) => {
    setSelectedName(result.name);
    setSelectedAddress(result.displayName);
    setSelectedCoords({ lat: result.lat, lng: result.lng });
    setSearchResults([]);
    setSearchQuery('');
    mapRef.current?.setView([result.lat, result.lng], 17);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser.');
      return;
    }

    setIsResolvingAddress(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = { lat: coords.latitude, lng: coords.longitude };
        setSelectedCoords(next);
        mapRef.current?.setView([next.lat, next.lng], 18);
        void reverseGeocode(next.lat, next.lng);
      },
      () => {
        setIsResolvingAddress(false);
        setError('Unable to access your location. Allow location permission and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = () => {
    if (!selectedAddress || !receiverName.trim() || !phone.trim() || !addressDetails.trim()) {
      setError('Select a location and complete all delivery details.');
      return;
    }

    const fullAddress = `${addressDetails.trim()}, ${selectedAddress}`;
    const savedAddress = {
      name: receiverName.trim(),
      title: selectedName,
      address: fullAddress,
      phone: phone.trim(),
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
    };

    addSavedAddress(savedAddress);
    setLocationManually(
      savedAddress.title,
      savedAddress.address,
      savedAddress.lat,
      savedAddress.lng
    );
    onClose();
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 1100, display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: '1 1 46%', minHeight: '280px' }}>
        <div ref={mapElementRef} aria-label="Delivery location map" style={{ position: 'absolute', inset: 0, background: '#d8d8d8' }} />

        <div style={{ position: 'absolute', inset: '0 0 auto', zIndex: 500, padding: '14px', background: 'linear-gradient(rgba(255,255,255,.98), rgba(255,255,255,0))', pointerEvents: 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={onClose} aria-label="Close location picker" style={{ width: '42px', height: '42px', flexShrink: 0, borderRadius: '50%', border: '1px solid var(--border-subtle)', background: '#fff', color: '#212121', display: 'grid', placeItems: 'center', cursor: 'pointer', boxShadow: '0 5px 18px rgba(33,33,33,.1)' }}>
                <ArrowLeft size={21} />
              </button>
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', color: '#212121', fontSize: '15px' }}>Add delivery address</strong>
                <span style={{ display: 'block', marginTop: '1px', color: '#747474', fontSize: '11px' }}>Search or move the map pin</span>
              </div>
            </div>
            <form onSubmit={handleSearch} className="location-search-shell location-search-shell--light">
              <Search size={19} color="var(--accent-red)" style={{ flexShrink: 0 }} />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Area, street, landmark or postcode" aria-label="Search delivery address" className="location-search-input" autoComplete="off" />
              {searchQuery && (
                <button type="button" aria-label="Clear delivery address search" onClick={() => setSearchQuery('')} className="location-search-clear">
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching}
                aria-label="Search delivery address"
                className="location-search-submit"
                style={{ width: '44px', minWidth: '44px', padding: 0, display: 'grid', placeItems: 'center' }}
              >
                {isSearching ? <Loader2 size={17} className="location-spinner" /> : <Search size={18} />}
              </button>
            </form>
          </div>

          {searchQuery.trim().length >= 3 && (isSearching || searchResults.length > 0) && (
            <div className="location-suggestions location-suggestions--light" style={{ pointerEvents: 'auto' }}>
              <div className="location-suggestions-header">
                <span>Suggested locations</span>
                {searchResults.length > 0 && <span>{searchResults.length} results</span>}
              </div>
              {isSearching && searchResults.length === 0 ? (
                <div className="location-suggestions-state"><Loader2 size={16} className="location-spinner" /> Searching locations…</div>
              ) : searchResults.map((result) => (
                <button key={`${result.lat}-${result.lng}`} onClick={() => selectSearchResult(result)} className="location-suggestion-item">
                  <span className="location-suggestion-pin"><MapPin size={17} /></span>
                  <span className="location-suggestion-copy">
                    <strong className="location-suggestion-title">{result.name}</strong>
                    <span className="location-suggestion-address">{result.displayName}</span>
                  </span>
                  <ChevronRight size={17} color="#aaa" style={{ flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div aria-hidden style={{ position: 'absolute', zIndex: 450, left: '50%', top: '50%', transform: 'translate(-50%, -100%)', color: 'var(--accent-red)', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,.35))', pointerEvents: 'none' }}>
          <MapPin size={42} fill="var(--accent-red)" stroke="#fff" strokeWidth={1.5} />
        </div>

        <button onClick={useCurrentLocation} disabled={!mapReady} style={{ position: 'absolute', zIndex: 450, right: '12px', bottom: '24px', display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 13px', borderRadius: '22px', border: '1px solid rgba(189,29,75,.35)', background: '#fff', color: 'var(--accent-red)', boxShadow: '0 4px 16px rgba(0,0,0,.24)', fontWeight: 800, cursor: mapReady ? 'pointer' : 'wait' }}>
          <Crosshair size={17} /> Current location
        </button>
      </div>

      <div style={{ flex: '0 1 auto', maxHeight: '54vh', overflowY: 'auto', padding: '20px', borderRadius: '22px 22px 0 0', background: '#fff', boxShadow: '0 -6px 22px rgba(33,33,33,.12)', zIndex: 600 }}>
        <div style={{ width: '42px', height: '4px', borderRadius: '4px', background: '#ddd', margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, background: 'rgba(189,29,75,.14)', display: 'grid', placeItems: 'center' }}>
            {isResolvingAddress ? <Loader2 size={18} color="var(--accent-red)" className="location-spinner" /> : <MapPin size={18} color="var(--accent-red)" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <strong style={{ color: '#212121', fontSize: '15px' }}>{isResolvingAddress ? 'Finding address…' : selectedName}</strong>
            <p style={{ margin: '3px 0 0', color: '#747474', fontSize: '12px', lineHeight: 1.45 }}>{selectedAddress || 'Move the map or search to choose your delivery address.'}</p>
          </div>
        </div>

        <input value={addressDetails} onChange={(event) => setAddressDetails(event.target.value)} placeholder="House number, building, floor *" style={{ width: '100%', boxSizing: 'border-box', marginBottom: '12px', padding: '13px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none', background: '#fafafa', color: '#212121', fontSize: '14px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <input value={receiverName} onChange={(event) => setReceiverName(event.target.value)} placeholder="Receiver name *" style={{ width: '50%', minWidth: 0, padding: '13px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)', outline: 'none', background: '#fafafa', color: '#212121', fontSize: '14px' }} />
          <label style={{ width: '50%', minWidth: 0, display: 'flex', alignItems: 'center', gap: '7px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-subtle)', background: '#fafafa', color: '#888' }}>
            <Phone size={15} />
            <input value={phone} onChange={(event) => setPhone(event.target.value.replace(/[^0-9+]/g, ''))} inputMode="tel" placeholder="Phone *" aria-label="Receiver phone number" style={{ width: '100%', minWidth: 0, padding: '13px 0', border: 0, outline: 0, background: 'transparent', color: '#212121', fontSize: '14px' }} />
          </label>
        </div>

        {error && <p role="alert" style={{ margin: '10px 0 0', color: '#c62828', fontSize: '12px', lineHeight: 1.4 }}>{error}</p>}

        <button onClick={handleSave} disabled={isResolvingAddress || !selectedAddress} style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '11px', border: 0, background: isResolvingAddress || !selectedAddress ? '#555' : 'var(--accent-red)', color: '#fff', fontSize: '15px', fontWeight: 800, cursor: isResolvingAddress || !selectedAddress ? 'not-allowed' : 'pointer' }}>
          Confirm delivery address
        </button>
      </div>
    </div>,
    document.body
  );
}
