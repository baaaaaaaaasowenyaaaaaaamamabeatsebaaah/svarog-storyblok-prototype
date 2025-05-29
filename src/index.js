// src/index.js
/**
 * Main entry point for Svarog-UI + Storyblok integration
 * Applies muchandy theme and initializes the application
 */

// Import Svarog-UI CSS - THE ONLY CSS WE IMPORT
import 'svarog-ui/dist/svarog-ui.css';

// Import minimal application CSS (only reset and accessibility)
import './styles/main.css';

// Import application and theme management
import { createApp } from './app.js';
import { initializeTheme } from './integration/themeManager.js';
import { isDevelopment } from './utils/environment.js';

// Initialize application when DOM is ready
const init = async () => {
  try {
    // Initialize muchandy theme from Svarog-UI
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

      // Log successful initialization
      console.log('🚀 Svarog-UI application initialized with muchandy theme');
      console.log('💡 Available commands:');
      console.log('  - window.app.getStatus()');
    }

    // Set up global error handling
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  } catch (error) {
    console.error('Application initialization failed:', error);
    showCriticalError(error);
  }
};

// Error handlers
const handleGlobalError = event => {
  console.error('Runtime error:', event.error);
  if (isDevelopment()) {
    console.error('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
    });
  }
};

const handleUnhandledRejection = event => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
};

// Show critical error without custom styling
const showCriticalError = error => {
  const container = document.getElementById('app');
  if (!container) return;

  // Use minimal HTML without custom CSS
  container.innerHTML = `
    <div style="
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
    ">
      <h1>Unable to Load Application</h1>
      <p>We encountered an error while starting the application.</p>
      <button onclick="window.location.reload()" style="
        padding: 0.75rem 1.5rem;
        margin: 1rem;
        background: #f59e0b;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">
        Try Again
      </button>
      ${
        isDevelopment()
          ? `
        <details style="margin-top: 2rem; text-align: left;">
          <summary>Technical Details</summary>
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

// Start application
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Performance monitoring (development only)
if (isDevelopment()) {
  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const loadTime = Math.round(
        navigation.loadEventEnd - navigation.fetchStart
      );
      console.log(
        `⚡ Svarog-UI app with muchandy theme loaded in ${loadTime}ms`
      );
    }
  });
}
