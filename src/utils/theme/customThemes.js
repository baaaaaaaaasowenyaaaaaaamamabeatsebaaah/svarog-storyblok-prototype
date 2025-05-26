// File: src/utils/theme/customThemes.js
/**
 * Custom theme system for local theme overrides
 * Since Svarog-UI now only provides default theming, we handle custom themes locally
 */

import { isDevelopment } from '../environment.js';

/**
 * Theme definitions for our custom themes
 */
const THEME_DEFINITIONS = {
  default: {
    '--primary-color': '#007bff',
    '--primary-hover': '#0056b3',
    '--secondary-color': '#6c757d',
    '--success-color': '#28a745',
    '--danger-color': '#dc3545',
    '--warning-color': '#ffc107',
    '--info-color': '#17a2b8',
    '--light-color': '#f8f9fa',
    '--dark-color': '#343a40',
    '--background-color': '#ffffff',
    '--text-color': '#212529',
    '--text-secondary': '#6c757d',
    '--border-color': '#dee2e6',
    '--border-radius': '0.375rem',
    '--box-shadow': '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
  },

  cabalou: {
    '--primary-color': '#8b5cf6',
    '--primary-hover': '#7c3aed',
    '--secondary-color': '#a78bfa',
    '--success-color': '#10b981',
    '--danger-color': '#ef4444',
    '--warning-color': '#f59e0b',
    '--info-color': '#06b6d4',
    '--light-color': '#f3f4f6',
    '--dark-color': '#1f2937',
    '--background-color': '#fefefe',
    '--text-color': '#111827',
    '--text-secondary': '#6b7280',
    '--border-color': '#e5e7eb',
    '--border-radius': '0.5rem',
    '--box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },

  muchandy: {
    '--primary-color': '#f59e0b',
    '--primary-hover': '#d97706',
    '--secondary-color': '#fbbf24',
    '--success-color': '#059669',
    '--danger-color': '#dc2626',
    '--warning-color': '#f97316',
    '--info-color': '#0ea5e9',
    '--light-color': '#fffbeb',
    '--dark-color': '#92400e',
    '--background-color': '#fffdf7',
    '--text-color': '#78350f',
    '--text-secondary': '#a16207',
    '--border-color': '#fed7aa',
    '--border-radius': '0.75rem',
    '--box-shadow': '0 8px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};

/**
 * Current active theme
 */
let currentTheme = 'default';

/**
 * Applies theme variables to the document root
 * @param {string} themeName - Theme name to apply
 */
export const applyTheme = themeName => {
  const theme = THEME_DEFINITIONS[themeName];

  if (!theme) {
    console.warn(`Theme "${themeName}" not found, falling back to default`);
    themeName = 'default';
  }

  const root = document.documentElement;
  const themeToApply = THEME_DEFINITIONS[themeName];

  // Apply CSS custom properties
  Object.entries(themeToApply).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Update body class for additional theme-specific styling
  document.body.className = document.body.className
    .replace(/theme-\w+/g, '')
    .trim();
  document.body.classList.add(`theme-${themeName}`);

  currentTheme = themeName;

  // Save to localStorage
  localStorage.setItem('svarog-theme', themeName);

  if (isDevelopment()) {
    console.log(`🎨 Applied custom theme: ${themeName}`);
  }
};

/**
 * Gets the current theme name
 * @returns {string} Current theme name
 */
export const getCurrentCustomTheme = () => currentTheme;

/**
 * Gets available theme names
 * @returns {Array<string>} Available theme names
 */
export const getAvailableThemes = () => Object.keys(THEME_DEFINITIONS);

/**
 * Switches to a new theme
 * @param {string} themeName - Theme to switch to
 */
export const switchCustomTheme = themeName => {
  applyTheme(themeName);

  // Dispatch custom event for theme change
  window.dispatchEvent(
    new CustomEvent('customThemeChange', {
      detail: { theme: themeName },
    })
  );
};

/**
 * Initializes the theme system
 */
export const initializeThemeSystem = () => {
  // Get saved theme from localStorage or default
  const savedTheme = localStorage.getItem('svarog-theme') || 'default';

  // Apply initial theme
  applyTheme(savedTheme);

  if (isDevelopment()) {
    console.log('🎨 Custom theme system initialized');
  }
};

/**
 * Adds a new custom theme
 * @param {string} name - Theme name
 * @param {Object} variables - CSS custom properties
 */
export const addCustomTheme = (name, variables) => {
  THEME_DEFINITIONS[name] = variables;

  if (isDevelopment()) {
    console.log(`🎨 Added custom theme: ${name}`);
  }
};
