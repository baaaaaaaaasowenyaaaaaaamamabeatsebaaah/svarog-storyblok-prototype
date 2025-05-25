// File: src/app.js
/**
 * Main application integrating Svarog-UI with Storyblok
 * Handles routing, theme management, and component rendering
 */

import { switchTheme, getCurrentTheme } from 'svarog-ui';
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
    theme = 'default',
    enableLivePreview = false,
  } = config;

  if (!container) {
    throw new Error('App container element not found');
  }

  // Initialize Storyblok client
  const storyblok = createStoryblokClient();

  // Current state
  let currentStory = null;
  let currentRoute = '/';

  // Initialize theme
  switchTheme(theme);

  /**
   * Initializes the application
   */
  const init = async () => {
    try {
      if (isDevelopment()) {
         
        console.log('🚀 Initializing Svarog-UI + Storyblok App');
         
        console.log(`🎨 Theme: ${getCurrentTheme()}`);
      }

      // Set up routing
      setupRouter();

      // Enable live preview if in development
      if (enableLivePreview) {
        storyblok.enableLivePreview(handleStoryChange);
      }

      // Load initial route
      await navigateToRoute(getCurrentRoute());

      // Mark app as ready
      document.body.classList.add('app-ready');

      // Dispatch ready event
      window.dispatchEvent(
        new CustomEvent('appReady', {
          detail: { theme: getCurrentTheme() },
        })
      );

      if (isDevelopment()) {
         
        console.log('✅ App initialized successfully');
      }
    } catch (error) {
       
      console.error('❌ App initialization failed:', error);
      renderErrorState(error);
    }
  };

  /**
   * Sets up client-side routing
   */
  const setupRouter = () => {
    // Handle browser navigation
    window.addEventListener('popstate', event => {
      const path = event.state?.path || window.location.pathname;
      navigateToRoute(path, false);
    });

    // Handle link clicks
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="/"]');
      if (
        link &&
        !link.hasAttribute('target') &&
        !event.metaKey &&
        !event.ctrlKey
      ) {
        event.preventDefault();
        navigateToRoute(link.getAttribute('href'));
      }
    });
  };

  /**
   * Navigates to a specific route
   * @param {string} path - Route path
   * @param {boolean} updateHistory - Whether to update browser history
   */
  const navigateToRoute = async (path, updateHistory = true) => {
    try {
      showLoadingState();

      // Convert path to Storyblok slug
      const slug = pathToSlug(path);

      // Destroy previous story components
      if (currentStory && currentStory.destroy) {
        currentStory.destroy();
      }

      // Load and render new story
      currentStory = await storyblok.renderStoryToContainer(slug, container);
      currentRoute = path;

      // Update browser history
      if (updateHistory) {
        window.history.pushState(
          { path },
          currentStory.story.content.title || 'Page',
          path
        );
      }

      // Update page metadata
      updatePageMetadata(currentStory.story);

      hideLoadingState();

      // Dispatch navigation event
      window.dispatchEvent(
        new CustomEvent('routeChange', {
          detail: { path, story: currentStory.story },
        })
      );
    } catch (error) {
       
      console.error(`Navigation failed for ${path}:`, error);
      hideLoadingState();

      if (path !== '/') {
        // Try fallback to home
        await navigateToRoute('/', updateHistory);
      } else {
        renderErrorState(error);
      }
    }
  };

  /**
   * Converts URL path to Storyblok slug
   * @param {string} path - URL path
   * @returns {string} Storyblok slug
   */
  const pathToSlug = path => {
    if (path === '/' || path === '') return 'home';
    return path.replace(/^\//, '').replace(/\/$/, '');
  };

  /**
   * Gets current route from URL
   * @returns {string} Current route path
   */
  const getCurrentRoute = () => {
    return window.location.pathname;
  };

  /**
   * Shows loading state
   */
  const showLoadingState = () => {
    container.innerHTML = `
      <div class="app-loading">
        <div class="loading-spinner"></div>
        <p>Loading content...</p>
      </div>
    `;
  };

  /**
   * Hides loading state
   */
  const hideLoadingState = () => {
    const loadingElement = container.querySelector('.app-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  };

  /**
   * Updates page metadata
   * @param {Object} story - Storyblok story
   */
  const updatePageMetadata = story => {
    // Update title
    const title = story.content.title || story.name;
    document.title = title;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (story.content.description && metaDescription) {
      metaDescription.setAttribute('content', story.content.description);
    }

    // Update Open Graph tags
    updateOpenGraphTags(story);
  };

  /**
   * Updates Open Graph meta tags
   * @param {Object} story - Storyblok story
   */
  const updateOpenGraphTags = story => {
    const ogTags = {
      'og:title': story.content.title || story.name,
      'og:description': story.content.description || '',
      'og:url': window.location.href,
      'og:type': 'website',
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });
  };

  /**
   * Renders error state
   * @param {Error} error - Error object
   */
  const renderErrorState = error => {
    let isDevelopmentMode = false;
    try {
      isDevelopmentMode = import.meta.env.MODE === 'development';
    } catch {
      // Fallback for environments without import.meta
      isDevelopmentMode = false;
    }

    container.innerHTML = `
      <div class="app-error">
        <h1>Something went wrong</h1>
        <p>We're having trouble loading this page.</p>
        <button onclick="window.location.reload()" class="retry-button">
          Try Again
        </button>
        ${
          isDevelopmentMode
            ? `
          <details class="error-details">
            <summary>Error Details</summary>
            <pre>${error.stack}</pre>
          </details>
        `
            : ''
        }
      </div>
    `;
  };

  /**
   * Handles story changes from live preview
   * @param {Object} story - Updated story data
   */
  const handleStoryChange = async story => {
    if (isDevelopment()) {
       
      console.log('📝 Story updated via live preview', story);
    }

    try {
      // Refresh current route
      await storyblok.refreshStory(pathToSlug(currentRoute), container);
    } catch (error) {
       
      console.error('Failed to refresh story:', error);
    }
  };

  /**
   * Changes the application theme
   * @param {string} themeName - Theme name ('default', 'cabalou', 'muchandy')
   */
  const changeTheme = themeName => {
    switchTheme(themeName);

    // Dispatch theme change event
    window.dispatchEvent(
      new CustomEvent('themeChange', {
        detail: { theme: themeName },
      })
    );

    if (isDevelopment()) {
       
      console.log(`🎨 Theme changed to: ${themeName}`);
    }
  };

  /**
   * Gets application status
   * @returns {Object} Application status
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
   * Destroys the application and cleans up
   */
  const destroy = () => {
    if (isDevelopment()) {
       
      console.log('🔄 Destroying application...');
    }

    // Destroy current story
    if (currentStory && currentStory.destroy) {
      currentStory.destroy();
    }

    // Clear caches
    storyblok.clearCache();

    // Clear container
    container.innerHTML = '';

    // Remove ready class
    document.body.classList.remove('app-ready');

    if (isDevelopment()) {
       
      console.log('✅ Application destroyed');
    }
  };

  const api = {
    init,
    navigateToRoute,
    changeTheme,
    getStatus,
    destroy,
  };

  // Expose for debugging in development only
  if (isDevelopment()) {
    api.storyblok = storyblok;
  }

  return api;
};
