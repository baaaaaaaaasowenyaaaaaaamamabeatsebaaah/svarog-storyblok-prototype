// src/app.js
/**
 * Main application for Svarog-UI + Storyblok integration
 * Handles routing, content loading, and component rendering
 */

import { createStoryblokClient } from './integration/storyblokClient.js';
import { isDevelopment } from './utils/environment.js';

/**
 * Creates the main application
 * @param {Object} config - Application configuration
 * @returns {Object} Application API
 */
export const createApp = (config = {}) => {
  const {
    container = document.getElementById('app'),
    enableLivePreview = true,
  } = config;

  if (!container) {
    throw new Error('App container element not found');
  }

  // Initialize Storyblok client
  const storyblok = createStoryblokClient();

  // Application state
  let currentStory = null;
  let currentRoute = '/';

  /**
   * Initialize the application
   */
  const init = async () => {
    try {
      // Set up routing
      setupRouter();

      // Enable live preview in development
      if (enableLivePreview && isDevelopment()) {
        enableStoryblokPreview();
      }

      // Load initial content
      await loadContent();

      // Mark app as ready
      document.body.classList.add('app-ready');

      // Dispatch ready event
      window.dispatchEvent(
        new CustomEvent('appReady', {
          detail: {
            theme: getCurrentTheme(),
            route: currentRoute,
          },
        })
      );
    } catch (error) {
      console.error('App initialization failed:', error);
      showErrorState(error);
    }
  };

  /**
   * Load content from Storyblok
   */
  const loadContent = async () => {
    try {
      showLoadingState();

      // Get the current slug from URL
      const slug = getCurrentSlug();

      // Load story from Storyblok
      const story = await storyblok.getStoryWithComponents(slug);

      // Render story
      currentStory = await renderStory(story);

      hideLoadingState();
    } catch (error) {
      console.error('Failed to load content:', error);
      hideLoadingState();
      showSetupGuide();
    }
  };

  /**
   * Get current slug from URL
   */
  const getCurrentSlug = () => {
    const path = window.location.pathname;
    return path === '/' || path === '' ? 'home' : path.replace(/^\/|\/$/g, '');
  };

  /**
   * Render story to container
   */
  const renderStory = async story => {
    // Clear existing content
    container.innerHTML = '';

    // Create components from story
    const components =
      story.renderedComponents?.length > 0
        ? story.renderedComponents
        : await storyblok.createComponentsFromStory(story);

    // Add navigation if needed
    if (!container.querySelector('header')) {
      addDefaultNavigation();
    }

    // Render components
    const elements = components.map(component => {
      const element = component.getElement();
      container.appendChild(element);
      return element;
    });

    return {
      story,
      components,
      elements,
      destroy: () => {
        components.forEach(component => {
          if (component.destroy) {
            component.destroy();
          }
        });
      },
    };
  };

  /**
   * Add default navigation
   */
  const addDefaultNavigation = () => {
    const nav = document.createElement('nav');
    nav.className = 'default-nav no-print';
    nav.innerHTML = `
      <div style="
        background: var(--color-bg-secondary, #f8f9fa);
        padding: 1rem;
        border-bottom: 1px solid var(--color-border, #dee2e6);
        margin-bottom: 2rem;
      ">
        <div style="
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h3 style="margin: 0; color: var(--color-text, #333);">
            Your Website
          </h3>
          <div>
            <a href="/" style="margin: 0 0.5rem;">Home</a>
            <a href="/about" style="margin: 0 0.5rem;">About</a>
            <a href="/contact" style="margin: 0 0.5rem;">Contact</a>
          </div>
        </div>
      </div>
    `;
    container.insertBefore(nav, container.firstChild);
  };

  /**
   * Enable Storyblok live preview
   */
  const enableStoryblokPreview = () => {
    if (!window.storyblok) return;

    window.storyblok.on(['input', 'published', 'change'], event => {
      if (event.action === 'input') {
        refreshContent();
      }
    });

    window.storyblok.pingEditor();
  };

  /**
   * Refresh content when Storyblok updates
   */
  const refreshContent = async () => {
    try {
      // Visual feedback
      container.style.opacity = '0.7';
      container.style.transition = 'opacity 0.2s';

      // Destroy current story
      if (currentStory?.destroy) {
        currentStory.destroy();
      }

      // Reload content
      await loadContent();

      // Restore opacity
      container.style.opacity = '1';
    } catch (error) {
      console.error('Failed to refresh content:', error);
      container.style.opacity = '1';
    }
  };

  /**
   * Set up client-side routing
   */
  const setupRouter = () => {
    // Handle browser navigation
    window.addEventListener('popstate', () => {
      loadContent();
    });

    // Handle link clicks
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="/"]');
      if (link && !link.hasAttribute('target')) {
        event.preventDefault();
        const href = link.getAttribute('href');
        window.history.pushState({}, '', href);
        loadContent();
      }
    });
  };

  /**
   * Show loading state
   */
  const showLoadingState = () => {
    const existing = container.querySelector('.app-loading');
    if (!existing) {
      container.innerHTML = `
        <div class="app-loading">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading content...</p>
        </div>
      `;
    }
  };

  /**
   * Hide loading state
   */
  const hideLoadingState = () => {
    const loading = container.querySelector('.app-loading');
    if (loading) {
      loading.remove();
    }
  };

  /**
   * Show error state
   */
  const showErrorState = error => {
    container.innerHTML = `
      <div class="app-error">
        <h1>❌ Unable to Load Content</h1>
        <p>${error.message}</p>
        <button onclick="window.location.reload()" class="button">
          Try Again
        </button>
      </div>
    `;
  };

  /**
   * Show setup guide for new users
   */
  const showSetupGuide = () => {
    container.innerHTML = `
      <div class="setup-guide">
        <h1>🚀 Welcome to Svarog-UI + Storyblok</h1>
        <p>Let's get your website up and running!</p>
        
        <div style="text-align: left; max-width: 500px; margin: 2rem auto;">
          <h3>Quick Setup:</h3>
          <ol style="line-height: 2;">
            <li>Add your Storyblok token to <code>.env</code></li>
            <li>Create a story called "home" in Storyblok</li>
            <li>Add some components (hero, text, cards)</li>
            <li>Refresh this page</li>
          </ol>
        </div>
        
        <div style="margin-top: 2rem;">
          <button onclick="window.location.reload()" class="button">
            Check Again
          </button>
          <a href="https://app.storyblok.com" target="_blank" class="button button-secondary" style="margin-left: 1rem;">
            Open Storyblok
          </a>
        </div>
        
        <p style="margin-top: 2rem; color: #666; font-size: 14px;">
          Need help? Check the <a href="/docs" target="_blank">documentation</a>
        </p>
      </div>
    `;
  };

  /**
   * Get current theme
   */
  const getCurrentTheme = () => {
    return document.body.className.match(/theme-(\w+)/)?.[1] || 'default';
  };

  /**
   * Get application status
   */
  const getStatus = () => {
    return {
      ready: document.body.classList.contains('app-ready'),
      currentRoute,
      currentTheme: getCurrentTheme(),
      cacheStats: storyblok.getCacheStats(),
      storyLoaded: !!currentStory,
    };
  };

  /**
   * Navigate to route
   */
  const navigateToRoute = async path => {
    currentRoute = path;
    window.history.pushState({}, '', path);
    await loadContent();
  };

  /**
   * Destroy application
   */
  const destroy = () => {
    // Destroy current story
    if (currentStory?.destroy) {
      currentStory.destroy();
    }

    // Clear container
    container.innerHTML = '';

    // Remove ready class
    document.body.classList.remove('app-ready');
  };

  // Public API
  return {
    init,
    navigateToRoute,
    getStatus,
    destroy,
    // Development utilities
    ...(isDevelopment() && {
      storyblok,
      refreshContent,
      getCurrentTheme,
    }),
  };
};
