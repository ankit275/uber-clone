import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8081';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS requests
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // CORS error handling
    if (error.message === 'Network Error' && !error.response) {
      console.error('CORS Error or Network Error:', error);
      console.warn('Ensure backend is running on http://localhost:8081 with CORS enabled');
      // You can show a user-friendly message here
      return Promise.reject({
        ...error,
        message: 'Cannot reach backend server. Ensure it\'s running on http://localhost:8081 and CORS is enabled.'
      });
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);