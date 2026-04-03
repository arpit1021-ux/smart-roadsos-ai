import { useEffect, useRef, useState } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../constants';

const MapView = ({
  center = { lat: 0, lng: 0 },
  zoom = 12,
  markers = [],
  routes = [],
  onMapClick,
  style = {}
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routesRef = useRef([]);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Google Maps script
    if (window.google) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setMapLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      delete window.initMap;
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const mapOptions = {
      center,
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    mapInstanceRef.current = new window.google.maps.Map(
      mapRef.current,
      mapOptions
    );

    // Click handler
    if (onMapClick) {
      mapInstanceRef.current.addListener('click', (event) => {
        const { lat, lng } = event.latLng.toJSON();
        onMapClick({ latitude: lat, longitude: lng });
      });
    }
  }, [mapLoaded, center, zoom, onMapClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;

    mapInstanceRef.current.setCenter(center);
  }, [center]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const position = {
        lat: markerData.location?.lat || markerData.latitude || markerData.coordinates?.[1],
        lng: markerData.location?.lng || markerData.longitude || markerData.coordinates?.[0]
      };

      if (!position.lat || !position.lng) return;

      const { google } = window;
      const marker = new google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: markerData.title || markerData.name,
        icon: {
          url: markerData.icon || getMarkerIcon(markerData.type),
          scaledSize: new window.google.maps.Size(32, 32)
        },
        animation: markerData.isAccident ? google.maps.Animation.BOUNCE : null
      });

      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: markerData.info
        });
        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });
  }, [markers]);

  useEffect(() => {
    if (!mapInstanceRef.current || !routes.length) return;

    // Clear existing routes
    routesRef.current.forEach(route => route.setMap(null));
    routesRef.current = [];

    // Add new routes
    routes.forEach((routeData) => {
      if (!routeData.polyline) return;

      const { google } = window;
      const path = google.maps.geometry.encoding.decodePath(routeData.polyline);

      const route = new google.maps.Polyline({
        path,
        strokeColor: routeData.color || '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 5,
        map: mapInstanceRef.current
      });

      routesRef.current.push(route);
    });
  }, [routes]);

  const getMarkerIcon = (type) => {
    const icons = {
      user: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      hospital: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      police: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      ambulance: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      accident: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };
    return icons[type] || icons.hospital;
  };

  if (error) {
    return (
      <div className="map-container flex items-center justify-center bg-gray-300 dark:bg-gray-700">
        <div className="text-red-600 dark:text-red-400 text-center">
          <p className="font-semibold">Map Error</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Check your API key configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="map-container"
      style={{ height: style.height || '500px', ...style }}
    />
  );
};

export default MapView;
