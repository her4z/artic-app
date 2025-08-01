import axios, { AxiosError, AxiosResponse } from 'axios';

// API Configuration
const API_CONFIG = {
  baseURL: 'https://api.artic.edu/api/v1',
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
} as const;

// Cache interface
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Simple in-memory cache
const cache = new Map<string, CacheEntry>();

// Cache utility functions
const cacheUtils = {
  generateKey: (config: any): string => {
    const { method, url, params } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  },

  get: (key: string): any | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  },

  set: (key: string, data: any): void => {
    const expiresAt = Date.now() + API_CONFIG.cacheExpiry;
    cache.set(key, { data, timestamp: Date.now(), expiresAt });
  },

  clear: (): void => {
    cache.clear();
  },

  size: (): number => {
    return cache.size;
  },
};

export const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for caching and logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

    // Check cache for GET requests
    if (config.method?.toLowerCase() === 'get') {
      const cacheKey = cacheUtils.generateKey(config);
      const cachedData = cacheUtils.get(cacheKey);

      if (cachedData) {
        console.log(`[API Cache] Hit for ${config.url}`);
        // Return cached response
        return Promise.reject({
          __cached: true,
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      }
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  },
);

// Response interceptor with caching, retry logic, and logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`);

    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
      const cacheKey = cacheUtils.generateKey(response.config);
      cacheUtils.set(cacheKey, response.data);
      console.log(`[API Cache] Stored ${response.config.url}`);
    }

    return response;
  },
  async (error: AxiosError | any) => {
    // Handle cached responses
    if (error.__cached) {
      console.log(`[API Cache] Serving cached response for ${error.config.url}`);
      return error;
    }

    const { config, response } = error;

    // Log the error
    console.error('[API Error]', {
      url: config?.url,
      method: config?.method,
      status: response?.status,
      data: response?.data,
      message: error.message,
    });

    // Retry logic for network errors (not 4xx/5xx errors)
    if (!response && config) {
      const retryCount = config.retryCount || 0;

      if (retryCount < API_CONFIG.retries) {
        config.retryCount = retryCount + 1;

        console.log(`[API Retry] Attempt ${config.retryCount}/${API_CONFIG.retries}`);

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, API_CONFIG.retryDelay));

        return api(config);
      }
    }

    throw error;
  },
);

// Type for retry configuration
declare module 'axios' {
  interface AxiosRequestConfig {
    retryCount?: number;
  }
}

// Export cache utilities for manual cache management
export const cacheManager = {
  clear: cacheUtils.clear,
  size: cacheUtils.size,
  get: cacheUtils.get,
  set: cacheUtils.set,
};
