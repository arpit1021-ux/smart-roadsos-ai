import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (updates) => api.put('/auth/profile', updates)
};

// Contacts API
export const contactsAPI = {
  getAll: () => api.get('/contacts'),
  add: (contactData) => api.post('/contacts', contactData),
  update: (id, contactData) => api.put(`/contacts/${id}`, contactData),
  delete: (id) => api.delete(`/contacts/${id}`)
};

// Accidents API
export const accidentsAPI = {
  report: (accidentData) => api.post('/accidents', accidentData),
  getMyAccidents: (params) => api.get('/accidents', { params }),
  getAccident: (id) => api.get(`/accidents/${id}`),
  updateStatus: (id, status) => api.put(`/accidents/${id}/status`, { status }),
  getNearby: (params) => api.get('/accidents/nearby', { params })
};

// Services API
export const servicesAPI = {
  getNearby: (params) => api.get('/services/nearby', { params }),
  calculateRoute: (params) => api.get('/services/route', { params }),
  cacheServices: (data) => api.post('/services/cache', data)
};

export default api;
