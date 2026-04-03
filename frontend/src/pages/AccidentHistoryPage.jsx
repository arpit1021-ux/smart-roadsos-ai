import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accidentsAPI } from '../services/api';
import { ACCIDENT_STATUS, SEVERITY_LEVELS } from '../constants';
import useSocket from '../hooks/useSocket';

const AccidentHistoryPage = () => {
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '' });
  const [expandedAccident, setExpandedAccident] = useState(null);

  const { isConnected } = useSocket();

  useEffect(() => {
    fetchAccidents();
  }, [filter]);

  const fetchAccidents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.status) {
        params.status = filter.status;
      }
      const response = await accidentsAPI.getMyAccidents(params);
      setAccidents(response.accidents || []);
    } catch (error) {
      console.error('Failed to fetch accidents:', error);
      setAccidents([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedAccident(expandedAccident === id ? null : id);
  };

  const getStatusColor = (status) => {
    const statusObj = ACCIDENT_STATUS.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-500';
  };

  const getSeverityBadge = (severity) => {
    const info = SEVERITY_LEVELS[severity];
    const colorMap = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorMap[severity]}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Accident History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and track your accident reports
            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${isConnected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
              {isConnected ? '🟢 Live' : '🟡 Offline'}
            </span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Statuses</option>
            {ACCIDENT_STATUS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <Link
            to="/report"
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            + New Report
          </Link>
        </div>
      </div>

      {accidents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <span className="text-6xl">📋</span>
          <h2 className="text-xl font-semibold mt-4 text-gray-900 dark:text-white">
            No Accident Reports
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            You haven't reported any accidents yet
          </p>
          <Link
            to="/report"
            className="inline-block mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Report Your First Accident
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {accidents.map((accident) => (
            <div
              key={accident._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleExpanded(accident._id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getSeverityBadge(accident.severityPrediction.level)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(accident.status)}`}>
                        {accident.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {formatDate(accident.createdAt)}
                    </p>

                    {accident.address && (
                      <p className="text-gray-900 dark:text-white mt-2">
                        📍 {accident.address}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>🚗 {accident.vehicleType}</span>
                      <span>💥 {accident.crashType}</span>
                      {accident.speed > 0 && (
                        <span>⚡ {accident.speed} km/h</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Severity
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {(accident.severityPrediction.confidence * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                    <button className="text-2xl">
                      {expandedAccident === accident._id ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
              </div>

              {expandedAccident === accident._id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                    Accident Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Coordinates</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">
                        {accident.location.coordinates[1].toFixed(6)}, {accident.location.coordinates[0].toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Report ID</p>
                      <p className="font-mono text-sm text-gray-900 dark:text-white">
                        {accident._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nearest Hospital</p>
                      <p className="text-gray-900 dark:text-white">
                        {accident.nearestHospital?.name || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned Services</p>
                      {accident.assignedServices.length > 0 ? (
                        <ul className="space-y-1">
                          {accident.assignedServices.map((service, idx) => (
                            <li key={idx} className="text-sm text-gray-900 dark:text-white">
                              {service.type}: {service.serviceName} {service.eta ? `(ETA: ${service.eta} min)` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No services assigned</p>
                      )}
                    </div>
                  </div>

                  {accident.notes && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                      <p className="text-gray-900 dark:text-white">{accident.notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Link
                      to={`/dashboard`}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-medium hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      View on Map
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccidentHistoryPage;
