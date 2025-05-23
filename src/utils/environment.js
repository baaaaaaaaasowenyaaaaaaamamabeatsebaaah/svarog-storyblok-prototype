/**
 * Environment detection utility
 * Provides consistent environment checks across the application
 */

/**
 * Checks if the current environment is development
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  try {
    return import.meta.env.MODE === 'development';
  } catch {
    return process.env.NODE_ENV === 'development';
  }
};

/**
 * Checks if the current environment is production
 * @returns {boolean} True if in production mode
 */
export const isProduction = () => {
  try {
    return import.meta.env.MODE === 'production';
  } catch {
    return process.env.NODE_ENV === 'production';
  }
};

/**
 * Checks if the current environment is test
 * @returns {boolean} True if in test mode
 */
export const isTest = () => {
  try {
    return import.meta.env.MODE === 'test';
  } catch {
    return process.env.NODE_ENV === 'test';
  }
};

/**
 * Gets the current environment mode
 * @returns {string} Current environment mode
 */
export const getEnvironment = () => {
  try {
    return import.meta.env.MODE || 'development';
  } catch {
    return process.env.NODE_ENV || 'development';
  }
};

/**
 * Gets an environment variable value
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Environment variable value or default
 */
export const getEnvVar = (key, defaultValue = undefined) => {
  try {
    // Try Vite environment variables first
    if (import.meta.env[key] !== undefined) {
      return import.meta.env[key];
    }
  } catch {
    // Fallback to process.env for Node environments
  }

  if (process.env[key] !== undefined) {
    return process.env[key];
  }

  return defaultValue;
};

/**
 * Checks if code is running in browser
 * @returns {boolean} True if in browser environment
 */
export const isBrowser = () => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Checks if code is running in Node.js
 * @returns {boolean} True if in Node environment
 */
export const isNode = () => {
  return (
    typeof process !== 'undefined' && process.versions && process.versions.node
  );
};

/**
 * Safe console logger that only logs in development
 * @param {...any} args - Arguments to log
 */
export const devLog = (...args) => {
  if (isDevelopment()) {
    console.log(...args);
  }
};

/**
 * Safe console warning that only warns in development
 * @param {...any} args - Arguments to warn
 */
export const devWarn = (...args) => {
  if (isDevelopment()) {
    console.warn(...args);
  }
};

/**
 * Safe console error logger
 * @param {...any} args - Arguments to error
 */
export const devError = (...args) => {
  if (isDevelopment()) {
    console.error(...args);
  } else {
    // In production, you might want to send to error tracking service
    console.error(...args);
  }
};
