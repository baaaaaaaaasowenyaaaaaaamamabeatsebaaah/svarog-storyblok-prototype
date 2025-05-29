// src/app.js
/**
 * Main application for Svarog-UI + Storyblok integration
 * Uses Svarog-UI components with muchandy theme
 */

import { createStoryblokClient } from './integration/storyblokClient.js';
import { isDevelopment } from './utils/environment.js';
// Import Svarog-UI components for UI states
import { Typography, Button, Card, Section, Header } from 'svarog-ui';

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

      // Dispatch ready event
      window.dispatchEvent(
        new CustomEvent('appReady', {
          detail: {
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

      // Render story using Svarog-UI
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
   * Render story using Svarog-UI components
   */
  const renderStory = async story => {
    // Clear existing content
    container.innerHTML = '';

    // Create components from story
    const components =
      story.renderedComponents?.length > 0
        ? story.renderedComponents
        : await storyblok.createComponentsFromStory(story);

    // Add navigation if needed using Svarog-UI
    if (!container.querySelector('header')) {
      addDefaultNavigation();
    }

    // Render Svarog-UI components
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
   * Add default navigation using Svarog-UI Header component
   */
  const addDefaultNavigation = () => {
    try {
      // Create navigation using Svarog-UI Header component
      const headerComponent = Header({
        logo: {
          alt: 'Website Logo',
          href: '/',
        },
        navigation: [
          { text: 'Home', href: '/', active: currentRoute === '/' },
          { text: 'About', href: '/about', active: currentRoute === '/about' },
          {
            text: 'Contact',
            href: '/contact',
            active: currentRoute === '/contact',
          },
        ],
      });

      // Insert at beginning of container
      const headerElement = headerComponent.getElement();
      container.insertBefore(headerElement, container.firstChild);
    } catch (error) {
      console.warn(
        'Failed to create Svarog-UI header, using minimal fallback:',
        error
      );
      // Minimal fallback without custom styling
      const nav = document.createElement('nav');
      nav.innerHTML = `
        <div>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </div>
      `;
      container.insertBefore(nav, container.firstChild);
    }
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
      // Destroy current story
      if (currentStory?.destroy) {
        currentStory.destroy();
      }

      // Reload content
      await loadContent();
    } catch (error) {
      console.error('Failed to refresh content:', error);
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
   * Show loading state using Svarog-UI components
   */
  const showLoadingState = () => {
    try {
      // Use Svarog-UI Card and Typography for loading
      const loadingCard = Card({
        children: 'Loading content...',
        variant: 'default',
      });

      // Clear container and show loading
      container.innerHTML = '';
      container.appendChild(loadingCard.getElement());
    } catch (error) {
      console.warn('Failed to create Svarog-UI loading state:', error);
      // Minimal fallback
      container.innerHTML = '<div>Loading...</div>';
    }
  };

  /**
   * Hide loading state
   */
  const hideLoadingState = () => {
    // Loading will be replaced by actual content
  };

  /**
   * Show error state using Svarog-UI components
   */
  const showErrorState = error => {
    try {
      // Create error display using Svarog-UI components
      const errorSection = Section({
        children: [
          Typography({
            children: '❌ Unable to Load Content',
            variant: 'heading',
          }),
          Typography({
            children:
              error.message ||
              'An error occurred while loading the application.',
            variant: 'body',
          }),
          Button({
            text: 'Try Again',
            onClick: () => window.location.reload(),
            variant: 'primary',
          }),
        ],
        variant: 'default',
      });

      container.innerHTML = '';
      container.appendChild(errorSection.getElement());
    } catch (svarogError) {
      console.warn('Failed to create Svarog-UI error state:', svarogError);
      // Minimal fallback without styling
      container.innerHTML = `
        <div>
          <h1>Unable to Load Application</h1>
          <p>${error.message}</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      `;
    }
  };

  /**
   * Show setup guide using Svarog-UI components
   */
  const showSetupGuide = () => {
    try {
      // Create setup guide using Svarog-UI components
      const setupSection = Section({
        children: [
          Typography({
            children: '🚀 Welcome to Svarog-UI + Storyblok',
            variant: 'heading',
          }),
          Typography({
            children: "Let's get your website up and running!",
            variant: 'body',
          }),
          Typography({
            children: `
              <ol>
                <li>Add your Storyblok token to .env</li>
                <li>Create a story called "home" in Storyblok</li>
                <li>Add some components (hero, text, cards)</li>
                <li>Refresh this page</li>
              </ol>
            `,
            variant: 'body',
          }),
          Button({
            text: 'Check Again',
            onClick: () => window.location.reload(),
            variant: 'primary',
          }),
        ],
        variant: 'default',
      });

      container.innerHTML = '';
      container.appendChild(setupSection.getElement());
    } catch (svarogError) {
      console.warn('Failed to create Svarog-UI setup guide:', svarogError);
      // Minimal fallback
      container.innerHTML = `
        <div>
          <h1>🚀 Welcome to Svarog-UI + Storyblok</h1>
          <p>Let's get your website up and running!</p>
          <button onclick="window.location.reload()">Check Again</button>
        </div>
      `;
    }
  };

  /**
   * Get application status
   */
  const getStatus = () => {
    return {
      ready: Boolean(currentStory),
      currentRoute,
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
    }),
  };
};
