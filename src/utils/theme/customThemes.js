// File: src/utils/theme/themeUtils.js
/**
 * Pure Svarog-UI theme utilities
 * NO custom CSS - everything delegated to Svarog-UI component library
 */

import {
  switchToTheme,
  getActiveTheme,
  getAvailableThemes,
} from '../../integration/themeManager.js';
import { isDevelopment } from '../environment.js';

/**
 * Theme configuration for the application
 * Maps to actual Svarog-UI theme names
 */
export const THEME_CONFIG = {
  primary: 'muchandy',
  fallback: 'default',
  available: ['muchandy', 'default'], // Add 'cabalou' when available
};

/**
 * Initialize theme utilities
 */
export const initializeThemeUtils = () => {
  if (isDevelopment()) {
    console.log('🎨 Theme utilities initialized for pure Svarog-UI usage');

    // Expose utilities globally in development
    window.themeUtils = {
      switch: switchToTheme,
      getCurrent: getActiveTheme,
      getAvailable: getAvailableThemes,
      switchToMuchandy: () => switchToTheme('muchandy'),
      switchToDefault: () => switchToTheme('default'),
    };
  }
};

/**
 * Switch theme with validation
 * @param {string} themeName - Theme to switch to
 * @returns {boolean} Success status
 */
export const safeThemeSwitch = themeName => {
  const available = getAvailableThemes();

  if (!available.includes(themeName)) {
    console.warn(
      `Theme "${themeName}" not available. Available themes:`,
      available
    );
    return false;
  }

  return switchToTheme(themeName);
};

/**
 * Get theme for CMS component mapping
 * Ensures theme name is valid for Svarog-UI components
 * @param {string} cmsTheme - Theme from CMS
 * @returns {string} Valid Svarog-UI theme name
 */
export const mapCMSTheme = cmsTheme => {
  const themeMap = {
    muchandy: 'muchandy',
    default: 'default',
    cabalou: 'default', // Fallback until cabalou is available
    // Add more mappings as needed
  };

  return themeMap[cmsTheme] || THEME_CONFIG.primary;
};

/**
 * Reset to primary theme
 */
export const resetToPrimaryTheme = () => {
  return switchToTheme(THEME_CONFIG.primary);
};

// Export theme configuration
export { THEME_CONFIG as default };
