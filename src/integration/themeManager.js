// src/integration/themeManager.js

/**
 * @fileoverview Theme management system for Svarog-UI
 * Handles theme initialization and application
 */

import defaultTheme from '@svarog-ui/theme-default';
import { isDevelopment } from '../utils/environment.js';

/**
 * Initialize and apply the default theme
 * @returns {void}
 */
export const initializeTheme = () => {
  try {
    // Check if theme has the expected structure
    if (!defaultTheme || typeof defaultTheme.apply !== 'function') {
      console.error('Invalid theme structure:', defaultTheme);
      // Apply fallback styles
      applyFallbackStyles();
      return;
    }

    // Apply the default theme
    defaultTheme.apply();

    if (isDevelopment()) {
      console.log('✅ Default theme applied successfully');
    }
  } catch (error) {
    console.error('Failed to apply theme:', error);
    applyFallbackStyles();
  }
};

/**
 * Apply fallback styles if theme fails to load
 */
const applyFallbackStyles = () => {
  const fallbackCSS = `
    :root {
      /* Fallback color variables */
      --color-brand-primary: #2196f3;
      --color-brand-primary-light: #64b5f6;
      --color-brand-primary-dark: #1976d2;
      --color-bg: #ffffff;
      --color-text: #212529;
      --color-border: #e0e0e0;
      
      /* Component defaults */
      --button-bg: var(--color-brand-primary);
      --button-color: white;
      --button-radius: 4px;
      --card-bg: white;
      --card-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .default-theme {
      background-color: var(--color-bg);
      color: var(--color-text);
    }
  `;

  let styleEl = document.getElementById('svarog-theme-fallback');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'svarog-theme-fallback';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = fallbackCSS;

  // Add theme class
  document.documentElement.classList.add('default-theme');
  document.body.classList.add('default-theme');

  console.warn('Applied fallback theme styles');
};

// Export for use in app initialization
export default initializeTheme;
