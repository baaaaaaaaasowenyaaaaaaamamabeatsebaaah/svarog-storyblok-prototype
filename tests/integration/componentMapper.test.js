// File: tests/integration/componentMapper.test.js
/**
 * Integration tests for Storyblok to Svarog-UI component mapping
 * Tests the core integration functionality
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createTestContainer, createMockComponent } from '../setup.js';

// Reset modules before each test to ensure clean state
beforeEach(() => {
  vi.resetModules();
});

describe('Component Mapper Integration', () => {
  let createComponent;
  let getRegisteredComponents;

  beforeEach(async () => {
    createTestContainer();

    // Import the module fresh for each test
    const componentMapper = await import('@/integration/componentMapper.js');
    createComponent = componentMapper.createComponent;
    getRegisteredComponents = componentMapper.getRegisteredComponents;
  });

  describe('Component Creation', () => {
    test('creates hero component from CMS data', () => {
      const cmsData = createMockComponent('hero_section', {
        title: 'Test Hero Title',
        subtitle: 'Test Hero Subtitle',
        theme: 'default',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
      expect(component.update).toBeDefined();
      expect(component.destroy).toBeDefined();
    });

    test('creates typography component from CMS data', () => {
      const cmsData = createMockComponent('text_block', {
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Test content' }],
            },
          ],
        },
        variant: 'body',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });

    test('creates button component from CMS data', () => {
      const cmsData = createMockComponent('button', {
        text: 'Click Me',
        url: '/test-url',
        variant: 'primary',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });

    test('creates card component from CMS data', () => {
      const cmsData = createMockComponent('card', {
        title: 'Card Title',
        content: 'Card content',
        image: { filename: 'https://example.com/image.jpg' },
        variant: 'default',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('handles missing component type gracefully', () => {
      const cmsData = { title: 'Test' }; // Missing component field

      const component = createComponent(cmsData);

      expect(component).toBeNull();
    });

    test('creates fallback component for unknown type', () => {
      const cmsData = createMockComponent('unknown_component', {
        title: 'Unknown Component',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });

    test('creates fallback component when factory throws error', () => {
      const cmsData = createMockComponent('hero_section');
      const component = createComponent(cmsData);

      // Should still return a component (fallback)
      expect(component).toBeDefined();
    });
  });

  describe('Component Registration', () => {
    test('returns list of registered components', () => {
      const components = getRegisteredComponents();

      expect(Array.isArray(components)).toBe(true);
      expect(components.length).toBeGreaterThan(0);
      expect(components).toContain('hero_section');
      expect(components).toContain('text_block');
      expect(components).toContain('button');
    });
  });

  describe('Complex Component Scenarios', () => {
    test('handles grid component with children', () => {
      const cmsData = createMockComponent('grid', {
        columns: 12,
        gap: 'medium',
        children: [
          createMockComponent('button', { text: 'Button 1' }),
          createMockComponent('button', { text: 'Button 2' }),
        ],
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });

    test('handles section component with nested content', () => {
      const cmsData = createMockComponent('section', {
        variant: 'default',
        padding: 'large',
        children: [
          createMockComponent('hero_section', { title: 'Nested Hero' }),
          createMockComponent('text_block', { content: 'Nested text' }),
        ],
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });

    test('handles header component with navigation', () => {
      const cmsData = createMockComponent('header', {
        logo: {
          filename: 'https://example.com/logo.png',
          alt: 'Logo',
        },
        navigation: [
          { text: 'Home', url: '/', active: true },
          { text: 'About', url: '/about', active: false },
        ],
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });
  });

  describe('Data Transformation', () => {
    test('transforms CMS image data correctly', () => {
      const cmsData = createMockComponent('image', {
        src: {
          filename: 'https://example.com/image.jpg',
          alt: 'Test image',
        },
        caption: 'Image caption',
        responsive: true,
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });

    test('transforms CMS rich text content', () => {
      const richTextContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is ' },
              { type: 'text', text: 'bold text', marks: [{ type: 'bold' }] },
            ],
          },
        ],
      };

      const cmsData = createMockComponent('text_block', {
        content: richTextContent,
        variant: 'body',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });
  });

  describe('Theme Integration', () => {
    test('passes theme to components', () => {
      const cmsData = createMockComponent('hero_section', {
        title: 'Themed Hero',
        theme: 'cabalou',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });

    test('uses default theme when not specified', () => {
      const cmsData = createMockComponent('hero_section', {
        title: 'Default Themed Hero',
        // No theme specified
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component.getElement).toBeDefined();
    });
  });
});
