import { useState, useEffect, useCallback } from 'react';

const useGeolocation = (options = {}) => {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0
  } = options;

  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    loading: false,
    error: null
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser'
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null
        });
      },
      (error) => {
        let message;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
          default:
            message = 'Unknown geolocation error';
        }
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: message
        }));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return { ...location, getCurrentPosition };
};

export default useGeolocation;
