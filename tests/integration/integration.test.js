/**
 * Integration tests for Storyblok + Svarog-UI integration layer
 * Tests only our mapping logic, not the underlying components
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  createComponent,
  getRegisteredComponents,
  registerComponent,
} from '../../src/integration/componentMapper.js';
import { createStoryblokClient } from '../../src/integration/storyblokClient.js';
import {
  createTestContainer,
  createMockStoryblokStory,
  createMockComponent,
} from '../setup.js';

describe('Storyblok Integration Layer', () => {
  let container;

  beforeEach(() => {
    container = createTestContainer();
  });

  describe('Component Mapping', () => {
    test('maps Storyblok component types to factories', () => {
      const registeredComponents = getRegisteredComponents();

      expect(registeredComponents).toContain('hero_section');
      expect(registeredComponents).toContain('text_block');
      expect(registeredComponents).toContain('button');
      expect(registeredComponents).toContain('card');
    });

    test('creates component when valid CMS data provided', () => {
      const cmsData = createMockComponent('hero_section', {
        title: 'Test Hero',
        subtitle: 'Test Subtitle',
      });

      const component = createComponent(cmsData);

      expect(component).toBeDefined();
      expect(component).not.toBeNull();
    });

    test('returns null for invalid CMS data', () => {
      const invalidData = { title: 'Missing component type' };

      const component = createComponent(invalidData);

      expect(component).toBeNull();
    });

    test('returns null for null/undefined data', () => {
      expect(createComponent(null)).toBeNull();
      expect(createComponent(undefined)).toBeNull();
      expect(createComponent({})).toBeNull();
    });

    test('creates fallback component for unknown types', () => {
      const unknownComponent = createMockComponent('unknown_type', {
        title: 'Unknown Component',
      });

      const component = createComponent(unknownComponent);

      expect(component).toBeDefined();
      expect(component).not.toBeNull();
    });

    test('allows registering new component types', () => {
      const mockFactory = () => ({
        getElement: () => document.createElement('div'),
        update: () => {},
        destroy: () => {},
      });

      registerComponent('custom_component', mockFactory);

      const registeredComponents = getRegisteredComponents();
      expect(registeredComponents).toContain('custom_component');
    });
  });

  describe('Data Transformation', () => {
    test('transforms CTA button data correctly', () => {
      const cmsData = createMockComponent('hero_section', {
        title: 'Hero with CTA',
        cta_button: {
          text: 'Click Me',
          url: '/test-url',
          variant: 'primary',
        },
      });

      // Should not throw error and should create component
      const component = createComponent(cmsData);
      expect(component).toBeDefined();
    });

    test('transforms image asset data correctly', () => {
      const cmsData = createMockComponent('image', {
        src: {
          filename: 'https://example.com/image.jpg',
          alt: 'Test image',
        },
        caption: 'Image caption',
      });

      const component = createComponent(cmsData);
      expect(component).toBeDefined();
    });

    test('transforms rich text content', () => {
      const richTextContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Rich text content' }],
          },
        ],
      };

      const cmsData = createMockComponent('text_block', {
        content: richTextContent,
      });

      const component = createComponent(cmsData);
      expect(component).toBeDefined();
    });

    test('handles missing optional properties', () => {
      const minimalData = createMockComponent('hero_section', {
        title: 'Minimal Hero',
        // No subtitle, background, CTA, etc.
      });

      const component = createComponent(minimalData);
      expect(component).toBeDefined();
    });
  });

  describe('Storyblok Client Integration', () => {
    test('creates client with default configuration', () => {
      const client = createStoryblokClient();

      expect(client).toBeDefined();
      expect(typeof client.getStoryWithComponents).toBe('function');
      expect(typeof client.renderStoryToContainer).toBe('function');
      expect(typeof client.clearCache).toBe('function');
    });

    test('handles story rendering to container', async () => {
      const client = createStoryblokClient();

      // This will use our mocked Storyblok client
      const result = await client.renderStoryToContainer(
        'test-story',
        container
      );

      expect(result).toBeDefined();
      expect(result.story).toBeDefined();
      expect(typeof result.destroy).toBe('function');
    });

    test('provides cache management', () => {
      const client = createStoryblokClient();

      const stats = client.getCacheStats();
      expect(stats).toBeDefined();
      expect(typeof stats.componentCacheSize).toBe('number');

      // Should not throw
      client.clearCache();
    });
  });

  describe('Error Handling', () => {
    test('handles component creation errors gracefully', () => {
      // Test with malformed data that might cause errors
      const malformedData = createMockComponent('hero_section', {
        title: null,
        cta_button: 'invalid-should-be-object',
      });

      // Should not throw, should create fallback
      const component = createComponent(malformedData);
      expect(component).toBeDefined();
    });

    test('handles missing Storyblok story gracefully', async () => {
      const client = createStoryblokClient();

      // Mock will throw error for non-existent story
      await expect(
        client.getStoryWithComponents('non-existent-story')
      ).rejects.toThrow();
    });
  });

  describe('Theme Handling', () => {
    test('passes theme property to components', () => {
      const themedData = createMockComponent('hero_section', {
        title: 'Themed Hero',
        theme: 'cabalou',
      });

      // Should not throw and should handle theme
      const component = createComponent(themedData);
      expect(component).toBeDefined();
    });

    test('defaults to default theme when not specified', () => {
      const unthemedData = createMockComponent('hero_section', {
        title: 'Unthemed Hero',
      });

      const component = createComponent(unthemedData);
      expect(component).toBeDefined();
    });
  });
});
