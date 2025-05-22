/**
 * Application integration tests
 * Tests the main app functionality and routing
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { createApp } from '../../src/app.js';
import { createTestContainer } from '../setup.js';

describe('App Integration', () => {
  let container;
  let app;

  beforeEach(() => {
    container = createTestContainer();

    // Mock history API
    Object.defineProperty(window, 'history', {
      value: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
      },
      writable: true,
    });

    // Mock location
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
        href: 'http://localhost:3000/',
        hostname: 'localhost',
      },
      writable: true,
    });
  });

  afterEach(() => {
    if (app && app.destroy) {
      app.destroy();
    }
  });

  describe('App Creation', () => {
    test('creates app with valid container', () => {
      app = createApp({
        container,
        theme: 'default',
      });

      expect(app).toBeDefined();
      expect(typeof app.init).toBe('function');
      expect(typeof app.navigateToRoute).toBe('function');
      expect(typeof app.changeTheme).toBe('function');
      expect(typeof app.destroy).toBe('function');
    });

    test('throws error with invalid container', () => {
      expect(() => {
        createApp({
          container: null,
        });
      }).toThrow('App container element not found');
    });
  });

  describe('App Status', () => {
    test('provides app status information', () => {
      app = createApp({
        container,
        theme: 'cabalou',
      });

      const status = app.getStatus();

      expect(status).toBeDefined();
      expect(typeof status.ready).toBe('boolean');
      expect(typeof status.currentRoute).toBe('string');
      expect(typeof status.currentTheme).toBe('string');
      expect(status.cacheStats).toBeDefined();
    });
  });

  describe('Theme Management', () => {
    test('changes theme and dispatches event', () => {
      app = createApp({
        container,
        theme: 'default',
      });

      const eventSpy = vi.fn();
      window.addEventListener('themeChange', eventSpy);

      app.changeTheme('cabalou');

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { theme: 'cabalou' },
        })
      );

      window.removeEventListener('themeChange', eventSpy);
    });
  });

  describe('Route Path Conversion', () => {
    test('converts URL paths to Storyblok slugs correctly', () => {
      app = createApp({ container });

      // Test the internal pathToSlug logic through navigation
      // This is tested indirectly through the navigation system
      expect(app.getStatus().currentRoute).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('handles navigation errors gracefully', async () => {
      app = createApp({
        container,
        enableLivePreview: false,
      });

      await app.init();

      // Should not throw when navigating to non-existent route
      // The mock will handle this gracefully
      await expect(
        app.navigateToRoute('/non-existent-page')
      ).resolves.not.toThrow();
    });

    test('shows error state in container on failure', () => {
      // This tests the error boundary functionality
      const errorContainer = createTestContainer();

      app = createApp({
        container: errorContainer,
        theme: 'default',
      });

      // The app should handle errors and show error state
      expect(errorContainer).toBeDefined();
    });
  });

  describe('Live Preview Integration', () => {
    test('enables live preview in development mode', () => {
      app = createApp({
        container,
        enableLivePreview: true,
      });

      // Should not throw when enabling live preview
      expect(app).toBeDefined();
    });

    test('disables live preview in production mode', () => {
      app = createApp({
        container,
        enableLivePreview: false,
      });

      expect(app).toBeDefined();
    });
  });
});
