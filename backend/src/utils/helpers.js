const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
};

const formatDuration = (seconds) => {
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  if (seconds >= 60) {
    return `${Math.floor(seconds / 60)} min`;
  }
  return `${Math.round(seconds)} sec`;
};

const getSeverityColor = (severity) => {
  const colors = {
    low: '#10B981', // green
    medium: '#F59E0B', // yellow/orange
    high: '#F97316', // orange
    critical: '#EF4444' // red
  };
  return colors[severity] || '#6B7280';
};

const getStatusLabel = (status) => {
  const labels = {
    reported: 'Reported',
    enroute: 'En Route',
    arrived: 'Arrived',
    transporting: 'Transporting',
    hospital: 'At Hospital',
    closed: 'Closed'
  };
  return labels[status] || status;
};

const generateReferenceNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RDS-${timestamp}-${random}`;
};

const parseCoordinates = (coords) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return null;
  }
  return {
    longitude: coords[0],
    latitude: coords[1]
  };
};

const sanitizePhoneNumber = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters except +
  return phone.replace(/[^\d+]/g, '');
};

const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
};

module.exports = {
  formatDistance,
  formatDuration,
  getSeverityColor,
  getStatusLabel,
  generateReferenceNumber,
  parseCoordinates,
  sanitizePhoneNumber,
  isValidCoordinates
};
