// src/index.js
/**
 * Main entry point for Svarog-UI + Storyblok integration
 * This file is loaded by Webpack and initializes the application
 */

import './styles/main.css';
import { createApp } from './app.js';
import { isDevelopment } from './utils/environment.js';
import { initializeTheme } from './integration/themeManager.js';

// Initialize application when DOM is ready
const init = async () => {
  try {
    // Initialize theme system
    initializeTheme();

    // Get app container
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('App container not found');
    }

    // Create and initialize app
    const app = createApp({
      container,
      enableLivePreview: true,
    });

    await app.init();

    // Development utilities
    if (isDevelopment()) {
      // Make app available for debugging
      window.app = app;

      // Add development indicator
      const devIndicator = document.getElementById('dev-indicator');
      if (devIndicator) {
        devIndicator.innerHTML = 'DEV MODE';
        devIndicator.style.cssText = `
          position: fixed;
          bottom: 10px;
          left: 10px;
          background: rgba(255, 152, 0, 0.9);
          color: white;
          padding: 4px 8px;
          font-size: 11px;
          font-weight: bold;
          border-radius: 3px;
          pointer-events: none;
          z-index: 9999;
          display: block;
        `;
      }

      console.log('🚀 Development mode active. Access app via window.app');
    }

    // Set up global error handling
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  } catch (error) {
    console.error('Application initialization failed:', error);
    showErrorUI(error);
  }
};

// Error handlers
const handleGlobalError = event => {
  console.error('Runtime error:', event.error);
  if (isDevelopment()) {
    // In development, show detailed error overlay
    showErrorOverlay(event.error);
  }
};

const handleUnhandledRejection = event => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
};

// Show user-friendly error UI
const showErrorUI = error => {
  const container = document.getElementById('app');
  if (!container) return;

  container.innerHTML = `
    <div class="app-error">
      <h1>Unable to Load Application</h1>
      <p>We encountered an error while starting the application.</p>
      <button class="button" onclick="window.location.reload()">
        Try Again
      </button>
      ${
        isDevelopment()
          ? `
        <details style="margin-top: 2rem; text-align: left;">
          <summary style="cursor: pointer;">Technical Details</summary>
          <pre style="
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 4px;
            overflow: auto;
            font-size: 0.875rem;
            margin-top: 0.5rem;
          ">${error.stack || error.message}</pre>
        </details>
      `
          : ''
      }
    </div>
  `;
};

// Development error overlay
const showErrorOverlay = error => {
  // Remove existing overlay
  const existing = document.getElementById('error-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'error-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 2rem;
    z-index: 10000;
    font-family: Monaco, Menlo, monospace;
    font-size: 14px;
    overflow: auto;
  `;

  overlay.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="color: #ff6b6b; margin: 0;">Runtime Error</h2>
        <button 
          onclick="document.getElementById('error-overlay').remove()"
          style="
            background: none;
            border: 1px solid #666;
            color: white;
            padding: 0.5rem 1rem;
            cursor: pointer;
            border-radius: 4px;
          "
        >
          ✕ Close
        </button>
      </div>
      <div style="background: #1a1a1a; padding: 1rem; border-radius: 4px; margin-bottom: 1rem;">
        <strong style="color: #ff6b6b;">${error.name}:</strong> ${error.message}
      </div>
      <div style="background: #1a1a1a; padding: 1rem; border-radius: 4px;">
        <strong>Stack Trace:</strong><br>
        <pre style="margin: 0.5rem 0 0 0; white-space: pre-wrap;">${error.stack}</pre>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
};

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Performance monitoring (production-ready)
if ('addEventListener' in window) {
  window.addEventListener('load', () => {
    // Only log performance in development
    if (isDevelopment()) {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        const loadTime = Math.round(
          navigation.loadEventEnd - navigation.fetchStart
        );
        console.log(`⚡ Page loaded in ${loadTime}ms`);
      }
    }
  });
}
