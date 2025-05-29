// src/integration/themeManager.js

/**
 * @fileoverview Simple Muchandy Theme Manager
 * Applies ONLY the muchandy theme from Svarog-UI
 * No theme switching, no utilities, just muchandy theme application
 */

import muchandyTheme from '@svarog-ui/theme-muchandy';
import { registerTheme, switchTheme } from 'svarog-ui';
import { isDevelopment } from '../utils/environment.js';

/**
 * Initialize the muchandy theme - one time setup
 */
export const initializeTheme = () => {
  try {
    // Register only the muchandy theme
    registerTheme('muchandy', muchandyTheme);

    // Apply muchandy theme
    switchTheme('muchandy');

    if (isDevelopment()) {
      console.log('✅ Muchandy theme applied from Svarog-UI');
    }
  } catch (error) {
    console.error('❌ Failed to apply muchandy theme:', error);
    console.warn('🔧 App will use Svarog-UI default styling');
  }
};

// Export for app initialization
export default initializeTheme;
