"use client";

import React, { createContext, useContext, useState } from "react";

// Coordinates for the restaurant (Thiruvananthapuram)
export const RESTAURANT_LAT = 8.475091650738907;
export const RESTAURANT_LNG = 76.94724385255535;
export const MAX_DISTANCE_KM = 5;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

export interface SavedAddress {
  id: string;
  name: string;
  title: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
}

interface LocationContextType {
  locationStatus: 'idle' | 'loading' | 'success' | 'error';
  isDeliveryAvailable: boolean;
  locationName: string;
  locationAddress: string;
  locationLat: number | null;
  locationLng: number | null;
  savedAddresses: SavedAddress[];
  fetchCurrentLocation: () => void;
  setLocationManually: (name: string, address: string, lat: number, lng: number) => void;
  addSavedAddress: (address: Omit<SavedAddress, 'id'>) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState<boolean>(false);
  const [locationName, setLocationName] = useState('Manacaud');
  const [locationAddress, setLocationAddress] = useState('Thiruvananthapuram, Kerala,...');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  const addSavedAddress = (address: Omit<SavedAddress, 'id'>) => {
    const newAddress = { ...address, id: Math.random().toString(36).substr(2, 9) };
    setSavedAddresses(prev => [...prev, newAddress]);
  };

  const setLocationManually = (name: string, address: string, lat: number, lng: number) => {
    setLocationName(name);
    setLocationAddress(address);
    setLocationLat(lat);
    setLocationLng(lng);
    const distance = calculateDistance(lat, lng, RESTAURANT_LAT, RESTAURANT_LNG);
    setIsDeliveryAvailable(distance <= MAX_DISTANCE_KM);
    setLocationStatus('success');
  };

  const fetchCurrentLocation = () => {
    setLocationStatus('loading');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationLat(latitude);
        setLocationLng(longitude);
        const distance = calculateDistance(latitude, longitude, RESTAURANT_LAT, RESTAURANT_LNG);
        setIsDeliveryAvailable(distance <= MAX_DISTANCE_KM);
        
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          if (data?.result) {
            setLocationName(data.result.name || 'Current Location');
            setLocationAddress(data.result.displayName || 'Location found');
          }
        } catch (e) {
          console.error("Geocoding failed", e);
        }

        setLocationStatus('success');
      },
      (error) => {
        console.error("Location error", error);
        setLocationStatus('error');
      }
    );
  };

  // Initially don't auto-fetch to avoid aggressive permission popups, wait for user action
  // Wait, the previous logic in Header auto-fetched. 
  // Let's keep it idle until they click "Use current location".
  
  return (
    <LocationContext.Provider value={{ 
      locationStatus, 
      isDeliveryAvailable, 
      locationName, 
      locationAddress, 
      locationLat,
      locationLng,
      savedAddresses,
      fetchCurrentLocation,
      setLocationManually,
      addSavedAddress
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
