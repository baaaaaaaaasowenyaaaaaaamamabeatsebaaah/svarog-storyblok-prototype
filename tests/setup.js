/**
 * Vitest test setup for Svarog-UI + Storyblok integration
 * Configures testing environment with mocks and utilities
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    MODE: 'test',
    VITE_STORYBLOK_TOKEN: 'test_token_123',
    VITE_STORYBLOK_VERSION: 'draft',
  },
});

// Mock Storyblok client - with conditional error handling
vi.mock('storyblok-js-client', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockImplementation(path => {
        // Simulate error for non-existent stories
        if (path.includes('non-existent-story')) {
          return Promise.reject(new Error('Story not found'));
        }

        return Promise.resolve({
          data: {
            story: {
              id: 123,
              name: 'Test Story',
              slug: 'test-story',
              content: {
                title: 'Test Story Title',
                body: [
                  {
                    component: 'hero_section',
                    title: 'Test Hero',
                    subtitle: 'Test Subtitle',
                  },
                ],
              },
              published_at: '2023-01-01T00:00:00.000Z',
            },
          },
        });
      }),
      cache: {
        clear: vi.fn(),
        getStats: vi.fn(() => ({ size: 0 })),
      },
    })),
  };
});

// Mock Svarog-UI components
vi.mock('svarog-ui', () => ({
  Button: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('button');
      el.textContent = 'Button';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Typography: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('div');
      el.textContent = 'Typography';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Card: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('div');
      el.className = 'card';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Hero: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('section');
      el.className = 'hero';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Grid: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('div');
      el.className = 'grid';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Section: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('section');
      el.className = 'section';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Image: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('img');
      el.src = 'test.jpg';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Header: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('header');
      el.className = 'header';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Footer: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('footer');
      el.className = 'footer';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  Navigation: vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('nav');
      el.className = 'navigation';
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  })),
  switchTheme: vi.fn(),
  getCurrentTheme: vi.fn(() => 'default'),
  setThemeVariable: vi.fn(),
}));

// Mock DOM APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
});

// Mock console methods to reduce test noise
const originalConsole = { ...console };

beforeEach(() => {
  // Reset all mocks
  vi.clearAllMocks();

  // Mock console methods for cleaner test output
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  // Clean up DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '<title>Test</title>';

  // Restore console
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Test utilities
export const createTestContainer = () => {
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);
  return container;
};

export const createMockStoryblokStory = (overrides = {}) => ({
  id: 123,
  name: 'Test Story',
  slug: 'test-story',
  content: {
    title: 'Test Story Title',
    body: [
      {
        component: 'hero_section',
        title: 'Test Hero',
        subtitle: 'Test Subtitle',
      },
    ],
    ...overrides.content,
  },
  published_at: '2023-01-01T00:00:00.000Z',
  ...overrides,
});

export const createMockComponent = (type = 'hero_section', props = {}) => ({
  component: type,
  title: 'Test Component',
  ...props,
});
