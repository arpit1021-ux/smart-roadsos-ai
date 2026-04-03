import { useState, useEffect } from 'react';
import MapView from '../components/MapView';
import { accidentsAPI, servicesAPI } from '../services/api';
import { useSocket } from '../hooks/useSocket';
import { SEVERITY_LEVELS, ACCIDENT_STATUS } from '../constants';

const AdminDashboardPage = () => {
  const [allAccidents, setAllAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    enroute: 0,
    arrived: 0
  });

  const { isConnected, onUpdate } = useSocket();

  useEffect(() => {
    fetchAllAccidents();

    // Setup WebSocket listener
    onUpdate((data) => {
      console.log('Admin dashboard update:', data);
      fetchAllAccidents();
    });
  }, []);

  const fetchAllAccidents = async () => {
    try {
      // For now, get recent accidents (no admin endpoint exists yet)
      // In production, you'd have a separate admin endpoint with broader permissions
      const response = await accidentsAPI.getNearby({ lat: 0, lng: 0, radius: 180 });
      const accidents = response.accidents || [];

      setAllAccidents(accidents);

      // Calculate stats
      const newStats = {
        total: accidents.length,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        enroute: 0,
        arrived: 0
      };

      accidents.forEach(acc => {
        if (acc.severityPrediction?.level) {
          newStats[acc.severityPrediction.level]++;
        }
        if (acc.status === 'enroute') newStats.enroute++;
        if (acc.status === 'arrived') newStats.arrived++;
      });

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch accidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (accidentId, newStatus) => {
    try {
      await accidentsAPI.updateStatus(accidentId, newStatus);
      fetchAllAccidents();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert(`Failed to update status: ${error.message}`);
    }
  };

  const getMarkers = () => {
    return allAccidents.map(accident => ({
      type: 'accident',
      location: {
        lat: accident.location.coordinates[1],
        lng: accident.location.coordinates[0]
      },
      title: `${accident.severityPrediction.level} - ${accident.status}`,
      isAccident: true,
      info: `
        <div class="p-2">
          <h3 class="font-bold text-red-600">Accident Report</h3>
          <p class="text-sm">Severity: ${accident.severityPrediction.level}</p>
          <p class="text-sm">Status: ${accident.status}</p>
          <p class="text-sm">Time: ${new Date(accident.createdAt).toLocaleTimeString()}</p>
        </div>
      `
    }));
  };

  const getMarkersForSelected = () => {
    if (!selectedAccident) return [];
    return [{
      type: 'accident',
      location: {
        lat: selectedAccident.location.coordinates[1],
        lng: selectedAccident.location.coordinates[0]
      },
      title: 'Selected Accident',
      isAccident: true
    }];
  };

  const center = selectedAccident
    ? { lat: selectedAccident.location.coordinates[1], lng: selectedAccident.location.coordinates[0] }
    : { lat: 0, lng: 0 };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Emergency Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time overview of all accidents
            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
              {isConnected ? '🟢 Live' : '🟡 Offline'}
            </span>
          </p>
        </div>

        <button
          onClick={fetchAllAccidents}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Critical</p>
          <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
          <p className="text-3xl font-bold text-orange-600">{stats.high}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Medium</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.medium}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">En Route</p>
          <p className="text-3xl font-bold text-blue-600">{stats.enroute}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Arrived</p>
          <p className="text-3xl font-bold text-green-600">{stats.arrived}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              All Incidents ({allAccidents.length})
            </h2>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {allAccidents.map(accident => (
                  <div
                    key={accident._id}
                    onClick={() => setSelectedAccident(accident)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedAccident?._id === accident._id
                        ? 'border-red-600 bg-red-50 dark:bg-red-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {accident.severityPrediction.level.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(accident.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(accident.status)}`}>
                        {accident.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
                      {accident.address || 'No address'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Incident Map
            </h2>
            <MapView
              center={center}
              zoom={10}
              markers={selectedAccident ? [...getMarkers(), ...getMarkersForSelected()] : getMarkers()}
              style={{ height: '500px' }}
            />
          </div>
        </div>
      </div>

      {/* Selected Accident Actions */}
      {selectedAccident && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Manage Incident
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500 dark:text-gray-400">Severity:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-white text-xs ${SEVERITY_LEVELS[selectedAccident.severityPrediction.level]?.color}`}>
                    {selectedAccident.severityPrediction.level.toUpperCase()}
                  </span>
                </p>
                <p><span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedAccident.vehicleType}</span>
                </p>
                <p><span className="text-gray-500 dark:text-gray-400">Crash Type:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedAccident.crashType}</span>
                </p>
                <p><span className="text-gray-500 dark:text-gray-400">Speed:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{selectedAccident.speed || 'N/A'} km/h</span>
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Status</h3>
              <div className="space-y-2">
                <select
                  value={selectedAccident.status}
                  onChange={(e) => updateStatus(selectedAccident._id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  {ACCIDENT_STATUS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Change status to track emergency response
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => window.open(`/accident/${selectedAccident._id}`, '_blank')}
                  className="w-full px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  View Full Details
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Accident Report',
                        text: `Accident at ${selectedAccident.address || 'location'}`,
                        url: `${window.location.origin}/accident/${selectedAccident._id}`
                      });
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg font-medium hover:bg-green-200 dark:hover:bg-green-800"
                >
                  Share Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
