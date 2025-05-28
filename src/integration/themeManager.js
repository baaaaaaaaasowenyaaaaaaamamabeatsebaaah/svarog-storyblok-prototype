// src/integration/themeManager.js

/**
 * @fileoverview Theme management system for Svarog-UI
 * Handles theme initialization and application
 */

import defaultTheme from '@svarog-ui/theme-default';
import { isDevelopment } from '../utils/environment.js';

// Import the theme variables from your paste.txt
const themeVariables = `
    /* Core spacing values */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    
    /* Core font sizes */
    --font-size-base: 1rem;
    --font-size-sm: 0.875rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;
    --font-size-6xl: 3.75rem;
    
    /* Core colors */
    --color-white: #ffffff;
    --color-bg: #ffffff;
    --color-text: #212529;
    --color-text-white: #ffffff;
    
    /* Brand colors */
    --color-brand-primary: #2196f3;
    --color-brand-primary-light: #64b5f6;
    --color-brand-primary-dark: #1976d2;
    --color-brand-secondary: #ff5722;
    --color-brand-secondary-light: #ff8a65;
    --color-brand-secondary-dark: #e64a19;
    
    /* Component variables */
    --button-bg: var(--color-brand-primary);
    --button-color: var(--color-text-white);
    --button-radius: 4px;
    --button-hover-bg: var(--color-brand-primary-dark);
    --button-padding: 6px 16px;
    --button-font-size: 0.875rem;
    --button-font-weight: 500;
    --button-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    
    --card-bg: var(--color-white);
    --card-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 3px 0 rgba(0, 0, 0, 0.12);
    --card-radius: 4px;
    --card-content-padding: 16px;
    
    --typography-color: var(--color-text);
    --typography-h1-size: var(--font-size-6xl);
    --typography-h2-size: var(--font-size-4xl);
    --typography-h3-size: var(--font-size-3xl);
    --typography-body-size: var(--font-size-base);
    
    --font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --font-family-mono: 'Roboto Mono', monospace;
    
    --color-border: #e0e0e0;
    --color-gray-50: #fafafa;
`;

// Check if theme is using development placeholder
const isDevPlaceholder = defaultTheme.apply
  .toString()
  .includes('development placeholder');

if (isDevPlaceholder) {
  console.warn(
    '⚠️ Theme is using development placeholder, applying override...'
  );

  // Override the apply method with actual implementation
  defaultTheme.apply = function () {
    // Remove any existing theme styles
    const existingStyle = document.getElementById('svarog-theme-default');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject the theme styles
    const style = document.createElement('style');
    style.id = 'svarog-theme-default';
    style.textContent = `
      :root {
        ${themeVariables}
      }
      
      .default-theme {
        ${themeVariables}
      }
      
      /* Basic component styles */
      .button, button {
        background-color: var(--button-bg);
        color: var(--button-color);
        border-radius: var(--button-radius);
        padding: var(--button-padding);
        font-size: var(--button-font-size);
        font-weight: var(--button-font-weight);
        box-shadow: var(--button-shadow);
        border: none;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .button:hover, button:hover {
        background-color: var(--button-hover-bg);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      
      .card {
        background: var(--card-bg);
        box-shadow: var(--card-shadow);
        border-radius: var(--card-radius);
        padding: var(--card-content-padding);
      }
      
      body {
        font-family: var(--font-family-primary);
        color: var(--color-text);
        background-color: var(--color-bg);
      }
      
      h1, h2, h3, h4, h5, h6 {
        color: rgba(0, 0, 0, 0.87);
        line-height: 1.2;
        margin-bottom: 0.5em;
      }
    `;

    document.head.appendChild(style);
    document.documentElement.classList.add('default-theme');
    document.body.classList.add('default-theme');

    console.log('✅ Theme override applied with actual styles');
  };

  // Also override remove method
  defaultTheme.remove = function () {
    const style = document.getElementById('svarog-theme-default');
    if (style) {
      style.remove();
    }
    document.documentElement.classList.remove('default-theme');
    document.body.classList.remove('default-theme');
  };
}

/**
 * Initialize and apply the default theme
 * @returns {void}
 */
export const initializeTheme = () => {
  try {
    // Check if theme has the expected structure
    if (!defaultTheme || typeof defaultTheme.apply !== 'function') {
      console.error('Invalid theme structure:', defaultTheme);
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
 * Debug function to check theme state
 */
export const debugThemeState = () => {
  console.group('🔍 [Theme Debug] Current Theme State');

  console.log('Theme object:', defaultTheme);
  console.log('Is dev placeholder:', isDevPlaceholder);

  const themeStyle = document.getElementById('svarog-theme-default');
  console.log('Theme style element:', themeStyle);

  console.log(
    'Style elements:',
    Array.from(document.querySelectorAll('style')).map(s => ({
      id: s.id,
      contentLength: s.textContent.length,
      preview: `${s.textContent.substring(0, 100)}...`,
    }))
  );

  const rootStyles = getComputedStyle(document.documentElement);
  console.log('Sample CSS variables:', {
    primaryColor: rootStyles.getPropertyValue('--color-brand-primary'),
    buttonBg: rootStyles.getPropertyValue('--button-bg'),
    fontFamily: rootStyles.getPropertyValue('--font-family-primary'),
    cardBg: rootStyles.getPropertyValue('--card-bg'),
  });

  console.log('Classes:', {
    html: document.documentElement.className,
    body: document.body.className,
  });

  console.groupEnd();
};

/**
 * Apply fallback styles if theme fails to load
 */
const applyFallbackStyles = () => {
  const fallbackCSS = `
    :root {
      ${themeVariables}
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

// Make debug available globally in development
if (isDevelopment() && typeof window !== 'undefined') {
  window.debugTheme = debugThemeState;
  window.reapplyTheme = () => {
    console.log('Reapplying theme...');
    defaultTheme.remove();
    defaultTheme.apply();
    debugThemeState();
  };
}

// Export for use in app initialization
export default initializeTheme;
