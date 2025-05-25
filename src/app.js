// File: src/app.js
/**
 * Example page application with Storyblok integration
 * Shows Hero, Typography, Button, and Card components working together
 */

import { switchTheme, getCurrentTheme } from 'svarog-ui';
import { createStoryblokClient } from './integration/storyblokClient.js';
import { isDevelopment } from './utils/environment.js';

/**
 * Creates the example page application
 * @param {Object} config - Application configuration
 * @returns {Object} Application API
 */
export const createApp = (config = {}) => {
  const {
    container = document.getElementById('app'),
    theme = 'default',
    enableLivePreview = true,
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

  if (isDevelopment()) {
    console.log('🚀 Initializing Svarog-UI + Storyblok Example App');
    console.log(`🎨 Theme: ${getCurrentTheme()}`);
  }

  /**
   * Initializes the application
   */
  const init = async () => {
    try {
      // Set up routing
      setupRouter();

      // Enable live preview for Storyblok
      if (enableLivePreview && isDevelopment()) {
        enableStoryblokPreview();
      }

      // Load initial content
      await loadExamplePage();

      // Mark app as ready
      document.body.classList.add('app-ready');

      // Add theme switcher in development
      if (isDevelopment()) {
        addThemeSwitcher();
      }

      // Dispatch ready event
      window.dispatchEvent(
        new CustomEvent('appReady', {
          detail: { theme: getCurrentTheme() },
        })
      );

      if (isDevelopment()) {
        console.log('✅ Example app initialized successfully');
        console.log('📝 Edit content in Storyblok to see live preview!');
      }
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      renderErrorState(error);
    }
  };

  /**
   * Load example page content from Storyblok
   */
  const loadExamplePage = async () => {
    try {
      showLoadingState();

      // Try to load 'home' story, fallback to example content
      let story;
      try {
        story = await storyblok.getStoryWithComponents('home');
      } catch (error) {
        console.warn('Home story not found, using example content', error);
        story = createExampleStory();
      }

      // Render story to container
      currentStory = await renderStoryToContainer(story);

      hideLoadingState();
    } catch (error) {
      console.error('Failed to load example page:', error);
      hideLoadingState();
      renderFallbackContent();
    }
  };

  /**
   * Create example story structure if Storyblok content doesn't exist
   */
  const createExampleStory = () => {
    return {
      id: 'example',
      name: 'Example Page',
      slug: 'home',
      content: {
        title: 'Example Page',
        description: 'Svarog-UI + Storyblok Integration Example',
        body: [
          {
            component: 'hero_section',
            title: 'Welcome to Svarog-UI + Storyblok',
            subtitle:
              'A powerful integration showcasing modern web development',
            theme: 'default',
            cta_button: {
              text: 'Get Started',
              url: '#features',
              variant: 'primary',
            },
          },
          {
            component: 'section',
            variant: 'default',
            padding: 'large',
            children: [
              {
                component: 'text_block',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'heading',
                      attrs: { level: 2 },
                      content: [{ type: 'text', text: 'Features' }],
                    },
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'This example demonstrates the seamless integration between ',
                        },
                        {
                          type: 'text',
                          text: 'Svarog-UI',
                          marks: [{ type: 'bold' }],
                        },
                        { type: 'text', text: ' and ' },
                        {
                          type: 'text',
                          text: 'Storyblok CMS',
                          marks: [{ type: 'bold' }],
                        },
                        {
                          type: 'text',
                          text: '. Edit this content in Storyblok to see live preview in action!',
                        },
                      ],
                    },
                  ],
                },
                variant: 'body',
                alignment: 'left',
              },
            ],
          },
          {
            component: 'grid',
            columns: 12,
            gap: 'medium',
            children: [
              {
                component: 'card',
                title: 'Component Library',
                content:
                  'Powerful Svarog-UI components with automatic style injection and theming.',
                variant: 'default',
              },
              {
                component: 'card',
                title: 'Headless CMS',
                content:
                  "Flexible content management with Storyblok's visual editor.",
                variant: 'default',
              },
              {
                component: 'card',
                title: 'Live Preview',
                content:
                  'Real-time content updates directly from the Storyblok editor.',
                variant: 'default',
              },
            ],
          },
          {
            component: 'section',
            variant: 'primary',
            padding: 'medium',
            children: [
              {
                component: 'text_block',
                content: {
                  type: 'doc',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Try changing the theme using the switcher in the top-right corner, or edit this content in Storyblok!',
                        },
                      ],
                    },
                  ],
                },
                variant: 'body',
                alignment: 'center',
              },
              {
                component: 'button',
                text: 'Switch Theme',
                variant: 'secondary',
                onClick: () => switchToNextTheme(),
              },
            ],
          },
        ],
      },
      renderedComponents: [],
    };
  };

  /**
   * Render story to container
   */
  const renderStoryToContainer = async story => {
    // Clear existing content
    container.innerHTML = '';

    // Create components from story
    const components =
      story.renderedComponents?.length > 0
        ? story.renderedComponents
        : await storyblok.createComponentsFromStory(story);

    // Render components to container
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
   * Enable Storyblok live preview
   */
  const enableStoryblokPreview = () => {
    if (window.storyblok) {
      window.storyblok.on(['input', 'published', 'change'], event => {
        if (event.action === 'input') {
          console.log('📝 Content updated in Storyblok, refreshing...');
          refreshContent();
        }
      });

      window.storyblok.pingEditor();

      if (isDevelopment()) {
        console.log('🔄 Storyblok live preview enabled');
      }
    } else {
      console.warn('Storyblok bridge not found - live preview disabled');
    }
  };

  /**
   * Refresh content when Storyblok updates
   */
  const refreshContent = async () => {
    try {
      // Add visual feedback
      container.style.opacity = '0.7';

      // Destroy current story
      if (currentStory && currentStory.destroy) {
        currentStory.destroy();
      }

      // Reload content
      await loadExamplePage();

      // Restore opacity
      container.style.opacity = '1';
    } catch (error) {
      console.error('Failed to refresh content:', error);
      container.style.opacity = '1';
    }
  };

  /**
   * Set up basic routing
   */
  const setupRouter = () => {
    // Handle browser navigation
    window.addEventListener('popstate', () => {
      loadExamplePage();
    });

    // Handle link clicks
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="/"], a[href^="#"]');
      if (link && !link.hasAttribute('target')) {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          event.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  };

  /**
   * Add theme switcher for development
   */
  const addThemeSwitcher = () => {
    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.innerHTML = `
      <label>Theme:</label>
      <select id="theme-select">
        <option value="default">Default</option>
        <option value="cabalou">Cabalou</option>
        <option value="muchandy">Muchandy</option>
      </select>
    `;

    const select = switcher.querySelector('#theme-select');
    select.value = getCurrentTheme();
    select.addEventListener('change', e => {
      changeTheme(e.target.value);
    });

    document.body.appendChild(switcher);
  };

  /**
   * Switch to next theme (for button demo)
   */
  const switchToNextTheme = () => {
    const themes = ['default', 'cabalou', 'muchandy'];
    const current = getCurrentTheme();
    const currentIndex = themes.indexOf(current);
    const nextIndex = (currentIndex + 1) % themes.length;
    changeTheme(themes[nextIndex]);
  };

  /**
   * Show loading state
   */
  const showLoadingState = () => {
    container.innerHTML = `
      <div class="app-loading">
        <div class="loading-spinner"></div>
        <p>Loading example content...</p>
      </div>
    `;
  };

  /**
   * Hide loading state
   */
  const hideLoadingState = () => {
    const loadingElement = container.querySelector('.app-loading');
    if (loadingElement) {
      loadingElement.remove();
    }
  };

  /**
   * Render error state
   */
  const renderErrorState = error => {
    container.innerHTML = `
      <div class="app-error">
        <h1>🚧 Setup Required</h1>
        <p>To see the full example, please:</p>
        <ol>
          <li>Add your Storyblok token to <code>.env</code></li>
          <li>Create a 'home' story in Storyblok</li>
          <li>Add some components to see them render</li>
        </ol>
        <button onclick="window.location.reload()" class="retry-button">
          Try Again
        </button>
        ${
          isDevelopment()
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
   * Render fallback content when Storyblok is not available
   */
  const renderFallbackContent = () => {
    container.innerHTML = `
      <div class="fallback-content">
        <h1>🎨 Svarog-UI + Storyblok Example</h1>
        <p>This example shows how to integrate Svarog-UI components with Storyblok CMS.</p>
        <p><strong>To get started:</strong></p>
        <ol>
          <li>Set up your Storyblok space</li>
          <li>Add your access token to <code>.env</code></li>
          <li>Create a 'home' story with components</li>
        </ol>
        <button onclick="window.location.reload()">
          Retry Connection
        </button>
      </div>
    `;
  };

  /**
   * Change theme and update UI
   */
  const changeTheme = themeName => {
    switchTheme(themeName);

    // Update theme switcher if it exists
    const select = document.getElementById('theme-select');
    if (select) {
      select.value = themeName;
    }

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
   * Navigate to route (for future expansion)
   */
  const navigateToRoute = async path => {
    currentRoute = path;
    await loadExamplePage();
  };

  /**
   * Destroy application and clean up
   */
  const destroy = () => {
    if (isDevelopment()) {
      console.log('🔄 Destroying application...');
    }

    // Destroy current story
    if (currentStory && currentStory.destroy) {
      currentStory.destroy();
    }

    // Clear container
    container.innerHTML = '';

    // Remove ready class
    document.body.classList.remove('app-ready');

    // Remove theme switcher
    const switcher = document.querySelector('.theme-switcher');
    if (switcher) {
      switcher.remove();
    }

    if (isDevelopment()) {
      console.log('✅ Application destroyed');
    }
  };

  return {
    init,
    navigateToRoute,
    changeTheme,
    getStatus,
    destroy,
    // Expose for debugging in development
    ...(isDevelopment() && { storyblok }),
  };
};
