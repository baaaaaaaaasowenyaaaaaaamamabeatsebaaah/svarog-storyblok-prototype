// File: src/integration/storyblokClient.js
/**
 * Enhanced Storyblok client for Svarog-UI integration
 * Handles content fetching, caching, and component creation
 */

import StoryblokClient from 'storyblok-js-client';
import { createComponent } from './componentMapper.js';
import { getStoryblokConfig } from '../config/environment.js';
import { isDevelopment } from '../utils/environment.js';

/**
 * Creates an enhanced Storyblok client with Svarog-UI integration
 * @param {Object} config - Configuration object
 * @returns {Object} Enhanced client API
 */
export const createStoryblokClient = (config = {}) => {
  let storyblokConfig;

  try {
    storyblokConfig = getStoryblokConfig();
  } catch (error) {
    if (isDevelopment()) {
      console.warn('⚠️ Storyblok configuration error:', error.message);
      console.log('💡 Using fallback configuration for development');
    }

    // Fallback configuration for development
    storyblokConfig = {
      accessToken: 'demo_token',
      version: 'draft',
      region: 'eu',
      cache: false,
      enablePreview: true,
    };
  }

  const {
    accessToken = storyblokConfig.accessToken,
    version = storyblokConfig.version,
    region = storyblokConfig.region,
  } = config;

  // Initialize Storyblok client with fallback
  const client = new StoryblokClient({
    accessToken,
    cache: {
      clear: 'auto',
      type: 'memory',
    },
    region,
  });

  // Local cache for component instances
  const componentCache = new Map();
  const CACHE_TTL = 300000; // 5 minutes

  /**
   * Fetches story and creates Svarog-UI components
   * @param {string} slug - Story slug
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Story with rendered components
   */
  const getStoryWithComponents = async (slug, params = {}) => {
    try {
      const response = await client.get(`cdn/stories/${slug}`, {
        version,
        ...params,
      });

      const story = response.data.story;

      // Create components from story body
      const renderedComponents = await createComponentsFromStory(story);

      return {
        ...story,
        renderedComponents,
        metadata: {
          fetchedAt: new Date().toISOString(),
          slug,
          version,
        },
      };
    } catch (error) {
      if (isDevelopment()) {
        console.warn(`Failed to fetch story: ${slug}`, error.message);
        return createFallbackStory(slug);
      }
      throw new Error(`Story not found: ${slug}`);
    }
  };

  /**
   * Creates fallback story for development
   * @param {string} slug - Story slug
   * @returns {Object} Fallback story
   */
  const createFallbackStory = slug => ({
    id: 'fallback',
    name: `Fallback Story (${slug})`,
    slug,
    content: {
      title: 'Demo Content',
      description: 'This is fallback content for development',
      body: [
        {
          component: 'hero_section',
          title: 'Welcome to Svarog-UI + Storyblok',
          subtitle:
            'Demo content - configure your Storyblok token to see real content',
          theme: 'default',
        },
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
                    text: 'This is demo content. To see real content from Storyblok, please configure your VITE_STORYBLOK_TOKEN in the .env file.',
                  },
                ],
              },
            ],
          },
          variant: 'body',
        },
        {
          component: 'button',
          text: 'Get Started',
          url: '#setup',
          variant: 'primary',
        },
      ],
    },
    renderedComponents: [],
    metadata: {
      fetchedAt: new Date().toISOString(),
      slug,
      version: 'fallback',
    },
  });

  /**
   * Fetches multiple stories with components
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Array of stories with components
   */
  const getStoriesWithComponents = async (params = {}) => {
    try {
      const response = await client.get('cdn/stories', {
        version,
        ...params,
      });

      const stories = response.data.stories;

      // Create components for each story
      const storiesWithComponents = await Promise.all(
        stories.map(async story => {
          const renderedComponents = await createComponentsFromStory(story);
          return {
            ...story,
            renderedComponents,
          };
        })
      );

      return storiesWithComponents;
    } catch (error) {
      if (isDevelopment()) {
        console.warn('Failed to fetch stories, using fallback', error.message);
        return [createFallbackStory('home')];
      }
      throw new Error(`Failed to load stories: ${error.message}`);
    }
  };

  /**
   * Creates Svarog-UI components from story content
   * @param {Object} story - Storyblok story object
   * @returns {Promise<Array>} Array of rendered component instances
   */
  const createComponentsFromStory = async story => {
    if (!story.content || !story.content.body) {
      return [];
    }

    const cacheKey = `${story.id}_${story.published_at || Date.now()}`;

    // Check cache first
    if (componentCache.has(cacheKey)) {
      const cached = componentCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.components;
      }
      componentCache.delete(cacheKey);
    }

    try {
      // Create components from story body
      const components = story.content.body
        .map(block => createComponent(block))
        .filter(component => component !== null);

      // Cache the result
      componentCache.set(cacheKey, {
        components,
        timestamp: Date.now(),
      });

      return components;
    } catch (error) {
      console.error('Error creating components from story:', error);
      return [];
    }
  };

  /**
   * Renders components to a container element
   * @param {Array} components - Array of Svarog-UI component instances
   * @param {HTMLElement} container - Target container
   * @returns {Array} Array of DOM elements
   */
  const renderComponentsToContainer = (components, container) => {
    if (!container) {
      throw new Error('Container element is required');
    }

    // Clear existing content
    container.innerHTML = '';

    const elements = components.map(component => {
      const element = component.getElement();
      container.appendChild(element);
      return element;
    });

    return elements;
  };

  /**
   * Gets story by slug and renders to container
   * @param {string} slug - Story slug
   * @param {HTMLElement} container - Target container
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Rendered story data
   */
  const renderStoryToContainer = async (slug, container, params = {}) => {
    const storyWithComponents = await getStoryWithComponents(slug, params);
    const elements = renderComponentsToContainer(
      storyWithComponents.renderedComponents,
      container
    );

    return {
      story: storyWithComponents,
      elements,
      destroy: () => {
        // Cleanup all component instances
        storyWithComponents.renderedComponents.forEach(component => {
          if (component.destroy) {
            component.destroy();
          }
        });
      },
    };
  };

  /**
   * Updates story content and re-renders
   * @param {string} slug - Story slug
   * @param {HTMLElement} container - Target container
   * @returns {Promise<Object>} Updated story data
   */
  const refreshStory = async (slug, container) => {
    // Clear cache for this story
    const cacheKeys = Array.from(componentCache.keys()).filter(key =>
      key.includes(slug)
    );
    cacheKeys.forEach(key => componentCache.delete(key));

    // Re-fetch and render
    return await renderStoryToContainer(slug, container, { cb: Date.now() });
  };

  /**
   * Clears all caches
   */
  const clearCache = () => {
    componentCache.clear();
    if (client.cache) {
      client.cache.clear();
    }
  };

  /**
   * Gets cache statistics
   * @returns {Object} Cache statistics
   */
  const getCacheStats = () => {
    return {
      componentCacheSize: componentCache.size,
      storyblokCacheSize: client.cache
        ? client.cache.getStats?.() || 'Unknown'
        : 0,
    };
  };

  /**
   * Enables live preview for Storyblok Visual Editor
   * @param {Function} onStoryChange - Callback when story changes
   */
  const enableLivePreview = onStoryChange => {
    if (window.storyblok) {
      window.storyblok.on(['input', 'published', 'change'], event => {
        if (event.action === 'input') {
          clearCache();
          if (onStoryChange) {
            onStoryChange(event.story);
          }
        }
      });

      window.storyblok.pingEditor();
    }
  };

  return {
    // Core methods
    getStoryWithComponents,
    getStoriesWithComponents,
    renderStoryToContainer,
    refreshStory,

    // Component methods
    createComponentsFromStory,
    renderComponentsToContainer,

    // Cache methods
    clearCache,
    getCacheStats,

    // Live preview
    enableLivePreview,

    // Direct access to underlying client
    client,
  };
};
