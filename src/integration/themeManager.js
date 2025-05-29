// src/integration/themeManager.js

/**
 * @fileoverview Theme Manager for Svarog-UI with actual published packages
 * Uses correct package versions: muchandy@1.3.4, default@1.4.4, cabalou@1.3.4
 */

import { ThemeManager } from 'svarog-ui-core';
import muchandyTheme from '@svarog-ui/theme-muchandy';
import defaultTheme from '@svarog-ui/theme-default';
import cabalouTheme from '@svarog-ui/theme-cabalou';
import { isDevelopment } from '../utils/environment.js';

/**
 * Available themes with their imported objects
 */
const AVAILABLE_THEMES = {
  muchandy: muchandyTheme,
  default: defaultTheme,
  cabalou: cabalouTheme,
};

/**
 * Current active theme
 */
let currentTheme = null;

/**
 * Initialize the theme system with muchandy as default
 */
export const initializeTheme = () => {
  try {
    if (isDevelopment()) {
      console.log('🔧 Initializing theme system...');
      console.log('Theme objects loaded:', {
        muchandy: !!muchandyTheme,
        default: !!defaultTheme,
        cabalou: !!cabalouTheme
      });
      
      // Log theme object structure for debugging
      Object.entries(AVAILABLE_THEMES).forEach(([name, theme]) => {
        if (theme) {
          console.log(`Theme ${name}:`, {
            hasApply: typeof theme.apply === 'function',
            hasRemove: typeof theme.remove === 'function',
            name: theme.name,
            keys: Object.keys(theme)
          });
        }
      });
    }

    // Register all available themes with the ThemeManager
    Object.entries(AVAILABLE_THEMES).forEach(([name, themeObject]) => {
      if (themeObject) {
        try {
          if (typeof themeObject.apply === 'function') {
            ThemeManager.register(name, themeObject);
            if (isDevelopment()) {
              console.log(`✅ Registered theme: ${name}`);
            }
          } else {
            console.warn(`Theme ${name} missing apply() method:`, themeObject);
          }
        } catch (regError) {
          console.warn(`Failed to register theme ${name}:`, regError);
        }
      } else {
        console.warn(`Theme ${name} not loaded properly`);
      }
    });

    // Get saved theme or use muchandy as default
    const savedTheme = localStorage.getItem('svarog-theme') || 'muchandy';
    
    // Apply the theme
    switchToTheme(savedTheme);

    if (isDevelopment()) {
      console.log('✅ Theme system initialized');
      console.log('🎨 Available themes:', Object.keys(AVAILABLE_THEMES));
      console.log('🎨 Active theme:', savedTheme);
      
      // Expose theme utilities for debugging
      window.themeDebug = {
        switch: switchToTheme,
        getCurrent: getActiveTheme,
        getAvailable: getAvailableThemes,
        themes: AVAILABLE_THEMES,
        themeManager: ThemeManager,
      };
    }
  } catch (error) {
    console.error('❌ Failed to initialize theme system:', error);
    
    // Fallback: try to apply muchandy theme directly
    try {
      if (muchandyTheme && typeof muchandyTheme.apply === 'function') {
        muchandyTheme.apply();
        currentTheme = 'muchandy';
        console.log('🔧 Applied muchandy theme as fallback');
      } else {
        // CSS fallback
        applyFallbackMuchandyStyles();
      }
    } catch (fallbackError) {
      console.error('❌ Fallback theme application failed:', fallbackError);
      applyFallbackMuchandyStyles();
    }
  }
};

/**
 * CSS fallback for muchandy theme if theme objects fail
 */
const applyFallbackMuchandyStyles = () => {
  document.body.classList.add('muchandy-theme');
  document.documentElement.setAttribute('data-theme', 'muchandy');
  
  // Apply muchandy colors via CSS variables
  const root = document.documentElement;
  root.style.setProperty('--svarog-primary', '#8B4A6B');
  root.style.setProperty('--svarog-secondary', '#D4A574');
  root.style.setProperty('--svarog-accent', '#E8B87E');
  root.style.setProperty('--svarog-background', '#FDF8F0');
  root.style.setProperty('--svarog-text', '#2D1810'); 
  
  currentTheme = 'muchandy';
  console.log('🎨 CSS fallback: Muchandy theme applied');
};

/**
 * Switch to a specific theme
 * @param {string} themeName - Name of theme to switch to
 * @returns {boolean} Success status
 */
export const switchToTheme = (themeName) => {
  try {
    const themeObject = AVAILABLE_THEMES[themeName];
    
    if (!themeObject) {
      console.warn(`Theme "${themeName}" not available. Available themes:`, Object.keys(AVAILABLE_THEMES));
      return false;
    }

    if (typeof themeObject.apply !== 'function') {
      console.error(`Theme "${themeName}" does not have apply() method:`, themeObject);
      return false;
    }

    // Remove current theme if any
    if (currentTheme && AVAILABLE_THEMES[currentTheme]?.remove) {
      try {
        AVAILABLE_THEMES[currentTheme].remove();
      } catch (removeError) {
        console.warn(`Failed to remove current theme ${currentTheme}:`, removeError);
      }
    }

    // Apply new theme
    themeObject.apply();
    currentTheme = themeName;
    
    // Save theme preference
    localStorage.setItem('svarog-theme', themeName);
    
    // Update body class for CSS hooks
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-${themeName}`);
    document.documentElement.setAttribute('data-theme', themeName);

    if (isDevelopment()) {
      console.log(`🎨 Switched to theme: ${themeName}`);
    }

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: themeName, previous: currentTheme }
    }));

    return true;
  } catch (error) {
    console.error(`Failed to switch to theme "${themeName}":`, error);
    
    // Fallback to CSS-based theme switching
    if (themeName === 'muchandy') {
      applyFallbackMuchandyStyles();
      return true;
    }
    
    return false;
  }
};

/**
 * Get currently active theme name
 * @returns {string|null} Active theme name
 */
export const getActiveTheme = () => {
  return currentTheme;
};

/**
 * Get list of available theme names
 * @returns {string[]} Available theme names
 */
export const getAvailableThemes = () => {
  return Object.keys(AVAILABLE_THEMES);
};

/**
 * Check if a theme is available
 * @param {string} themeName - Theme name to check
 * @returns {boolean} True if theme is available
 */
export const isThemeAvailable = (themeName) => {
  return Object.hasOwnProperty.call(AVAILABLE_THEMES, themeName);
};

/**
 * Get theme object by name (for advanced usage)
 * @param {string} themeName - Theme name
 * @returns {Object|null} Theme object or null
 */
export const getThemeObject = (themeName) => {
  return AVAILABLE_THEMES[themeName] || null;
};

// Export default theme initialization function
export default initializeTheme;