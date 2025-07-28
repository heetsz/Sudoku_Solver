// Request debouncing and batching utilities
export class RequestOptimizer {
  constructor() {
    this.pendingRequests = new Map();
    this.requestQueue = [];
    this.batchTimeout = null;
    this.batchDelay = 100; // 100ms batching window
  }

  // Debounce function to prevent rapid consecutive requests
  debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Throttle function to limit request frequency
  throttle(func, limit = 1000) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Request deduplication - prevent duplicate simultaneous requests
  async deduplicateRequest(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      // Return the existing promise for the same request
      return this.pendingRequests.get(key);
    }

    const promise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  // Intelligent retry with exponential backoff
  async retryWithBackoff(requestFn, maxRetries = 3, baseDelay = 1000) {
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) break;

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // Preload common requests
  async preloadData(requests) {
    const preloadPromises = requests.map(async (request) => {
      try {
        await request();
      } catch (error) {
        console.warn('Preload failed:', error);
      }
    });

    await Promise.allSettled(preloadPromises);
  }
}

export const requestOptimizer = new RequestOptimizer();
