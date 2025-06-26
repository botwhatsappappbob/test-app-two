import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('foodsaver_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('foodsaver_token');
      localStorage.removeItem('foodsaver_user');
      // Redirect to login or refresh page
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string, userType: string) =>
    api.post('/auth/register', { email, password, name, userType }),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  upgradeSubscription: () =>
    api.post('/auth/upgrade'),
};

// Food Items API
export const foodItemsAPI = {
  getAll: () =>
    api.get('/food-items'),
  
  create: (item: any) =>
    api.post('/food-items', item),
  
  update: (id: string, updates: any) =>
    api.put(`/food-items/${id}`, updates),
  
  delete: (id: string) =>
    api.delete(`/food-items/${id}`),
  
  consume: (id: string, quantity?: number) =>
    api.post(`/food-items/${id}/consume`, { quantity }),
  
  getExpiring: (days: number) =>
    api.get(`/food-items/expiring/${days}`),
};

// Recipes API
export const recipesAPI = {
  getAll: () =>
    api.get('/recipes'),
  
  getRecommendations: () =>
    api.get('/recipes/recommendations'),
  
  getById: (id: string) =>
    api.get(`/recipes/${id}`),
};

// Donations API
export const donationsAPI = {
  getAll: () =>
    api.get('/donations'),
  
  create: (donation: any) =>
    api.post('/donations', donation),
  
  updateStatus: (id: string, status: string) =>
    api.put(`/donations/${id}/status`, { status }),
};

// Food Banks API
export const foodBanksAPI = {
  getAll: (params?: any) =>
    api.get('/food-banks', { params }),
  
  getNearby: (lat: number, lng: number, radius?: number) =>
    api.get('/food-banks/nearby', { params: { lat, lng, radius } }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () =>
    api.get('/analytics'),
  
  getWasteReport: (period?: number) =>
    api.get('/analytics/waste-report', { params: { period } }),
};