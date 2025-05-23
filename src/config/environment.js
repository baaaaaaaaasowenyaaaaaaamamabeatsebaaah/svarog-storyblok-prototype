/**
 * Environment configuration management
 * Centralizes all environment-specific settings and validation
 */

/**
 * Environment types
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
};

/**
 * Gets current environment
 * @returns {string} Current environment
 */
export const getCurrentEnvironment = () => {
  return import.meta.env.MODE || process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT;
};

/**
 * Checks if current environment matches
 * @param {string} env - Environment to check against
 * @returns {boolean} True if environment matches
 */
export const isEnvironment = (env) => {
  return getCurrentEnvironment() === env;
};

/**
 * Environment-specific configuration
 */
const environmentConfig = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    storyblok: {
      version: 'draft',
      cache: false,
      enablePreview: true
    },
    performance: {
      enableMonitoring: true,
      logLevel: 'debug'
    },
    debug: {
      showErrors: true,
      enableThemeSwitcher: true,
      exposeDebugTools: true
    }
  },

  [ENVIRONMENTS.STAGING]: {
    storyblok: {
      version: 'draft',
      cache: true,
      enablePreview: true
    },
    performance: {
      enableMonitoring: true,
      logLevel: 'info'
    },
    debug: {
      showErrors: true,
      enableThemeSwitcher: false,
      exposeDebugTools: false
    }
  },

  [ENVIRONMENTS.PRODUCTION]: {
    storyblok: {
      version: 'published',
      cache: true,
      enablePreview: false
    },
    performance: {
      enableMonitoring: true,
      logLevel: 'error'
    },
    debug: {
      showErrors: false,
      enableThemeSwitcher: false,
      exposeDebugTools: false
    }
  },

  [ENVIRONMENTS.TEST]: {
    storyblok: {
      version: 'draft',
      cache: false,
      enablePreview: false
    },
    performance: {
      enableMonitoring: false,
      logLevel: 'silent'
    },
    debug: {
      showErrors: true,
      enableThemeSwitcher: false,
      exposeDebugTools: false
    }
  }
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
  const token = import.meta.env.VITE_STORYBLOK_TOKEN || process.env.VITE_STORYBLOK_TOKEN;
  const spaceId = import.meta.env.VITE_STORYBLOK_SPACE_ID || process.env.VITE_STORYBLOK_SPACE_ID;
  const region = import.meta.env.VITE_STORYBLOK_REGION || process.env.VITE_STORYBLOK_REGION || 'eu';
  
  const envConfig = getEnvironmentConfig();

  if (!token) {
    throw new Error('VITE_STORYBLOK_TOKEN is required');
  }

  return {
    accessToken: token,
    spaceId,
    region,
    version: import.meta.env.VITE_STORYBLOK_VERSION || envConfig.storyblok.version,
    cache: envConfig.storyblok.cache,
    enablePreview: envConfig.storyblok.enablePreview
  };
};

/**
 * Application configuration
 */
export const getAppConfig = () => {
  const envConfig = getEnvironmentConfig();

  return {
    baseURL: import.meta.env.VITE_BASE_URL || window.location.origin,
    apiTimeout: 10000,
    maxRetries: 3,
    defaultTheme: 'default',
    enableAnalytics: isEnvironment(ENVIRONMENTS.PRODUCTION),
    ...envConfig
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
      LCP: 2500, // Largest Contentful Paint
      FID: 100,  // First Input Delay
      CLS: 0.1,  // Cumulative Layout Shift
      TTFB: 600  // Time to First Byte
    }
  };
};

/**
 * Debug configuration
 */
export const getDebugConfig = () => {
  const envConfig = getEnvironmentConfig();

  return {
    showErrors: envConfig.debug.showErrors,
    enableThemeSwitcher: envConfig.debug.enableThemeSwitcher,
    exposeDebugTools: envConfig.debug.exposeDebugTools,
    enableConsoleLogging: !isEnvironment(ENVIRONMENTS.PRODUCTION)
  };
};

/**
 * Validates required environment variables
 * @throws {Error} If required variables are missing
 */
export const validateEnvironment = () => {
  const required = ['VITE_STORYBLOK_TOKEN'];
  const missing = required.filter(key => 
    !import.meta.env[key] && !process.env[key]
  );

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate Storyblok token format
  const token = import.meta.env.VITE_STORYBLOK_TOKEN || process.env.VITE_STORYBLOK_TOKEN;
  if (token && !token.match(/^[a-zA-Z0-9_-]+$/)) {
    console.warn('Storyblok token format appears invalid');
  }
};

/**
 * Gets feature flags for current environment
 * @returns {Object} Feature flags
 */
export const getFeatureFlags = () => {
  const env = getCurrentEnvironment();
  
  return {
    enableLivePreview: env === ENVIRONMENTS.DEVELOPMENT || env === ENVIRONMENTS.STAGING,
    enablePerformanceMonitoring: env !== ENVIRONMENTS.TEST,
    enableErrorReporting: env === ENVIRONMENTS.PRODUCTION,
    enableDebugPanel: env === ENVIRONMENTS.DEVELOPMENT,
    enableHotReload: env === ENVIRONMENTS.DEVELOPMENT
  };
};