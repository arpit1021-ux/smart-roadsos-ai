export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

export const SEVERITY_LEVELS = {
  low: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-300' },
  medium: { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-300' },
  high: { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700 dark:text-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-300' }
};

export const ACCIDENT_STATUS = [
  { value: 'reported', label: 'Reported', color: 'bg-gray-500' },
  { value: 'enroute', label: 'En Route', color: 'bg-blue-500' },
  { value: 'arrived', label: 'Arrived', color: 'bg-indigo-500' },
  { value: 'transporting', label: 'Transporting', color: 'bg-purple-500' },
  { value: 'hospital', label: 'At Hospital', color: 'bg-emerald-500' },
  { value: 'closed', label: 'Closed', color: 'bg-slate-500' }
];

export const VEHICLE_TYPES = [
  'car', 'bike', 'motorcycle', 'truck', 'bus', 'bicycle', 'pedestrian'
];

export const CRASH_TYPES = [
  'single-vehicle',
  'rear-end',
  'side-impact',
  'head-on',
  'rollover',
  'pedestrian',
  'multi-vehicle'
];

export const EMERGENCY_SERVICE_TYPES = {
  hospital: { label: 'Hospital', icon: '🏥', color: '#EF4444' },
  police: { label: 'Police', icon: '🚔', color: '#3B82F6' },
  ambulance: { label: 'Ambulance', icon: '🚑', color: '#10B981' }
};
