// File: src/utils/debug/debugPanel.js
/**
 * Debug panel for development
 * Provides real-time insights into app state, performance, and components
 */

import { isDevelopment } from '../environment.js';
import webVitalsMonitor from '../performance/webVitals.js';
import { imageService } from '../images/storyblokImages.js';

/**
 * Debug panel class
 */
export class DebugPanel {
  constructor() {
    this.isOpen = false;
    this.tabs = new Map();
    this.activeTab = 'overview';
    this.updateInterval = null;
  }

  /**
   * Initialize debug panel
   * @param {Object} app - App instance
   */
  init(app) {
    if (!isDevelopment()) {
      console.log('Debug panel disabled in production');
      return;
    }

    this.app = app;
    this.createPanel();
    this.setupTabs();
    this.bindEvents();
    this.startUpdates();

    console.log('🐛 Debug panel initialized. Press Ctrl+Shift+D to toggle.');
  }

  /**
   * Create panel DOM structure
   */
  createPanel() {
    this.panel = document.createElement('div');
    this.panel.className = 'debug-panel';
    this.panel.innerHTML = `
      <div class="debug-panel__header">
        <h3 class="debug-panel__title">🐛 Debug Panel</h3>
        <button class="debug-panel__close" aria-label="Close">×</button>
      </div>
      <nav class="debug-panel__tabs">
        <button class="debug-panel__tab active" data-tab="overview">Overview</button>
        <button class="debug-panel__tab" data-tab="performance">Performance</button>
        <button class="debug-panel__tab" data-tab="components">Components</button>
        <button class="debug-panel__tab" data-tab="network">Network</button>
        <button class="debug-panel__tab" data-tab="storage">Storage</button>
      </nav>
      <div class="debug-panel__content"></div>
    `;

    // Add styles
    this.addStyles();

    // Add to body
    document.body.appendChild(this.panel);
  }

  /**
   * Add panel styles
   */
  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .debug-panel {
        position: fixed;
        right: -400px;
        top: 0;
        width: 400px;
        height: 100vh;
        background: #1a1a1a;
        color: #fff;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
        box-shadow: -2px 0 10px rgba(0,0,0,0.5);
        transition: right 0.3s ease;
        z-index: 99999;
        display: flex;
        flex-direction: column;
      }

      .debug-panel.open {
        right: 0;
      }

      .debug-panel__header {
        padding: 1rem;
        border-bottom: 1px solid #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .debug-panel__title {
        margin: 0;
        font-size: 16px;
      }

      .debug-panel__close {
        background: none;
        border: none;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
      }

      .debug-panel__tabs {
        display: flex;
        border-bottom: 1px solid #333;
        overflow-x: auto;
      }

      .debug-panel__tab {
        background: none;
        border: none;
        color: #888;
        padding: 0.5rem 1rem;
        cursor: pointer;
        white-space: nowrap;
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
      }

      .debug-panel__tab:hover {
        color: #fff;
      }

      .debug-panel__tab.active {
        color: #fff;
        border-bottom-color: #007bff;
      }

      .debug-panel__content {
        flex: 1;
        overflow-y: auto;
        padding: 1rem;
      }

      .debug-section {
        margin-bottom: 1.5rem;
      }

      .debug-section__title {
        color: #007bff;
        margin: 0 0 0.5rem 0;
        font-size: 14px;
      }

      .debug-metric {
        display: flex;
        justify-content: space-between;
        padding: 0.25rem 0;
      }

      .debug-metric__label {
        color: #888;
      }

      .debug-metric__value {
        color: #fff;
        font-weight: bold;
      }

      .debug-metric__value.good {
        color: #4ade80;
      }

      .debug-metric__value.warning {
        color: #fbbf24;
      }

      .debug-metric__value.error {
        color: #ef4444;
      }

      .debug-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .debug-list__item {
        padding: 0.5rem;
        border: 1px solid #333;
        margin-bottom: 0.5rem;
        border-radius: 4px;
        background: #2a2a2a;
      }

      .debug-code {
        background: #2a2a2a;
        padding: 0.5rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 11px;
      }

      .debug-button {
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-right: 0.5rem;
      }

      .debug-button:hover {
        background: #0056b3;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Setup tab content generators
   */
  setupTabs() {
    this.tabs.set('overview', () => this.renderOverview());
    this.tabs.set('performance', () => this.renderPerformance());
    this.tabs.set('components', () => this.renderComponents());
    this.tabs.set('network', () => this.renderNetwork());
    this.tabs.set('storage', () => this.renderStorage());
  }

  /**
   * Bind panel events
   */
  bindEvents() {
    // Close button
    this.panel
      .querySelector('.debug-panel__close')
      .addEventListener('click', () => {
        this.toggle();
      });

    // Tab switching
    this.panel.querySelectorAll('.debug-panel__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });

    // Keyboard shortcut
    document.addEventListener('keydown', e => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  /**
   * Toggle panel visibility
   */
  toggle() {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('open', this.isOpen);
  }

  /**
   * Switch active tab
   * @param {string} tabName - Tab to activate
   */
  switchTab(tabName) {
    this.activeTab = tabName;

    // Update tab buttons
    this.panel.querySelectorAll('.debug-panel__tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update content
    this.updateContent();
  }

  /**
   * Update panel content
   */
  updateContent() {
    const content = this.panel.querySelector('.debug-panel__content');
    const renderer = this.tabs.get(this.activeTab);

    if (renderer) {
      content.innerHTML = renderer();
    }
  }

  /**
   * Start periodic updates
   */
  startUpdates() {
    this.updateContent();
    this.updateInterval = setInterval(() => {
      if (this.isOpen) {
        this.updateContent();
      }
    }, 1000);
  }

  /**
   * Render overview tab
   */
  renderOverview() {
    const status = this.app?.getStatus() || {};
    const memory = performance.memory || {};

    return `
      <div class="debug-section">
        <h4 class="debug-section__title">App Status</h4>
        <div class="debug-metric">
          <span class="debug-metric__label">Ready:</span>
          <span class="debug-metric__value ${status.ready ? 'good' : 'error'}">
            ${status.ready ? 'Yes' : 'No'}
          </span>
        </div>
        <div class="debug-metric">
          <span class="debug-metric__label">Current Route:</span>
          <span class="debug-metric__value">${status.currentRoute || '/'}</span>
        </div>
        <div class="debug-metric">
          <span class="debug-metric__label">Theme:</span>
          <span class="debug-metric__value">${status.currentTheme || 'default'}</span>
        </div>
      </div>

      <div class="debug-section">
        <h4 class="debug-section__title">Memory Usage</h4>
        <div class="debug-metric">
          <span class="debug-metric__label">Used:</span>
          <span class="debug-metric__value">
            ${this.formatBytes(memory.usedJSHeapSize || 0)}
          </span>
        </div>
        <div class="debug-metric">
          <span class="debug-metric__label">Total:</span>
          <span class="debug-metric__value">
            ${this.formatBytes(memory.totalJSHeapSize || 0)}
          </span>
        </div>
        <div class="debug-metric">
          <span class="debug-metric__label">Limit:</span>
          <span class="debug-metric__value">
            ${this.formatBytes(memory.jsHeapSizeLimit || 0)}
          </span>
        </div>
      </div>

      <div class="debug-section">
        <h4 class="debug-section__title">Cache Status</h4>
        <div class="debug-metric">
          <span class="debug-metric__label">Component Cache:</span>
          <span class="debug-metric__value">
            ${status.cacheStats?.componentCacheSize || 0} items
          </span>
        </div>
        <div class="debug-metric">
          <span class="debug-metric__label">Image Cache:</span>
          <span class="debug-metric__value">${imageService.cache.size} items</span>
        </div>
      </div>

      <div class="debug-section">
        <h4 class="debug-section__title">Actions</h4>
        <button class="debug-button" onclick="window.app?.clearCache?.()">
          Clear Cache
        </button>
        <button class="debug-button" onclick="location.reload()">
          Reload Page
        </button>
      </div>
    `;
  }

  /**
   * Render performance tab
   */
  renderPerformance() {
    const summary = webVitalsMonitor.getSummary();

    return `
      <div class="debug-section">
        <h4 class="debug-section__title">Web Vitals Score: ${summary.score}/100</h4>
        ${Object.entries(summary.metrics)
          .map(
            ([name, data]) => `
          <div class="debug-metric">
            <span class="debug-metric__label">${name}:</span>
            <span class="debug-metric__value ${data.rating}">
              ${this.formatMetric(name, data.value)} (${data.rating})
            </span>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="debug-section">
        <h4 class="debug-section__title">Page Load Timeline</h4>
        ${this.renderLoadTimeline()}
      </div>

      <div class="debug-section">
        <h4 class="debug-section__title">Resource Timing</h4>
        ${this.renderResourceTiming()}
      </div>
    `;
  }

  /**
   * Render components tab
   */
  renderComponents() {
    const components = this.getRenderedComponents();

    return `
      <div class="debug-section">
        <h4 class="debug-section__title">Rendered Components (${components.length})</h4>
        <ul class="debug-list">
          ${components
            .map(
              comp => `
            <li class="debug-list__item">
              <strong>${comp.type}</strong>
              ${
                comp.props
                  ? `
                <div class="debug-code">
                  ${JSON.stringify(comp.props, null, 2)}
                </div>
              `
                  : ''
              }
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Render network tab
   */
  renderNetwork() {
    const requests = this.getNetworkRequests();

    return `
      <div class="debug-section">
        <h4 class="debug-section__title">Storyblok API Calls</h4>
        <ul class="debug-list">
          ${requests
            .map(
              req => `
            <li class="debug-list__item">
              <strong>${req.method} ${req.url}</strong>
              <div class="debug-metric">
                <span class="debug-metric__label">Status:</span>
                <span class="debug-metric__value ${req.status < 400 ? 'good' : 'error'}">
                  ${req.status}
                </span>
              </div>
              <div class="debug-metric">
                <span class="debug-metric__label">Duration:</span>
                <span class="debug-metric__value">${req.duration}ms</span>
              </div>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Render storage tab
   */
  renderStorage() {
    const storage = this.getStorageInfo();

    return `
      <div class="debug-section">
        <h4 class="debug-section__title">Local Storage</h4>
        ${Object.entries(storage.localStorage)
          .map(
            ([key, value]) => `
          <div class="debug-metric">
            <span class="debug-metric__label">${key}:</span>
            <span class="debug-metric__value">${value}</span>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="debug-section">
        <h4 class="debug-section__title">Session Storage</h4>
        ${Object.entries(storage.sessionStorage)
          .map(
            ([key, value]) => `
          <div class="debug-metric">
            <span class="debug-metric__label">${key}:</span>
            <span class="debug-metric__value">${value}</span>
          </div>
        `
          )
          .join('')}
      </div>

      <div class="debug-section">
        <h4 class="debug-section__title">Storage Usage</h4>
        <div class="debug-metric">
          <span class="debug-metric__label">Estimated:</span>
          <span class="debug-metric__value">${this.formatBytes(storage.usage)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Get rendered components info
   */
  getRenderedComponents() {
    const components = [];

    document.querySelectorAll('[data-component-type]').forEach(el => {
      components.push({
        type: el.dataset.componentType,
        props: el.dataset.componentProps
          ? JSON.parse(el.dataset.componentProps)
          : null,
      });
    });

    return components;
  }

  /**
   * Get network requests
   */
  getNetworkRequests() {
    const entries = performance.getEntriesByType('resource');
    return entries
      .filter(entry => entry.name.includes('storyblok'))
      .map(entry => ({
        url: entry.name,
        method: 'GET',
        status: 200, // Can't get actual status from Resource Timing API
        duration: Math.round(entry.duration),
      }));
  }

  /**
   * Get storage information
   */
  getStorageInfo() {
    const info = {
      localStorage: {},
      sessionStorage: {},
      usage: 0,
    };

    // Local storage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      info.localStorage[key] = localStorage.getItem(key);
    }

    // Session storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      info.sessionStorage[key] = sessionStorage.getItem(key);
    }

    // Estimate usage
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(estimate => {
        info.usage = estimate.usage || 0;
      });
    }

    return info;
  }

  /**
   * Render load timeline
   */
  renderLoadTimeline() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return '<p>No navigation data available</p>';

    const events = [
      {
        name: 'DNS',
        start: navigation.domainLookupStart,
        end: navigation.domainLookupEnd,
      },
      {
        name: 'TCP',
        start: navigation.connectStart,
        end: navigation.connectEnd,
      },
      {
        name: 'Request',
        start: navigation.requestStart,
        end: navigation.responseStart,
      },
      {
        name: 'Response',
        start: navigation.responseStart,
        end: navigation.responseEnd,
      },
      {
        name: 'DOM',
        start: navigation.domLoading,
        end: navigation.domComplete,
      },
      {
        name: 'Load',
        start: navigation.loadEventStart,
        end: navigation.loadEventEnd,
      },
    ];

    return events
      .map(
        event => `
      <div class="debug-metric">
        <span class="debug-metric__label">${event.name}:</span>
        <span class="debug-metric__value">
          ${Math.round(event.end - event.start)}ms
        </span>
      </div>
    `
      )
      .join('');
  }

  /**
   * Render resource timing
   */
  renderResourceTiming() {
    const resources = performance
      .getEntriesByType('resource')
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return resources
      .map(resource => {
        const name = resource.name.split('/').pop().substring(0, 30);
        return `
        <div class="debug-metric">
          <span class="debug-metric__label">${name}:</span>
          <span class="debug-metric__value">
            ${Math.round(resource.duration)}ms
          </span>
        </div>
      `;
      })
      .join('');
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Format metric value
   */
  formatMetric(name, value) {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      case 'LCP':
      case 'FID':
      case 'FCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value;
    }
  }

  /**
   * Destroy debug panel
   */
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.panel?.remove();
  }
}

// Create singleton instance
const debugPanel = new DebugPanel();

// Export instance
export default debugPanel;
