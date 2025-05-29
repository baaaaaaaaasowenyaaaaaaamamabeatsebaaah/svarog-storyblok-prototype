// src/app.js
/**
 * Main application for Svarog-UI + Storyblok integration
 * Uses available components and creates fallbacks for missing ones
 */

import { createStoryblokClient } from './integration/storyblokClient.js';
import { isDevelopment } from './utils/environment.js';

// Import what's actually available from svarog-ui-core
import {
  Button,
  Card,
  CollapsibleHeader,
  // ContactInfo - available but not needed for basic setup
} from 'svarog-ui-core';

/**
 * Create fallback components for missing exports
 */
const createTypography = (props = {}) => {
  const element = document.createElement(
    props.variant === 'heading' ? 'h1' : 'p'
  );
  element.className = `svarog-typography ${props.className || ''}`.trim();

  if (props.children) {
    if (typeof props.children === 'string') {
      element.innerHTML = props.children;
    } else {
      element.textContent = String(props.children);
    }
  }

  // Apply basic styling
  if (props.variant === 'heading') {
    element.style.cssText = `
      font-size: 2rem;
      font-weight: bold;
      margin: 1rem 0;
      color: var(--svarog-text, #2D1810);
    `;
  } else {
    element.style.cssText = `
      font-size: 1rem;
      line-height: 1.6;
      margin: 0.5rem 0;
      color: var(--svarog-text, #2D1810);
    `;
  }

  if (props.alignment === 'center') {
    element.style.textAlign = 'center';
  }

  return {
    getElement: () => element,
    update: newProps => {
      if (newProps.children) {
        if (typeof newProps.children === 'string') {
          element.innerHTML = newProps.children;
        } else {
          element.textContent = String(newProps.children);
        }
      }
    },
    destroy: () => element.remove(),
  };
};

const createSection = (props = {}) => {
  const element = document.createElement('section');
  element.className = `svarog-section ${props.className || ''}`.trim();

  // Apply basic styling
  element.style.cssText = `
    padding: ${props.padding === 'large' ? '3rem 1rem' : props.padding === 'small' ? '1rem' : '2rem 1rem'};
    background: var(--svarog-background, #FDF8F0);
  `;

  if (props.variant === 'minor') {
    element.style.backgroundColor = 'var(--svarog-surface, white)';
  }

  // Handle children
  if (props.children && Array.isArray(props.children)) {
    props.children.forEach(child => {
      if (child && child.getElement) {
        element.appendChild(child.getElement());
      }
    });
  }

  return {
    getElement: () => element,
    update: _newProps => {
      // Update logic if needed
    },
    destroy: () => {
      element.remove();
    },
  };
};

const createHeader = (props = {}) => {
  // Use CollapsibleHeader as base, or create simple header
  try {
    // Try to use CollapsibleHeader if it works with our props
    return CollapsibleHeader({
      logo: props.logo,
      navigation: props.navigation,
      ...props,
    });
  } catch (error) {
    console.warn('CollapsibleHeader failed, using simple header:', error);

    // Fallback to simple header
    const element = document.createElement('header');
    element.className = 'svarog-header';
    element.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--svarog-surface, white);
      border-bottom: 1px solid var(--svarog-border, #E6D5C7);
    `;

    // Add logo
    if (props.logo) {
      const logo = document.createElement('a');
      logo.href = props.logo.href || '/';
      logo.textContent = props.logo.alt || 'Logo';
      logo.style.cssText = `
        font-weight: bold;
        color: var(--svarog-primary, #8B4A6B);
        text-decoration: none;
      `;
      element.appendChild(logo);
    }

    // Add navigation
    if (props.navigation && Array.isArray(props.navigation)) {
      const nav = document.createElement('nav');
      nav.style.cssText = 'display: flex; gap: 1rem;';

      props.navigation.forEach(item => {
        const link = document.createElement('a');
        link.href = item.href || '#';
        link.textContent = item.text || 'Link';
        link.style.cssText = `
          color: var(--svarog-text, #2D1810);
          text-decoration: none;
          padding: 0.5rem;
          ${item.active ? 'font-weight: bold; color: var(--svarog-primary, #8B4A6B);' : ''}
        `;
        nav.appendChild(link);
      });

      element.appendChild(nav);
    }

    return {
      getElement: () => element,
      update: () => {},
      destroy: () => element.remove(),
    };
  }
};

// Create component aliases
const Typography = createTypography;
const Section = createSection;
const Header = createHeader;

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
   * Add default navigation using Header component
   */
  const addDefaultNavigation = () => {
    try {
      // Create navigation using Header component
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
      console.warn('Failed to create header, using minimal fallback:', error);
      // Minimal fallback
      const nav = document.createElement('nav');
      nav.innerHTML = `
        <div style="padding: 1rem; background: var(--svarog-surface, white);">
          <a href="/" style="margin-right: 1rem;">Home</a>
          <a href="/about" style="margin-right: 1rem;">About</a>
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
   * Show loading state using Card component
   */
  const showLoadingState = () => {
    try {
      // Use available Card component for loading
      const loadingCard = Card({
        title: 'Loading...',
        content: 'Loading your content...',
        variant: 'default',
      });

      // Clear container and show loading
      container.innerHTML = '';
      container.appendChild(loadingCard.getElement());
    } catch (error) {
      console.warn('Failed to create loading state:', error);
      // Minimal fallback
      container.innerHTML =
        '<div style="padding: 2rem; text-align: center;">Loading...</div>';
    }
  };

  /**
   * Hide loading state
   */
  const hideLoadingState = () => {
    // Loading will be replaced by actual content
  };

  /**
   * Show error state using available components
   */
  const showErrorState = error => {
    try {
      // Create error display using available components
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
    } catch (componentError) {
      console.warn('Failed to create component error state:', componentError);
      // Minimal fallback without components
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center;">
          <h1>Unable to Load Application</h1>
          <p>${error.message}</p>
          <button onclick="window.location.reload()" style="
            padding: 0.5rem 1rem;
            background: var(--svarog-primary, #8B4A6B);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Try Again</button>
        </div>
      `;
    }
  };

  /**
   * Show setup guide using available components
   */
  const showSetupGuide = () => {
    try {
      // Create setup guide using available components
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
    } catch (componentError) {
      console.warn('Failed to create component setup guide:', componentError);
      // Minimal fallback
      container.innerHTML = `
        <div style="padding: 2rem;">
          <h1>🚀 Welcome to Svarog-UI + Storyblok</h1>
          <p>Let's get your website up and running!</p>
          <button onclick="window.location.reload()" style="
            padding: 0.5rem 1rem;
            background: var(--svarog-primary, #8B4A6B);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          ">Check Again</button>
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
