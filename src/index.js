// File: src/index.js
/**
 * Main entry point for Svarog-UI + Storyblok integration
 * This file is loaded by Webpack and initializes the application
 */

// Import our application styles
import './styles/main.css';

// Import our application
import { createApp } from './app.js';
import { isDevelopment } from './utils/environment.js';

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (isDevelopment()) {
      console.log('🚀 Starting Svarog-UI + Storyblok Integration');
      console.log('💉 Svarog-UI uses automatic style injection');
    }

    // Get app container
    const container = document.getElementById('app');
    if (!container) {
      throw new Error('App container not found');
    }

    // Determine environment settings
    const savedTheme = localStorage.getItem('svarog-theme');

    // Create and initialize app
    const app = createApp({
      container,
      theme: savedTheme || 'default',
      enableLivePreview: isDevelopment(),
    });

    await app.init();

    // Development utilities
    if (isDevelopment()) {
      // Make app globally available for debugging
      window.app = app;

      // Try to load svarog-ui module and check what's available
      try {
        const svarogModule = await import('svarog-ui');
        window.svarog = svarogModule;
        console.log(
          '🎨 Svarog-UI loaded, available exports:',
          Object.keys(svarogModule)
        );

        // Also check svarog-ui-core
        try {
          const svarogCore = await import('svarog-ui-core');
          window.svarogCore = svarogCore;
          console.log(
            '🎯 Svarog-UI-Core loaded, available exports:',
            Object.keys(svarogCore)
          );
        } catch {
          // Ignore error - svarog-ui-core likely exports through main module
          console.log('ℹ️ svarog-ui-core exports through main module');
        }
      } catch (error) {
        console.warn('⚠️  Could not load svarog-ui module:', error.message);
      }

      // Log helpful info
      console.log('🔧 Development mode active');
      console.log('📚 Access app via window.app');
      console.log('🎯 App status:', app.getStatus());
    }

    // Set up global error handling
    window.addEventListener('error', event => {
      console.error('Global error:', event.error);

      if (isDevelopment()) {
        // Show detailed error in development
        const errorOverlay = createErrorOverlay(event.error);
        document.body.appendChild(errorOverlay);
      }
    });

    window.addEventListener('unhandledrejection', event => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  } catch (error) {
    console.error('❌ App initialization failed:', error);

    // Show fallback error UI
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="
          text-align: center;
          padding: 2rem;
          max-width: 600px;
          margin: 2rem auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <h1 style="color: #dc3545; margin-bottom: 1rem;">
            Application Error
          </h1>
          <p style="margin-bottom: 1.5rem; color: #666;">
            The application failed to start. Please check the console for details.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #007bff;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Reload Page
          </button>
          ${
            isDevelopment()
              ? `
            <details style="margin-top: 1rem; text-align: left;">
              <summary>Error Details</summary>
              <pre style="
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 4px;
                overflow: auto;
                font-size: 0.875rem;
                margin-top: 0.5rem;
              ">${error.stack}</pre>
            </details>
          `
              : ''
          }
        </div>
      `;
    }
  }
});

/**
 * Creates error overlay for development
 * @param {Error} error - Error object
 * @returns {HTMLElement} Error overlay element
 */
function createErrorOverlay(error) {
  const overlay = document.createElement('div');
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
          onclick="this.parentElement.parentElement.parentElement.remove()"
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

  return overlay;
}

// Performance monitoring
if (isDevelopment()) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        console.log('📊 Performance Metrics:', {
          'Total Load Time': `${Math.round(
            navigation.loadEventEnd - navigation.fetchStart
          )}ms`,
          'DOM Content Loaded': `${Math.round(
            navigation.domContentLoadedEventEnd - navigation.fetchStart
          )}ms`,
          'First Paint': performance.getEntriesByType('paint')[0]?.startTime
            ? `${Math.round(
                performance.getEntriesByType('paint')[0].startTime
              )}ms`
            : 'N/A',
        });
      }
    }, 0);
  });
}
