import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import { useGeolocation } from '../hooks/useGeolocation';
import { accidentsAPI } from '../services/api';
import { VEHICLE_TYPES, CRASH_TYPES, SEVERITY_LEVELS } from '../constants';

const ReportAccidentPage = () => {
  const navigate = useNavigate();
  const { latitude, longitude, loading: geoLoading, getCurrentPosition } = useGeolocation();

  const [formData, setFormData] = useState({
    speed: '',
    vehicleType: 'car',
    crashType: 'single-vehicle',
    address: ''
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [success, setSuccess] = useState(null);
  const [accidentId, setAccidentId] = useState(null);

  useEffect(() => {
    if (latitude && longitude) {
      setSelectedLocation({ latitude, longitude });
    }
  }, [latitude, longitude]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear prediction when form changes
    if (prediction) {
      setPrediction(null);
    }
  };

  const handleMapClick = (coords) => {
    setSelectedLocation(coords);
  };

  const handleGetLocation = () => {
    getCurrentPosition();
  };

  const calculateDistance = () => {
    if (!selectedLocation) return null;
    return 0.5; // Placeholder for demo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert('Please select a location on the map or enable GPS');
      return;
    }

    setSubmitting(true);

    try {
      const response = await accidentsAPI.reportAccident({
        ...formData,
        location: selectedLocation,
        speed: parseFloat(formData.speed) || 0
      });

      setSuccess(true);
      setAccidentId(response.accident._id);
      setPrediction({
        level: response.accident.severityPrediction.level,
        confidence: response.accident.severityPrediction.confidence
      });
    } catch (error) {
      alert(`Failed to report accident: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityInfo = (level) => {
    return SEVERITY_LEVELS[level] || SEVERITY_LEVELS.medium;
  };

  const markers = selectedLocation ? [
    {
      type: 'accident',
      location: selectedLocation,
      title: 'Reported Accident',
      isAccident: true,
      info: `<div><h3 class="font-bold">Accident Location</h3></div>`
    }
  ] : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Report Accident
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          One-click emergency reporting with AI-powered severity prediction
        </p>
      </div>

      {success ? (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-xl p-6">
          <div className="text-center">
            <span className="text-6xl">✅</span>
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mt-4">
              Accident Reported Successfully!
            </h2>
            <p className="text-green-700 dark:text-green-300 mt-2">
              Emergency contacts have been notified. Your reference ID: <strong>{accidentId}</strong>
            </p>

            {prediction && (
              <div className="mt-6 inline-block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-2">AI Severity Assessment</h3>
                <div className={`inline-block px-4 py-2 rounded-full text-white font-bold ${getSeverityInfo(prediction.level).color}`}>
                  {prediction.level.toUpperCase()}
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </p>
              </div>
            )}

            <div className="mt-8 space-x-4">
              <button
                onClick={() => navigate('/history')}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                View History
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setPrediction(null);
                  setSelectedLocation(null);
                }}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg"
              >
                Report Another
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>🚗 Vehicle Type</span>
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  {VEHICLE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>💥 Crash Type</span>
                </label>
                <select
                  name="crashType"
                  value={formData.crashType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  {CRASH_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>⚡ Speed (km/h)</span>
                </label>
                <input
                  type="number"
                  name="speed"
                  value={formData.speed}
                  onChange={handleChange}
                  placeholder="Enter approximate speed"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>📍 Location</span>
                </label>
                {selectedLocation ? (
                  <div className="text-sm text-green-600 dark:text-green-400">
                    ✅ Location selected
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click on the map or use GPS below
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <span>📝 Additional Notes</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the accident location, injuries, etc."
                />
              </div>

              {/* AI Prediction Display */}
              {prediction && (
                <div className={`p-4 rounded-lg border-2 ${getSeverityInfo(prediction.level).textColor.replace('text', 'border')}`}>
                  <h3 className="font-semibold mb-2">🤖 AI Severity Assessment</h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-4 py-2 rounded-full text-white font-bold ${getSeverityInfo(prediction.level).color}`}>
                      {prediction.level.toUpperCase()}
                    </span>
                    <span className="text-sm">
                      Confidence: {(prediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={submitting || !selectedLocation}
                  className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Reporting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🚨</span>
                      Report Emergency
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoLoading}
                  className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
                >
                  {geoLoading ? 'Getting location...' : '📍 Use My GPS Location'}
                </button>
              </div>
            </form>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Select Accident Location
              </h2>
              <MapView
                center={selectedLocation || { lat: latitude || 0, lng: longitude || 0 }}
                zoom={13}
                markers={markers}
                onMapClick={handleMapClick}
                style={{ height: '400px' }}
              />
              {selectedLocation && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Click on the map to adjust location
                </p>
              )}
            </div>

            {/* Emergency Tips */}
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Emergency Guidelines
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Stay calm and move to a safe location if possible</li>
                <li>• Turn on hazard lights</li>
                <li>• Check for injuries - do not move seriously injured people</li>
                <li>• Call emergency services if you haven't already</li>
                <li>• Exchange information with other parties</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportAccidentPage;
