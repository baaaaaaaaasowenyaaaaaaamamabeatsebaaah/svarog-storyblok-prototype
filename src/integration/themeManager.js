// src/integration/themeManager.js

/**
 * @fileoverview Theme management system for Svarog-UI
 * Handles theme initialization and application using actual theme packages
 */

import { isDevelopment } from '../utils/environment.js';

// Import themes from their packages
import defaultTheme from '@svarog-ui/theme-default';
import { muchandyTheme } from '@svarog-ui/theme-muchandy';

// Available themes
const availableThemes = {
  default: defaultTheme,
  muchandy: muchandyTheme,
};

// Current active theme
let currentTheme = 'default';

/**
 * Initialize and apply the theme system
 * @param {string} themeName - Theme name to initialize with
 * @returns {void}
 */
export const initializeTheme = (themeName = 'default') => {
  try {
    // Get saved theme from localStorage or use provided default
    const savedTheme = localStorage.getItem('svarog-theme') || themeName;

    // Apply the theme
    applyTheme(savedTheme);

    if (isDevelopment()) {
      console.log(`✅ Theme system initialized with: ${savedTheme}`);

      // Make theme switching available globally for debugging
      window.switchToTheme = theme => {
        applyTheme(theme);
        console.log(`🎨 Switched to theme: ${theme}`);
      };

      window.getAvailableThemes = () => Object.keys(availableThemes);
    }
  } catch (error) {
    console.error('Failed to initialize theme system:', error);
    applyFallbackStyles();
  }
};

/**
 * Apply a theme by name
 * @param {string} themeName - Theme to apply
 */
export const applyTheme = themeName => {
  const theme = availableThemes[themeName];

  if (!theme) {
    console.warn(`Theme "${themeName}" not found, falling back to default`);
    themeName = 'default';
  }

  const themeToApply = availableThemes[themeName];

  if (themeToApply && typeof themeToApply.apply === 'function') {
    // Remove previous theme first
    if (currentTheme !== themeName) {
      const previousTheme = availableThemes[currentTheme];
      if (previousTheme && typeof previousTheme.remove === 'function') {
        previousTheme.remove();
      }
    }

    // Apply new theme
    themeToApply.apply();
    currentTheme = themeName;

    // Save to localStorage
    localStorage.setItem('svarog-theme', themeName);

    // Update body class for additional styling hooks
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-${themeName}`);

    if (isDevelopment()) {
      console.log(`🎨 Applied theme: ${themeName}`);
    }

    // Dispatch theme change event
    window.dispatchEvent(
      new CustomEvent('themeChanged', {
        detail: { theme: themeName },
      })
    );
  } else {
    console.error(`Theme "${themeName}" does not have an apply() method`);
    applyFallbackStyles();
  }
};

/**
 * Get current active theme name
 * @returns {string} Current theme name
 */
export const getCurrentTheme = () => currentTheme;

/**
 * Get list of available themes
 * @returns {Array<string>} Available theme names
 */
export const getAvailableThemes = () => {
  return Object.keys(availableThemes).filter(name => availableThemes[name]);
};

/**
 * Switch to a different theme
 * @param {string} themeName - Theme to switch to
 */
export const switchTheme = themeName => {
  applyTheme(themeName);
};

/**
 * Apply fallback styles if theme loading fails
 */
const applyFallbackStyles = () => {
  const fallbackCSS = `
    :root {
      --color-brand-primary: #007bff;
      --color-brand-primary-dark: #0056b3;
      --color-brand-primary-light: #66b3ff;
      --color-bg: #ffffff;
      --color-text: #212529;
      --color-text-white: #ffffff;
      --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-size-base: 1rem;
      --font-size-xl: 1.25rem;
      --space-2: 0.5rem;
      --space-5: 1.25rem;
      --space-6: 1.5rem;
      --button-bg: var(--color-brand-primary);
      --button-color: var(--color-text-white);
      --button-hover-bg: var(--color-brand-primary-dark);
      --button-padding: var(--space-2) var(--space-5);
      --card-bg: var(--color-bg);
      --card-padding: var(--space-6);
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
