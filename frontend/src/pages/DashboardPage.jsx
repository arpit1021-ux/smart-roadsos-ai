import { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { servicesAPI, accidentsAPI } from '../services/api';
import { EMERGENCY_SERVICE_TYPES, SEVERITY_LEVELS } from '../constants';

const DashboardPage = () => {
  const { latitude, longitude, loading, error, getCurrentPosition } = useGeolocation();
  const [services, setServices] = useState({ hospitals: [], police: [], ambulances: [] });
  const [recentAccidents, setRecentAccidents] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceType, setServiceType] = useState('hospital');

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyServices();
      fetchRecentAccidents(latitude, longitude);
    }
  }, [latitude, longitude]);

  const fetchNearbyServices = async () => {
    try {
      const [hospitals, police, ambulances] = await Promise.all([
        servicesAPI.getNearby({ lat: latitude, lng: longitude, type: 'hospital', radius: 10 }),
        servicesAPI.getNearby({ lat: latitude, lng: longitude, type: 'police', radius: 10 }),
        servicesAPI.getNearby({ lat: latitude, lng: longitude, type: 'ambulance', radius: 10 })
      ]);

      setServices({
        hospitals: hospitals.services || [],
        police: police.services || [],
        ambulances: ambulances.services || []
      });
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchRecentAccidents = async (lat, lng) => {
    try {
      const response = await accidentsAPI.getNearby({ lat, lng, radius: 20 });
      setRecentAccidents(response.accidents || []);
    } catch (error) {
      console.error('Failed to fetch accidents:', error);
    }
  };

  const getMarkers = () => {
    const markers = [];

    // User location
    if (latitude && longitude) {
      markers.push({
        type: 'user',
        location: { lat: latitude, lng: longitude },
        title: 'Your Location',
        icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      });
    }

    // Service locations
    [...services.hospitals, ...services.police, ...services.ambulances].forEach(service => {
      const type = service.type;
      const iconMap = {
        hospital: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        police: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        ambulance: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
      };

      markers.push({
        type,
        location: {
          lat: service.location.coordinates[1],
          lng: service.location.coordinates[0]
        },
        title: service.name,
        info: `
          <div class="p-2">
            <h3 class="font-bold">${service.name}</h3>
            <p class="text-sm">${service.address || ''}</p>
            ${service.phone ? `<p class="text-sm">📞 ${service.phone}</p>` : ''}
          </div>
        `
      });
    });

    // Recent accidents
    recentAccidents.forEach(accident => {
      markers.push({
        type: 'accident',
        location: {
          lat: accident.location.coordinates[1],
          lng: accident.location.coordinates[0]
        },
        title: `Accident - ${accident.severityPrediction.level}`,
        isAccident: true,
        info: `
          <div class="p-2">
            <h3 class="font-bold text-${SEVERITY_LEVELS[accident.severityPrediction.level]?.textColor || 'red-600'}">
              ${accident.severityPrediction.level.toUpperCase()}
            </h3>
            <p class="text-sm">${accident.address || 'No address'}</p>
            <p class="text-sm">Status: ${accident.status}</p>
          </div>
        `
      });
    });

    return markers;
  };

  const handleMapClick = async (coords) => {
    console.log('Map clicked:', coords);
  };

  const getServicesByType = (type) => {
    const keyMap = {
      hospital: 'hospitals',
      police: 'police',
      ambulance: 'ambulances'
    };
    return services[keyMap[type]] || [];
  };

  const center = latitude && longitude ? { lat: latitude, lng: longitude } : { lat: 0, lng: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your location and nearby emergency services
          </p>
        </div>

        <button
          onClick={getCurrentPosition}
          disabled={loading}
          className="mt-4 md:mt-0 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Getting location...' : '📍 Update Location'}
        </button>
      </div>

      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 px-4 py-3 rounded-lg">
          {error}. Please enable location services for the best experience.
        </div>
      )}

      {!latitude && !loading && (
        <div className="bg-blue-100 dark:bg-blue-900 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-200 px-4 py-3 rounded-lg">
          Allow location access to see nearby emergency services on the map.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <MapView
              center={center}
              zoom={13}
              markers={getMarkers()}
              style={{ height: '500px' }}
            />
          </div>
        </div>

        {/* Services List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Service Type Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <div className="flex space-x-2 mb-4">
              {Object.keys(EMERGENCY_SERVICE_TYPES).map((type) => (
                <button
                  key={type}
                  onClick={() => setServiceType(type)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    serviceType === type
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">{EMERGENCY_SERVICE_TYPES[type].icon}</span>
                  {EMERGENCY_SERVICE_TYPES[type].label}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getServicesByType(serviceType).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No {EMERGENCY_SERVICE_TYPES[serviceType].label.toLowerCase()}s found nearby
                </p>
              ) : (
                getServicesByType(serviceType).map((service, index) => (
                  <div
                    key={index}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedService(service);
                      // Pan map to service location
                      const coords = service.location.coordinates;
                      if (coords) {
                        center.lat = coords[1];
                        center.lng = coords[0];
                      }
                    }}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {service.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {service.address}
                    </p>
                    {service.rating && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm ml-1">{service.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href="/report"
                className="block w-full text-center py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                🚨 Report Accident
              </a>
              <a
                href="/contacts"
                className="block w-full text-center py-3 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                👥 Manage Contacts
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
