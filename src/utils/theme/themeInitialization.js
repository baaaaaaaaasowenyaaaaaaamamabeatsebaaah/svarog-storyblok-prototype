// File: src/utils/theme/themeInitialization.js
/**
 * Theme initialization for Svarog-UI
 * Properly imports and registers the default theme and any custom themes
 */

import { registerTheme, switchTheme } from 'svarog-ui';
import defaultTheme from '@svarog-ui/theme-default';
import { isDevelopment } from '../environment.js';

/**
 * Initialize the theme system
 * @param {string} initialTheme - Initial theme to use
 */
export const initializeThemeSystem = (initialTheme = 'default') => {
  try {
    // Register the default theme
    registerTheme('default', defaultTheme);

    // Register custom themes if needed
    // registerTheme('cabalou', cabalouTheme);
    // registerTheme('muchandy', muchandyTheme);

    // Apply the saved theme or default
    const savedTheme = localStorage.getItem('svarog-theme') || initialTheme;
    switchTheme(savedTheme);

    if (isDevelopment()) {
      console.log(`🎨 Theme system initialized, using theme: ${savedTheme}`);
    }

    // Update body class for CSS hooks
    document.body.classList.add(`theme-${savedTheme}`);

    // Expose theme switching utility for debugging
    if (isDevelopment()) {
      window.switchTheme = theme => {
        switchTheme(theme);
        localStorage.setItem('svarog-theme', theme);
        document.body.className = document.body.className
          .replace(/theme-\w+/g, '')
          .trim();
        document.body.classList.add(`theme-${theme}`);
        console.log(`🎨 Switched to theme: ${theme}`);
      };
    }
  } catch (error) {
    console.error('❌ Failed to initialize theme system:', error);
    // Fallback to CSS variables for basic styling
    document.documentElement.style.setProperty('--primary-color', '#007bff');
    document.documentElement.style.setProperty('--background-color', '#ffffff');
    document.documentElement.style.setProperty('--text-color', '#212529');
  }
};
