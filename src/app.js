// File: src/app.js
/**
 * Component showcase application with Storyblok integration
 * Loads and displays ALL components from Storyblok CMS
 */

import { createStoryblokClient } from './integration/storyblokClient.js';
import { isDevelopment } from './utils/environment.js';

/**
 * Creates the showcase application
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

  // Current state
  let currentStory = null;
  let currentRoute = '/';

  if (isDevelopment()) {
    console.log('🚀 Initializing Svarog-UI Component Showcase');
    console.log('🎨 Theme: default');
    console.log('📡 Loading content from Storyblok...');
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

      // Load showcase content from Storyblok
      await loadShowcaseFromStoryblok();

      // Mark app as ready
      document.body.classList.add('app-ready');

      // Dispatch ready event
      window.dispatchEvent(
        new CustomEvent('appReady', {
          detail: { theme: 'default' },
        })
      );

      if (isDevelopment()) {
        console.log('✅ Component showcase loaded from Storyblok');
      }
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      renderErrorState(error);
    }
  };

  /**
   * Load showcase page from Storyblok
   */
  const loadShowcaseFromStoryblok = async () => {
    try {
      showLoadingState();

      // Get the current path or default to home
      const slug = getCurrentSlug();

      // Load story from Storyblok
      const story = await storyblok.getStoryWithComponents(slug);

      // Render story to container
      currentStory = await renderStoryToContainer(story);

      hideLoadingState();

      if (isDevelopment()) {
        console.log('📄 Loaded story:', story.name);
        console.log('🧩 Components:', story.content.body?.length || 0);
      }
    } catch (error) {
      console.error('Failed to load from Storyblok:', error);
      hideLoadingState();
      renderStoryblokSetupGuide();
    }
  };

  /**
   * Get current slug from URL
   */
  const getCurrentSlug = () => {
    const path = window.location.pathname;
    if (path === '/' || path === '') {
      return 'home';
    }
    return path.replace(/^\/|\/$/g, '');
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

    // Add navigation if not present
    if (!container.querySelector('header')) {
      addNavigationHeader();
    }

    // Render components to container
    const elements = components.map(component => {
      const element = component.getElement();

      // Add data attributes for debugging
      if (isDevelopment() && element) {
        element.setAttribute(
          'data-component-type',
          component.type || 'unknown'
        );
      }

      container.appendChild(element);
      return element;
    });

    // Add component info footer in development
    if (isDevelopment()) {
      addComponentInfoFooter(components.length);
    }

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
   * Add navigation header for easier browsing
   */
  const addNavigationHeader = () => {
    const nav = document.createElement('nav');
    nav.className = 'showcase-nav';
    nav.innerHTML = `
      <div style="
        background: #f8f9fa;
        padding: 1rem;
        border-bottom: 1px solid #dee2e6;
        margin-bottom: 2rem;
      ">
        <div style="
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <h3 style="margin: 0; color: #333;">Svarog-UI + Storyblok</h3>
          <div>
            <a href="/" style="margin: 0 0.5rem;">Home</a>
            <a href="/component-showcase" style="margin: 0 0.5rem;">All Components</a>
            <a href="/examples" style="margin: 0 0.5rem;">Examples</a>
          </div>
        </div>
      </div>
    `;
    container.insertBefore(nav, container.firstChild);
  };

  /**
   * Add component count footer
   */
  const addComponentInfoFooter = count => {
    const footer = document.createElement('div');
    footer.className = 'component-info-footer';
    footer.innerHTML = `
      <div style="
        background: #f8f9fa;
        padding: 1rem;
        border-top: 1px solid #dee2e6;
        margin-top: 3rem;
        text-align: center;
        color: #6c757d;
        font-size: 0.875rem;
      ">
        <p style="margin: 0;">
          ${count} components loaded from Storyblok | 
          <a href="#" onclick="window.storyblok?.pingEditor()">Open Visual Editor</a> | 
          <a href="#" onclick="window.location.reload()">Refresh</a>
        </p>
      </div>
    `;
    container.appendChild(footer);
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

        // Show preview indicator
        showPreviewIndicator();
      }
    } else {
      console.warn('Storyblok bridge not found - live preview disabled');
    }
  };

  /**
   * Show live preview indicator
   */
  const showPreviewIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'storyblok-preview-indicator';
    indicator.innerHTML = '🔄 Live Preview Active';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: #00b3b0;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      z-index: 1000;
      opacity: 0.9;
    `;
    document.body.appendChild(indicator);

    // Fade out after 3 seconds
    setTimeout(() => {
      indicator.style.transition = 'opacity 0.3s';
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 300);
    }, 3000);
  };

  /**
   * Refresh content when Storyblok updates
   */
  const refreshContent = async () => {
    try {
      // Add visual feedback
      container.style.opacity = '0.7';
      container.style.transition = 'opacity 0.2s';

      // Destroy current story
      if (currentStory && currentStory.destroy) {
        currentStory.destroy();
      }

      // Reload content
      await loadShowcaseFromStoryblok();

      // Restore opacity
      container.style.opacity = '1';
    } catch (error) {
      console.error('Failed to refresh content:', error);
      container.style.opacity = '1';
    }
  };

  /**
   * Set up routing for different stories
   */
  const setupRouter = () => {
    // Handle browser navigation
    window.addEventListener('popstate', () => {
      loadShowcaseFromStoryblok();
    });

    // Handle link clicks
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="/"], a[href^="#"]');
      if (link && !link.hasAttribute('target')) {
        const href = link.getAttribute('href');

        if (href.startsWith('#')) {
          // Handle anchor links
          event.preventDefault();
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (href.startsWith('/')) {
          // Handle internal navigation
          event.preventDefault();
          window.history.pushState({}, '', href);
          loadShowcaseFromStoryblok();
        }
      }
    });
  };

  /**
   * Show loading state
   */
  const showLoadingState = () => {
    container.innerHTML = `
      <div class="app-loading">
        <div class="loading-spinner"></div>
        <p>Loading content from Storyblok...</p>
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
        <h1>❌ Error Loading Content</h1>
        <p>${error.message}</p>
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
   * Render Storyblok setup guide
   */
  const renderStoryblokSetupGuide = () => {
    container.innerHTML = `
      <div class="setup-guide">
        <h1>🚀 Storyblok Setup Guide</h1>
        <p>To display your component showcase, please set up Storyblok:</p>
        
        <h2>1. Environment Configuration</h2>
        <pre style="background: #f8f9fa; padding: 1rem; border-radius: 4px;">
# .env file
VITE_STORYBLOK_TOKEN=your_preview_token_here
VITE_STORYBLOK_VERSION=draft</pre>
        
        <h2>2. Create Stories in Storyblok</h2>
        <p>Create these stories in your Storyblok space:</p>
        <ul>
          <li><strong>home</strong> - Main showcase page</li>
          <li><strong>component-showcase</strong> - All components display</li>
          <li><strong>examples</strong> - Usage examples</li>
        </ul>
        
        <h2>3. Add Components to Your Story</h2>
        <p>In the Visual Editor, add these component blocks:</p>
        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        ">
          ${getAvailableComponents()
            .map(
              comp => `
            <div style="
              background: #f8f9fa;
              padding: 0.5rem;
              border-radius: 4px;
              font-size: 0.875rem;
            ">
              <strong>${comp}</strong>
            </div>
          `
            )
            .join('')}
        </div>
        
        <h2>4. Enable Preview URL</h2>
        <p>In Storyblok Settings → Visual Editor:</p>
        <ul>
          <li>Set preview URL: <code>https://localhost:3000/</code></li>
          <li>Enable HTTPS for real-time API</li>
        </ul>
        
        <button onclick="window.location.reload()" class="retry-button">
          Retry After Setup
        </button>
      </div>
    `;
  };

  /**
   * Get list of available components
   */
  const getAvailableComponents = () => {
    return [
      'hero_section',
      'text_block',
      'button',
      'card',
      'grid',
      'section',
      'image',
      'header',
      'footer',
      'navigation',
      'form',
      'input',
      'select',
      'checkbox',
      'blog_card',
      'product_card',
      'tabs',
      'rating',
      'price_display',
      'contact_info',
      'map',
    ];
  };

  /**
   * Get application status
   */
  const getStatus = () => {
    return {
      ready: document.body.classList.contains('app-ready'),
      currentRoute,
      currentTheme: 'default',
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
    await loadShowcaseFromStoryblok();
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

    if (isDevelopment()) {
      console.log('✅ Application destroyed');
    }
  };

  return {
    init,
    navigateToRoute,
    getStatus,
    destroy,
    // Expose for debugging in development
    ...(isDevelopment() && { storyblok }),
  };
};
