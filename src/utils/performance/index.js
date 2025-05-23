/**
 * Performance monitoring utilities
 * Provides comprehensive performance tracking and optimization tools
 */

/**
 * Performance measurement utility
 */
export const createPerformanceMonitor = () => {
  const measurements = new Map();

  return {
    start: (label) => {
      measurements.set(label, performance.now());
    },

    end: (label) => {
      const startTime = measurements.get(label);
      if (!startTime) {
        console.warn(`No start time found for: ${label}`);
        return 0;
      }

      const duration = performance.now() - startTime;
      measurements.delete(label);
      return duration;
    },

    measure: (label, fn) => {
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;

      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      return result;
    },

    measureAsync: async (label, fn) => {
      const start = performance.now();
      const result = await fn();
      const duration = performance.now() - start;

      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      return result;
    },
  };
};

/**
 * Debounce utility - prevents excessive function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * Throttle utility - limits function execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Efficient DOM batch operations
 * @param {Function} operations - Function containing DOM operations
 * @returns {*} Result of operations
 */
export const batchDOMUpdates = (operations) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      const result = operations();
      resolve(result);
    });
  });
};

/**
 * Resource pool for object reuse
 * @param {Function} factory - Factory function to create objects
 * @param {Function} reset - Function to reset objects
 * @returns {Object} Resource pool API
 */
export const createResourcePool = (factory, reset) => {
  const pool = [];

  return {
    acquire: () => {
      return pool.length > 0 ? reset(pool.pop()) : factory();
    },

    release: (object) => {
      if (pool.length < 100) {
        // Prevent unlimited growth
        pool.push(object);
      }
    },

    size: () => pool.length,
  };
};
