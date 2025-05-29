// File: src/config/environment.js
/**
 * Environment configuration management
 * Centralizes all environment-specific settings and validation
 * Simplified - no theme switching logic
 */

/**
 * Environment types
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
};

/**
 * Gets current environment
 * @returns {string} Current environment
 */
export const getCurrentEnvironment = () => {
  return process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
};

/**
 * Checks if current environment matches
 * @param {string} env - Environment to check against
 * @returns {boolean} True if environment matches
 */
export const isEnvironment = env => {
  return getCurrentEnvironment() === env;
};

/**
 * Safe environment variable getter
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value
 * @returns {*} Environment variable value or default
 */
const getEnvVar = (key, defaultValue) => {
  const envVars = {
    VITE_STORYBLOK_TOKEN: process.env.VITE_STORYBLOK_TOKEN,
    VITE_STORYBLOK_VERSION: process.env.VITE_STORYBLOK_VERSION,
    VITE_STORYBLOK_SPACE_ID: process.env.VITE_STORYBLOK_SPACE_ID,
    VITE_STORYBLOK_REGION: process.env.VITE_STORYBLOK_REGION,
    VITE_BASE_URL: process.env.VITE_BASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  return envVars[key] !== undefined ? envVars[key] : defaultValue;
};

/**
 * Environment-specific configuration
 */
const environmentConfig = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    storyblok: {
      version: 'draft',
      cache: false,
      enablePreview: true,
    },
    performance: {
      enableMonitoring: true,
      logLevel: 'debug',
    },
    debug: {
      showErrors: true,
      exposeDebugTools: true,
    },
  },

  [ENVIRONMENTS.STAGING]: {
    storyblok: {
      version: 'draft',
      cache: true,
      enablePreview: true,
    },
    performance: {
      enableMonitoring: true,
      logLevel: 'info',
    },
    debug: {
      showErrors: true,
      exposeDebugTools: false,
    },
  },

  [ENVIRONMENTS.PRODUCTION]: {
    storyblok: {
      version: 'published',
      cache: true,
      enablePreview: false,
    },
    performance: {
      enableMonitoring: true,
      logLevel: 'error',
    },
    debug: {
      showErrors: false,
      exposeDebugTools: false,
    },
  },

  [ENVIRONMENTS.TEST]: {
    storyblok: {
      version: 'draft',
      cache: false,
      enablePreview: false,
    },
    performance: {
      enableMonitoring: false,
      logLevel: 'silent',
    },
    debug: {
      showErrors: true,
      exposeDebugTools: false,
    },
  },
};

/**
 * Gets configuration for current environment
 * @returns {Object} Environment configuration
 */
export const getEnvironmentConfig = () => {
  const env = getCurrentEnvironment();
  return environmentConfig[env] || environmentConfig[ENVIRONMENTS.DEVELOPMENT];
};

/**
 * Storyblok configuration
 */
export const getStoryblokConfig = () => {
  const token = getEnvVar('VITE_STORYBLOK_TOKEN');
  const spaceId = getEnvVar('VITE_STORYBLOK_SPACE_ID');
  const region = getEnvVar('VITE_STORYBLOK_REGION', 'eu');

  const envConfig = getEnvironmentConfig();

  if (!token || token === 'your_preview_token_here') {
    const env = getCurrentEnvironment();
    if (env === ENVIRONMENTS.DEVELOPMENT || env === ENVIRONMENTS.TEST) {
      console.warn(
        '⚠️ VITE_STORYBLOK_TOKEN not configured - using demo configuration'
      );
      return {
        accessToken: 'demo_token',
        spaceId: 'demo_space',
        region,
        version: envConfig.storyblok.version,
        cache: envConfig.storyblok.cache,
        enablePreview: envConfig.storyblok.enablePreview,
        isDemo: true,
      };
    }
    throw new Error('VITE_STORYBLOK_TOKEN is required in production');
  }

  return {
    accessToken: token,
    spaceId,
    region,
    version: getEnvVar('VITE_STORYBLOK_VERSION', envConfig.storyblok.version),
    cache: envConfig.storyblok.cache,
    enablePreview: envConfig.storyblok.enablePreview,
    isDemo: false,
  };
};

/**
 * Application configuration
 */
export const getAppConfig = () => {
  const envConfig = getEnvironmentConfig();

  return {
    baseURL: getEnvVar('VITE_BASE_URL', 'http://localhost:3000'),
    apiTimeout: 10000,
    maxRetries: 3,
    enableAnalytics: isEnvironment(ENVIRONMENTS.PRODUCTION),
    ...envConfig,
  };
};

/**
 * Performance configuration
 */
export const getPerformanceConfig = () => {
  const envConfig = getEnvironmentConfig();

  return {
    cacheMaxAge: 300000, // 5 minutes
    componentCacheSize: 100,
    enableProfiling: envConfig.performance.enableMonitoring,
    logLevel: envConfig.performance.logLevel,
    targets: {
      LCP: 2500,
      FID: 100,
      CLS: 0.1,
      TTFB: 600,
    },
  };
};

/**
 * Debug configuration
 */
export const getDebugConfig = () => {
  const envConfig = getEnvironmentConfig();

  return {
    showErrors: envConfig.debug.showErrors,
    exposeDebugTools: envConfig.debug.exposeDebugTools,
    enableConsoleLogging: !isEnvironment(ENVIRONMENTS.PRODUCTION),
  };
};

/**
 * Validates required environment variables
 * @returns {Object} Validation result
 */
export const validateEnvironment = () => {
  const token = getEnvVar('VITE_STORYBLOK_TOKEN');
  const env = getCurrentEnvironment();

  const result = {
    isValid: true,
    missing: [],
    warnings: [],
  };

  if (!token || token === 'your_preview_token_here') {
    if (env === ENVIRONMENTS.PRODUCTION) {
      result.isValid = false;
      result.missing.push('VITE_STORYBLOK_TOKEN');
    } else {
      result.warnings.push(
        'VITE_STORYBLOK_TOKEN not set - using demo configuration'
      );
    }
  } else {
    if (!token.match(/^[a-zA-Z0-9_-]+$/)) {
      result.warnings.push('VITE_STORYBLOK_TOKEN format appears invalid');
    }
  }

  return result;
};

/**
 * Gets feature flags for current environment
 * @returns {Object} Feature flags
 */
export const getFeatureFlags = () => {
  const env = getCurrentEnvironment();

  return {
    enableLivePreview:
      env === ENVIRONMENTS.DEVELOPMENT || env === ENVIRONMENTS.STAGING,
    enablePerformanceMonitoring: env !== ENVIRONMENTS.TEST,
    enableErrorReporting: env === ENVIRONMENTS.PRODUCTION,
    enableDebugPanel: env === ENVIRONMENTS.DEVELOPMENT,
    enableHotReload: env === ENVIRONMENTS.DEVELOPMENT,
  };
};
