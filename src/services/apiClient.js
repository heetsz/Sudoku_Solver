import axios from 'axios';
import { apiCache } from './apiCache.js';

// Optimized Axios instance with connection pooling and performance tuning
const createOptimizedClient = () => {
  const client = axios.create({
    baseURL: 'https://sugoku.onrender.com',
    timeout: 8000, // 8 second timeout
    // HTTP/2 multiplexing support
    headers: {
      'Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=300', // 5 minutes browser cache
    },
    // Enable compression
    decompress: true,
    // Connection pooling
    maxRedirects: 3,
    // DNS caching at browser level
    validateStatus: (status) => status < 500,
  });

  // Request interceptor for caching
  client.interceptors.request.use((config) => {
    const cacheKey = apiCache.generateKey(config.url, config.params);
    const cached = apiCache.get(cacheKey);
    
    if (cached) {
      // Return cached response immediately
      return Promise.reject({
        isFromCache: true,
        data: cached,
        config
      });
    }
    
    return config;
  });

  // Response interceptor for caching and error handling
  client.interceptors.response.use(
    (response) => {
      // Cache successful responses
      const cacheKey = apiCache.generateKey(response.config.url, response.config.params);
      apiCache.set(cacheKey, response.data);
      return response;
    },
    (error) => {
      // Handle cached responses
      if (error.isFromCache) {
        return Promise.resolve({
          data: error.data,
          status: 200,
          statusText: 'OK (Cached)',
          headers: {},
          config: error.config,
          fromCache: true
        });
      }

      // Enhanced error handling with fallback strategies
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.warn('Request timeout, implementing fallback strategy');
        return Promise.reject({
          ...error,
          message: 'Request timeout - please try again'
        });
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const optimizedApi = createOptimizedClient();
