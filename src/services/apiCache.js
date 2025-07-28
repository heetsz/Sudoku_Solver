// API Caching Layer using Browser Storage + Memory Cache
class APICache {
  constructor() {
    this.memoryCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.maxMemoryEntries = 50;
  }

  // Generate cache key based on request parameters
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}?${sortedParams}`;
  }

  // Get from cache (memory first, then localStorage)
  get(key) {
    // Check memory cache first (fastest)
    if (this.memoryCache.has(key)) {
      const cached = this.memoryCache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.memoryCache.delete(key);
    }

    // Check localStorage (slower but persistent)
    try {
      const stored = localStorage.getItem(`sudoku_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < this.cacheTimeout) {
          // Move to memory cache for faster access
          this.memoryCache.set(key, parsed);
          return parsed.data;
        }
        localStorage.removeItem(`sudoku_cache_${key}`);
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }

    return null;
  }

  // Set cache (both memory and localStorage)
  set(key, data) {
    const cacheEntry = {
      data,
      timestamp: Date.now()
    };

    // Memory cache with LRU eviction
    if (this.memoryCache.size >= this.maxMemoryEntries) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
    this.memoryCache.set(key, cacheEntry);

    // Persistent storage
    try {
      localStorage.setItem(`sudoku_cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp >= this.cacheTimeout) {
        this.memoryCache.delete(key);
      }
    }

    // Clean localStorage
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sudoku_cache_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (now - parsed.timestamp >= this.cacheTimeout) {
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }
  }
}

export const apiCache = new APICache();

// Cleanup on app start and periodically
apiCache.cleanup();
setInterval(() => apiCache.cleanup(), 60000); // Clean every minute
