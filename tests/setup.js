// File: tests/setup.js
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

// Mock Storyblok client
vi.mock('storyblok-js-client', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      get: vi.fn().mockImplementation(path => {
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

// Create a factory for mock Svarog components
const createMockSvarogComponent = name => {
  return vi.fn(() => ({
    getElement: () => {
      const el = document.createElement('div');
      el.className = name.toLowerCase();
      el.textContent = name;
      return el;
    },
    update: vi.fn(),
    destroy: vi.fn(),
  }));
};

// Mock Svarog-UI components - ALL components
vi.mock('svarog-ui', () => ({
  // Layout Components
  Grid: createMockSvarogComponent('Grid'),
  Section: createMockSvarogComponent('Section'),
  Page: createMockSvarogComponent('Page'),

  // Content Components
  Hero: createMockSvarogComponent('Hero'),
  MuchandyHero: createMockSvarogComponent('MuchandyHero'),
  Typography: createMockSvarogComponent('Typography'),
  Card: createMockSvarogComponent('Card'),
  Image: createMockSvarogComponent('Image'),
  Logo: createMockSvarogComponent('Logo'),

  // Navigation Components
  Header: createMockSvarogComponent('Header'),
  CollapsibleHeader: createMockSvarogComponent('CollapsibleHeader'),
  Navigation: createMockSvarogComponent('Navigation'),
  Footer: createMockSvarogComponent('Footer'),
  Pagination: createMockSvarogComponent('Pagination'),
  Tabs: createMockSvarogComponent('Tabs'),

  // Form Components
  Form: createMockSvarogComponent('Form'),
  FormGroup: createMockSvarogComponent('FormGroup'),
  FormSection: createMockSvarogComponent('FormSection'),
  FormActions: createMockSvarogComponent('FormActions'),
  Input: createMockSvarogComponent('Input'),
  Select: createMockSvarogComponent('Select'),
  Checkbox: createMockSvarogComponent('Checkbox'),
  Radio: createMockSvarogComponent('Radio'),
  RadioGroup: createMockSvarogComponent('RadioGroup'),
  ConditionSelector: createMockSvarogComponent('ConditionSelector'),

  // UI Components
  Button: createMockSvarogComponent('Button'),
  Link: createMockSvarogComponent('Link'),
  Rating: createMockSvarogComponent('Rating'),
  PriceDisplay: createMockSvarogComponent('PriceDisplay'),
  StepsIndicator: createMockSvarogComponent('StepsIndicator'),

  // Blog Components
  BlogCard: createMockSvarogComponent('BlogCard'),
  BlogList: createMockSvarogComponent('BlogList'),
  BlogDetail: createMockSvarogComponent('BlogDetail'),

  // Product Components
  ProductCard: createMockSvarogComponent('ProductCard'),

  // Specialized Components
  PhoneRepairForm: createMockSvarogComponent('PhoneRepairForm'),
  UsedPhonePriceForm: createMockSvarogComponent('UsedPhonePriceForm'),
  ContactInfo: createMockSvarogComponent('ContactInfo'),
  StickyContactIcons: createMockSvarogComponent('StickyContactIcons'),
  Map: createMockSvarogComponent('Map'),

  // Additional exports that might be used
  Content: createMockSvarogComponent('Content'),
  Forms: createMockSvarogComponent('Forms'),
  Layout: createMockSvarogComponent('Layout'),
  Nav: createMockSvarogComponent('Nav'),
  UI: createMockSvarogComponent('UI'),
  Utils: createMockSvarogComponent('Utils'),
  Head: createMockSvarogComponent('Head'),
  PhoneRepairFormContainer: createMockSvarogComponent(
    'PhoneRepairFormContainer'
  ),
  UsedPhonePriceFormContainer: createMockSvarogComponent(
    'UsedPhonePriceFormContainer'
  ),

  // Helper functions
  switchTheme: vi.fn(),
  getCurrentTheme: vi.fn(() => 'default'),
  setThemeVariable: vi.fn(),
  themeManager: {
    switch: vi.fn(),
    getCurrent: vi.fn(() => 'default'),
    getRegistered: vi.fn(() => ['default']),
  },
}));

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn(html => html),
  },
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
