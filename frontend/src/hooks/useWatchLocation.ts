import { useState, useEffect } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  permissionDenied: boolean;
  loading: boolean;
}

export const useWatchLocation = () => {
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: isSupported ? null : 'Geolocation is not supported by your browser',
    permissionDenied: false,
    loading: isSupported,
  });

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          permissionDenied: false,
          loading: false,
        });
      },
      (error) => {
        let errorMsg = 'An unknown error occurred.';
        let denied = false;
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'User denied the request for Geolocation.';
          denied = true;
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'The request to get user location timed out.';
        }
        
        setLocation(prev => ({
          ...prev,
          error: errorMsg,
          permissionDenied: denied,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location;
};
