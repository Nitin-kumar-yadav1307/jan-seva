import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/**
 * Browser geolocation + reverse-geocoding context.
 * - On first load, prompts the browser for location permission (navigator.geolocation)
 *   if we don't already have a cached location.
 * - Reverse-geocodes the coordinates to a human-readable address/city using
 *   OpenStreetMap Nominatim (free, no API key).
 * - Caches the result in localStorage so returning users don't get re-prompted.
 * - Exposes a manual requestLocation() so the user can detect/refresh on demand.
 *
 * Coords follow the app-wide GeoJSON convention: [longitude, latitude].
 */

const GEO_CACHE_KEY = 'coopseva_geo_location';

const DEFAULT_LOCATION = {
  coords: [72.8777, 19.0760], // [lon, lat] — Mumbai, Maharashtra fallback
  address: 'Mumbai, Maharashtra',
  city: 'Mumbai',
  label: 'Mumbai',
};

const GeolocationContext = createContext({});

function loadCache() {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Could not read cached location.', err);
    return null;
  }
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=en`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data = await res.json();
    const a = data.address || {};
    const city = a.city || a.town || a.village || a.state_district || a.county || '';
    const state = a.state || '';
    const label = [city, state].filter(Boolean).join(', ') || city || 'My location';
    return {
      address: data.display_name || label,
      city,
      label,
      raw: data.address || null,
    };
  } catch (err) {
    console.warn('Reverse geocoding failed.', err);
    return { address: 'My current location', city: '', label: 'My location' };
  }
}

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => loadCache() || DEFAULT_LOCATION);
  const [status, setStatus] = useState('idle'); // 'idle' | 'requesting' | 'ready' | 'denied' | 'error' | 'unsupported'
  const [error, setError] = useState(null);
  const promptedRef = useRef(false);

  const persist = useCallback((geo) => {
    setLocation(geo);
    setStatus('ready');
    setError(null);
    try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(geo)); } catch (err) {
      console.warn('Could not persist location.', err);
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unsupported');
      setError('Geolocation is not supported by this browser.');
      return;
    }
    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        persist({
          coords: [longitude, latitude], // [lon, lat]
          address: place.address,
          city: place.city,
          label: place.label,
        });
      },
      (err) => {
        setStatus('denied');
        setError(err.message || 'Location permission was denied.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 }
    );
  }, [persist]);

  // Auto-request once on first load only when there is no cached location.
  useEffect(() => {
    const cached = loadCache();
    if (!cached && !promptedRef.current) {
      promptedRef.current = true;
      requestLocation();
    }
  }, [requestLocation]);

  return (
    <GeolocationContext.Provider
      value={{
        location,
        status,
        error,
        requestLocation,
        coords: location.coords,
        isPending: status === 'requesting',
        isDenied: status === 'denied' || status === 'unsupported',
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
};

export const useGeolocation = () => useContext(GeolocationContext);

export default LocationProvider;
