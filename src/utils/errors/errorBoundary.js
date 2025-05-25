// File: src/utils/errors/errorBoundary.js
/**
 * Error boundary utility for graceful error handling
 * Provides error catching, logging, and recovery mechanisms
 */

import { isDevelopment, isProduction } from '../environment.js';

/**
 * Error types enumeration
 */
export const ErrorTypes = {
  COMPONENT: 'COMPONENT_ERROR',
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  RUNTIME: 'RUNTIME_ERROR',
  STORYBLOK: 'STORYBLOK_ERROR',
  THEME: 'THEME_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/**
 * Enhanced error class with additional context
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, context = {}) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.severity = context.severity || ErrorSeverity.MEDIUM;
  }
}

/**
 * Global error handler
 */
class ErrorBoundary {
  constructor() {
    this.errors = [];
    this.errorHandlers = new Map();
    this.maxErrors = 100;
    this.errorCallbacks = new Set();
  }

  /**
   * Initialize error boundary
   */
  init() {
    // Global error handler
    window.addEventListener('error', event => {
      this.handleError(
        new AppError(event.message, ErrorTypes.RUNTIME, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        })
      );
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      this.handleError(
        new AppError(
          event.reason?.message || 'Unhandled Promise Rejection',
          ErrorTypes.RUNTIME,
          {
            reason: event.reason,
            promise: event.promise,
          }
        )
      );

      event.preventDefault();
    });

    console.log('🛡️ Error boundary initialized');
  }

  /**
   * Register error handler for specific error type
   * @param {string} type - Error type
   * @param {Function} handler - Handler function
   */
  registerHandler(type, handler) {
    this.errorHandlers.set(type, handler);
  }

  /**
   * Handle error with appropriate strategy
   * @param {Error} error - Error to handle
   */
  handleError(error) {
    // Convert to AppError if needed
    if (!(error instanceof AppError)) {
      error = new AppError(error.message, this.detectErrorType(error), {
        originalError: error,
        stack: error.stack,
      });
    }

    // Store error
    this.storeError(error);

    // Log error
    this.logError(error);

    // Execute type-specific handler
    const handler = this.errorHandlers.get(error.type);
    if (handler) {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error handler failed:', handlerError);
      }
    }

    // Notify callbacks
    this.notifyCallbacks(error);

    // Show user feedback if critical
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.showErrorUI(error);
    }

    // Send to error tracking service in production
    if (isProduction()) {
      this.reportError(error);
    }
  }

  /**
   * Detect error type from error object
   * @param {Error} error - Error object
   * @returns {string} Error type
   */
  detectErrorType(error) {
    if (error.name === 'ValidationError') return ErrorTypes.VALIDATION;
    if (error.message?.includes('fetch')) return ErrorTypes.NETWORK;
    if (error.message?.includes('Storyblok')) return ErrorTypes.STORYBLOK;
    if (error.message?.includes('theme')) return ErrorTypes.THEME;
    if (error.message?.includes('component')) return ErrorTypes.COMPONENT;
    return ErrorTypes.UNKNOWN;
  }

  /**
   * Store error with limit
   * @param {AppError} error - Error to store
   */
  storeError(error) {
    this.errors.push(error);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }
  }

  /**
   * Log error with appropriate level
   * @param {AppError} error - Error to log
   */
  logError(error) {
    const logMethod =
      error.severity === ErrorSeverity.CRITICAL
        ? 'error'
        : error.severity === ErrorSeverity.HIGH
          ? 'error'
          : 'warn';

    console.group(`🚨 ${error.type}`);
    console[logMethod](error.message);

    if (error.context && Object.keys(error.context).length > 0) {
      console.log('Context:', error.context);
    }

    if (error.stack) {
      console.log('Stack trace:', error.stack);
    }

    console.groupEnd();
  }

  /**
   * Show error UI for critical errors
   * @param {AppError} error - Error to display
   */
  showErrorUI(error) {
    // Remove existing error UI
    const existing = document.querySelector('.error-boundary-ui');
    if (existing) existing.remove();

    const errorUI = document.createElement('div');
    errorUI.className = 'error-boundary-ui';
    errorUI.innerHTML = `
      <div class="error-boundary-ui__content">
        <h2>Something went wrong</h2>
        <p>${this.getSafeErrorMessage(error)}</p>
        <div class="error-boundary-ui__actions">
          <button onclick="location.reload()">Reload Page</button>
          ${
            isDevelopment()
              ? `
            <button onclick="this.parentElement.parentElement.parentElement.remove()">
              Dismiss
            </button>
          `
              : ''
          }
        </div>
        ${
          isDevelopment()
            ? `
          <details class="error-boundary-ui__details">
            <summary>Error Details</summary>
            <pre>${error.stack || error.message}</pre>
          </details>
        `
            : ''
        }
      </div>
    `;

    // Add styles
    this.addErrorUIStyles();

    document.body.appendChild(errorUI);
  }

  /**
   * Get safe error message for users
   * @param {AppError} error - Error object
   * @returns {string} User-friendly message
   */
  getSafeErrorMessage(error) {
    const messages = {
      [ErrorTypes.NETWORK]:
        'Unable to connect to the server. Please check your connection.',
      [ErrorTypes.STORYBLOK]: 'Unable to load content. Please try again later.',
      [ErrorTypes.COMPONENT]: 'A component failed to load properly.',
      [ErrorTypes.VALIDATION]: 'Invalid data received from the server.',
      [ErrorTypes.THEME]: 'Theme loading failed. Using default theme.',
      [ErrorTypes.RUNTIME]: 'An unexpected error occurred.',
      [ErrorTypes.UNKNOWN]: 'Something went wrong. Please try again.',
    };

    return messages[error.type] || messages[ErrorTypes.UNKNOWN];
  }

  /**
   * Add error UI styles
   */
  addErrorUIStyles() {
    if (document.querySelector('#error-boundary-styles')) return;

    const style = document.createElement('style');
    style.id = 'error-boundary-styles';
    style.textContent = `
      .error-boundary-ui {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        backdrop-filter: blur(4px);
      }

      .error-boundary-ui__content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }

      .error-boundary-ui__content h2 {
        color: #dc3545;
        margin: 0 0 1rem 0;
      }

      .error-boundary-ui__content p {
        color: #333;
        margin: 0 0 1.5rem 0;
      }

      .error-boundary-ui__actions {
        display: flex;
        gap: 1rem;
      }

      .error-boundary-ui__actions button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      .error-boundary-ui__actions button:first-child {
        background: #007bff;
        color: white;
      }

      .error-boundary-ui__actions button:first-child:hover {
        background: #0056b3;
      }

      .error-boundary-ui__actions button:last-child {
        background: #6c757d;
        color: white;
      }

      .error-boundary-ui__details {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #dee2e6;
      }

      .error-boundary-ui__details summary {
        cursor: pointer;
        color: #6c757d;
        font-size: 14px;
      }

      .error-boundary-ui__details pre {
        margin: 1rem 0 0 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
        overflow: auto;
        font-size: 12px;
        max-height: 200px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Report error to tracking service
   * @param {AppError} error - Error to report
   */
  reportError(error) {
    // In production, send to error tracking service
    if (window.errorTracker) {
      window.errorTracker.report({
        message: error.message,
        type: error.type,
        severity: error.severity,
        context: error.context,
        stack: error.stack,
        timestamp: error.timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    }
  }

  /**
   * Subscribe to error events
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.errorCallbacks.add(callback);
    return () => this.errorCallbacks.delete(callback);
  }

  /**
   * Notify error callbacks
   * @param {AppError} error - Error that occurred
   */
  notifyCallbacks(error) {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (e) {
        console.error('Error callback failed:', e);
      }
    });
  }

  /**
   * Get error statistics
   * @returns {Object} Error stats
   */
  getStats() {
    const stats = {
      total: this.errors.length,
      byType: {},
      bySeverity: {},
      recent: this.errors.slice(-10),
    };

    this.errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] =
        (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Wrap function with error boundary
   * @param {Function} fn - Function to wrap
   * @param {string} type - Error type
   * @returns {Function} Wrapped function
   */
  wrap(fn, type = ErrorTypes.RUNTIME) {
    return (...args) => {
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.catch(error => {
            this.handleError(
              new AppError(error.message, type, { originalError: error })
            );
            throw error;
          });
        }
        return result;
      } catch (error) {
        this.handleError(
          new AppError(error.message, type, { originalError: error })
        );
        throw error;
      }
    };
  }
}

// Create singleton instance
const errorBoundary = new ErrorBoundary();

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  errorBoundary.init();
}

// Export instance and utilities
export default errorBoundary;

export const { handleError, registerHandler, subscribe, getStats, wrap } =
  errorBoundary;
