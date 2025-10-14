import axios from 'axios';

// Performance monitoring
const performanceMonitor = {
  requestStartTime: new Map(),
  
  startTiming: (requestId) => {
    performanceMonitor.requestStartTime.set(requestId, performance.now());
  },
  
  endTiming: (requestId, endpoint) => {
    const startTime = performanceMonitor.requestStartTime.get(requestId);
    if (startTime) {
      const duration = performance.now() - startTime;
      
      // Log slow requests (>2s)
      if (duration > 2000) {
        console.warn(`Slow API request detected: ${endpoint} took ${duration.toFixed(2)}ms`);
      }
      
      performanceMonitor.requestStartTime.delete(requestId);
    }
  }
};

// Create optimized axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor for performance monitoring and auth
api.interceptors.request.use(
  (config) => {
    // Add performance monitoring
    const requestId = Math.random().toString(36).substring(7);
    config.metadata = { requestId, startTime: performance.now() };
    
    // Add auth token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for performance monitoring and error handling
api.interceptors.response.use(
  (response) => {
    // Performance monitoring
    if (response.config.metadata) {
      const { requestId, startTime } = response.config.metadata;
      const duration = performance.now() - startTime;
      
      // Log performance metrics in development
      if (import.meta.env.DEV) {
        console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration.toFixed(2)}ms`);
      }
    }
    
    return response;
  },
  (error) => {
    // Performance monitoring for errors
    if (error.config?.metadata) {
      const { startTime } = error.config.metadata;
      const duration = performance.now() - startTime;
      
      if (import.meta.env.DEV) {
        console.error(`API Error ${error.config.method?.toUpperCase()} ${error.config.url}: ${duration.toFixed(2)}ms`, error);
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle validation errors
    if (error.response?.status === 422) {
      const message = error.response.data?.message || 'Validation error';
      const errors = error.response.data?.errors || {};
      return Promise.reject({ message, errors, status: 422 });
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    return Promise.reject(error);
  }
);

// Optimized API methods with caching
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = apiCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  apiCache.set(key, { data, timestamp: Date.now() });
};

// Enhanced API service
const apiService = {
  // Auth methods
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),

  // Transaction methods with caching
  getTransactions: async (params = {}) => {
    const cacheKey = `transactions_${JSON.stringify(params)}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return { data: cached };
    }
    
    const response = await api.get('/transactions', { params });
    setCachedData(cacheKey, response.data);
    return response;
  },

  createTransaction: async (data) => {
    // Clear transaction cache after create
    Array.from(apiCache.keys())
      .filter(key => key.startsWith('transactions_'))
      .forEach(key => apiCache.delete(key));
    
    return api.post('/transactions', data);
  },

  updateTransaction: async (id, data) => {
    // Clear transaction cache after update
    Array.from(apiCache.keys())
      .filter(key => key.startsWith('transactions_'))
      .forEach(key => apiCache.delete(key));
    
    return api.put(`/transactions/${id}`, data);
  },

  deleteTransaction: async (id) => {
    // Clear transaction cache after delete
    Array.from(apiCache.keys())
      .filter(key => key.startsWith('transactions_'))
      .forEach(key => apiCache.delete(key));
    
    return api.delete(`/transactions/${id}`);
  },

  // Transaction Groups methods
  getTransactionGroups: async (params = {}) => {
    const cacheKey = `transaction_groups_${JSON.stringify(params)}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return { data: cached };
    }
    
    const response = await api.get('/transaction-groups', { params });
    setCachedData(cacheKey, response.data);
    return response;
  },

  createTransactionGroup: async (data) => {
    // Clear cache after create
    Array.from(apiCache.keys())
      .filter(key => key.startsWith('transaction_groups_'))
      .forEach(key => apiCache.delete(key));
    
    return api.post('/transaction-groups', data);
  },

  updateTransactionGroup: async (id, data) => {
    // Clear cache after update
    Array.from(apiCache.keys())
      .filter(key => key.startsWith('transaction_groups_'))
      .forEach(key => apiCache.delete(key));
    
    return api.put(`/transaction-groups/${id}`, data);
  },

  deleteTransactionGroup: async (id) => {
    // Clear cache after delete
    Array.from(apiCache.keys())
      .filter(key => key.startsWith('transaction_groups_'))
      .forEach(key => apiCache.delete(key));
    
    return api.delete(`/transaction-groups/${id}`);
  },

  // Statistics with caching
  getStatistics: async () => {
    const cacheKey = 'statistics';
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return { data: cached };
    }
    
    const response = await api.get('/transactions/statistics');
    setCachedData(cacheKey, response.data);
    return response;
  },

  // Clear all cache
  clearCache: () => {
    apiCache.clear();
  }
};

export default api;
export { apiService };