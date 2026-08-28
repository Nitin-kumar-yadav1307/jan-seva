import axios from 'axios';

// In single-origin deployments (API serves the built SPA) '/api' works as-is.
// For split deployments, set VITE_API_URL (e.g. https://janseva-api.onrender.com/api) at build time.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coopseva_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
