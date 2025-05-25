// File: src/utils/performance/webVitals.js
/**
 * Web Vitals monitoring for performance tracking
 * Measures Core Web Vitals: LCP, FID, CLS, FCP, TTFB
 */

import { getPerformanceConfig } from '../../config/environment.js';
import { isDevelopment } from '../environment.js';

/**
 * @typedef {Object} Metric
 * @property {string} name - Metric name
 * @property {number} value - Metric value
 * @property {string} rating - Performance rating (good, needs-improvement, poor)
 * @property {number} delta - Change since last measurement
 * @property {string} id - Unique metric ID
 */

/**
 * Performance observer for Core Web Vitals
 */
class WebVitalsMonitor {
  constructor() {
    this.metrics = new Map();
    this.callbacks = new Set();
    this.config = getPerformanceConfig();
    this.isSupported = this.checkSupport();
  }

  /**
   * Check browser support for performance APIs
   * @returns {boolean} True if supported
   */
  checkSupport() {
    return (
      typeof window !== 'undefined' &&
      'PerformanceObserver' in window &&
      'PerformanceLongTaskTiming' in window
    );
  }

  /**
   * Initialize monitoring
   */
  init() {
    if (!this.isSupported) {
      console.warn('Web Vitals monitoring not supported in this browser');
      return;
    }

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();
    this.observeLongTasks();

    if (isDevelopment()) {
      this.logMetrics();
    }
  }

  /**
   * Observe Largest Contentful Paint (LCP)
   */
  observeLCP() {
    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        const metric = {
          name: 'LCP',
          value: lastEntry.startTime,
          rating: this.getRating('LCP', lastEntry.startTime),
          delta: 0,
          id: this.generateId(),
          entries: [lastEntry],
        };

        this.recordMetric(metric);
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP observation failed:', e);
    }
  }

  /**
   * Observe First Input Delay (FID)
   */
  observeFID() {
    try {
      const observer = new PerformanceObserver(list => {
        const firstEntry = list.getEntries()[0];

        const metric = {
          name: 'FID',
          value: firstEntry.processingStart - firstEntry.startTime,
          rating: this.getRating(
            'FID',
            firstEntry.processingStart - firstEntry.startTime
          ),
          delta: 0,
          id: this.generateId(),
          entries: [firstEntry],
        };

        this.recordMetric(metric);
        observer.disconnect();
      });

      observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID observation failed:', e);
    }
  }

  /**
   * Observe Cumulative Layout Shift (CLS)
   */
  observeCLS() {
    let clsValue = 0;
    let clsEntries = [];
    let sessionValue = 0;
    let sessionEntries = [];

    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

            // Start a new session if the gap is > 1s or duration > 5s
            if (
              (sessionValue &&
                entry.startTime - lastSessionEntry.startTime > 1000) ||
              entry.startTime - firstSessionEntry.startTime > 5000
            ) {
              // Finalize previous session
              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                clsEntries = [...sessionEntries];
              }
              sessionValue = entry.value;
              sessionEntries = [entry];
            } else {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            }
          }
        }

        // Update CLS
        if (sessionValue > clsValue) {
          clsValue = sessionValue;
          clsEntries = [...sessionEntries];

          const metric = {
            name: 'CLS',
            value: clsValue,
            rating: this.getRating('CLS', clsValue),
            delta: 0,
            id: this.generateId(),
            entries: clsEntries,
          };

          this.recordMetric(metric);
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS observation failed:', e);
    }
  }

  /**
   * Observe First Contentful Paint (FCP)
   */
  observeFCP() {
    try {
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(
          entry => entry.name === 'first-contentful-paint'
        );

        if (fcpEntry) {
          const metric = {
            name: 'FCP',
            value: fcpEntry.startTime,
            rating: this.getRating('FCP', fcpEntry.startTime),
            delta: 0,
            id: this.generateId(),
            entries: [fcpEntry],
          };

          this.recordMetric(metric);
          observer.disconnect();
        }
      });

      observer.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('FCP observation failed:', e);
    }
  }

  /**
   * Observe Time to First Byte (TTFB)
   */
  observeTTFB() {
    try {
      const navigationEntry = performance.getEntriesByType('navigation')[0];

      if (navigationEntry) {
        const ttfb =
          navigationEntry.responseStart - navigationEntry.requestStart;

        const metric = {
          name: 'TTFB',
          value: ttfb,
          rating: this.getRating('TTFB', ttfb),
          delta: 0,
          id: this.generateId(),
          entries: [navigationEntry],
        };

        this.recordMetric(metric);
      }
    } catch (e) {
      console.warn('TTFB observation failed:', e);
    }
  }

  /**
   * Observe long tasks that block the main thread
   */
  observeLongTasks() {
    try {
      const observer = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (isDevelopment()) {
            console.warn(
              `⚠️ Long task detected: ${entry.duration.toFixed(0)}ms`
            );
          }

          // Track long tasks for debugging
          this.recordMetric({
            name: 'LongTask',
            value: entry.duration,
            rating: entry.duration > 100 ? 'poor' : 'needs-improvement',
            delta: 0,
            id: this.generateId(),
            entries: [entry],
          });
        }
      });

      observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.warn('Long task observation failed:', e);
    }
  }

  /**
   * Get performance rating based on thresholds
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   * @returns {string} Rating
   */
  getRating(metricName, value) {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value >= threshold.poor) return 'poor';
    return 'needs-improvement';
  }

  /**
   * Record a metric
   * @param {Metric} metric - Metric to record
   */
  recordMetric(metric) {
    const previousValue = this.metrics.get(metric.name)?.value || 0;
    metric.delta = metric.value - previousValue;

    this.metrics.set(metric.name, metric);
    this.notifyCallbacks(metric);

    // Send to analytics if configured
    if (this.config.enableAnalytics && window.analytics) {
      window.analytics.track('Web Vital', {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      });
    }
  }

  /**
   * Subscribe to metric updates
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Notify all callbacks
   * @param {Metric} metric - Updated metric
   */
  notifyCallbacks(metric) {
    this.callbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (e) {
        console.error('Callback error:', e);
      }
    });
  }

  /**
   * Get all recorded metrics
   * @returns {Object} All metrics
   */
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Get summary of metrics
   * @returns {Object} Metrics summary
   */
  getSummary() {
    const metrics = this.getMetrics();
    const summary = {
      score: 100,
      metrics: {},
      rating: 'good',
    };

    // Calculate overall score
    let totalWeight = 0;
    let weightedSum = 0;

    const weights = {
      LCP: 25,
      FID: 25,
      CLS: 25,
      FCP: 15,
      TTFB: 10,
    };

    Object.entries(metrics).forEach(([name, metric]) => {
      if (weights[name]) {
        const weight = weights[name];
        const score = this.calculateScore(name, metric.value);

        weightedSum += score * weight;
        totalWeight += weight;

        summary.metrics[name] = {
          value: metric.value,
          score,
          rating: metric.rating,
        };
      }
    });

    summary.score = Math.round(weightedSum / totalWeight);
    summary.rating =
      summary.score >= 90
        ? 'good'
        : summary.score >= 50
          ? 'needs-improvement'
          : 'poor';

    return summary;
  }

  /**
   * Calculate score for a metric (0-100)
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value
   * @returns {number} Score
   */
  calculateScore(metricName, value) {
    const curves = {
      LCP: { good: 1200, poor: 2400 },
      FID: { good: 50, poor: 150 },
      CLS: { good: 0.05, poor: 0.15 },
      FCP: { good: 900, poor: 1800 },
      TTFB: { good: 400, poor: 900 },
    };

    const curve = curves[metricName];
    if (!curve) return 0;

    if (value <= curve.good) return 100;
    if (value >= curve.poor) return 0;

    // Linear interpolation
    const ratio = (value - curve.good) / (curve.poor - curve.good);
    return Math.round(100 * (1 - ratio));
  }

  /**
   * Log metrics to console
   */
  logMetrics() {
    // Debounce logging
    clearTimeout(this.logTimeout);
    this.logTimeout = setTimeout(() => {
      const summary = this.getSummary();

      console.group('📊 Web Vitals Summary');
      console.log(`Overall Score: ${summary.score}/100 (${summary.rating})`);

      Object.entries(summary.metrics).forEach(([name, data]) => {
        const emoji =
          data.rating === 'good'
            ? '✅'
            : data.rating === 'needs-improvement'
              ? '⚠️'
              : '❌';
        console.log(
          `${emoji} ${name}: ${data.value.toFixed(2)} (${data.rating})`
        );
      });

      console.groupEnd();
    }, 1000);
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create singleton instance
const webVitalsMonitor = new WebVitalsMonitor();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () =>
      webVitalsMonitor.init()
    );
  } else {
    webVitalsMonitor.init();
  }
}

// Export monitor instance and utilities
export default webVitalsMonitor;

export const { init, subscribe, getMetrics, getSummary } = webVitalsMonitor;

/**
 * React to poor performance metrics
 * @param {Metric} metric - Performance metric
 */
export const handlePoorPerformance = metric => {
  if (metric.rating === 'poor') {
    console.warn(`Poor ${metric.name} detected: ${metric.value}`);

    // Implement performance optimizations
    switch (metric.name) {
      case 'CLS':
        {
          // Add dimensions to images/videos
          document
            .querySelectorAll('img:not([width]), video:not([width])')
            .forEach(el => {
              if (el.naturalWidth) {
                el.setAttribute('width', el.naturalWidth);
                el.setAttribute('height', el.naturalHeight);
              }
            });
        }
        break;

      case 'LCP':
        {
          // Preload critical resources
          const lcpElement = metric.entries?.[0]?.element;
          if (lcpElement?.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as =
              lcpElement.tagName.toLowerCase() === 'img' ? 'image' : 'fetch';
            link.href = lcpElement.src;
            document.head.appendChild(link);
          }
        }
        break;
    }
  }
};

// Auto-handle poor performance
webVitalsMonitor.subscribe(handlePoorPerformance);
