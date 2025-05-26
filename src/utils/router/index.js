// File: src/utils/router/index.js
/**
 * Client-side router for single-page navigation
 * Handles route matching, navigation, and history management
 */

import { AppError, ErrorTypes } from '../errors/errorBoundary.js';

/**
 * Route class
 */
class Route {
  constructor(path, handler, options = {}) {
    this.path = path;
    this.handler = handler;
    this.options = options;
    this.regex = this.pathToRegex(path);
    this.params = this.extractParams(path);
  }

  /**
   * Convert path pattern to regex
   * @param {string} path - Route path pattern
   * @returns {RegExp} Path regex
   */
  pathToRegex(path) {
    const pattern = path
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '([^/]+)')
      .replace(/\*/g, '(.*)');

    return new RegExp(`^${pattern}$`);
  }

  /**
   * Extract parameter names from path
   * @param {string} path - Route path pattern
   * @returns {Array<string>} Parameter names
   */
  extractParams(path) {
    const matches = path.match(/:(\w+)/g) || [];
    return matches.map(match => match.slice(1));
  }

  /**
   * Test if path matches route
   * @param {string} path - Path to test
   * @returns {Object|null} Match result with params
   */
  match(path) {
    const matches = path.match(this.regex);

    if (!matches) return null;

    const params = {};
    this.params.forEach((param, index) => {
      params[param] = matches[index + 1];
    });

    return { params, matches };
  }
}

/**
 * Router class
 */
export class Router {
  constructor(options = {}) {
    this.routes = [];
    this.middlewares = [];
    this.errorHandler = options.errorHandler || this.defaultErrorHandler;
    this.baseURL = options.baseURL || '';
    this.mode = options.mode || 'history'; // 'history' or 'hash'
    this.currentRoute = null;
    this.beforeHooks = [];
    this.afterHooks = [];
  }

  /**
   * Add route
   * @param {string} path - Route path
   * @param {Function} handler - Route handler
   * @param {Object} options - Route options
   * @returns {Router} Router instance for chaining
   */
  add(path, handler, options = {}) {
    const route = new Route(path, handler, options);
    this.routes.push(route);
    return this;
  }

  /**
   * Add middleware
   * @param {Function} middleware - Middleware function
   * @returns {Router} Router instance for chaining
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Add before navigation hook
   * @param {Function} hook - Hook function
   * @returns {Router} Router instance for chaining
   */
  beforeEach(hook) {
    this.beforeHooks.push(hook);
    return this;
  }

  /**
   * Add after navigation hook
   * @param {Function} hook - Hook function
   * @returns {Router} Router instance for chaining
   */
  afterEach(hook) {
    this.afterHooks.push(hook);
    return this;
  }

  /**
   * Initialize router
   */
  init() {
    // Set up event listeners
    if (this.mode === 'history') {
      window.addEventListener('popstate', () => this.handleRoute());
      document.addEventListener('click', e => this.handleLinkClick(e));
    } else {
      window.addEventListener('hashchange', () => this.handleRoute());
    }

    // Handle initial route
    this.handleRoute();
  }

  /**
   * Handle link clicks for SPA navigation
   * @param {Event} event - Click event
   */
  handleLinkClick(event) {
    const link = event.target.closest('a');

    if (!link || !link.href) return;

    const url = new URL(link.href);
    const isInternal = url.origin === window.location.origin;
    const isTargetBlank = link.target === '_blank';
    const isModified = event.metaKey || event.ctrlKey || event.shiftKey;

    if (isInternal && !isTargetBlank && !isModified) {
      event.preventDefault();
      this.navigate(url.pathname + url.search + url.hash);
    }
  }

  /**
   * Navigate to path
   * @param {string} path - Path to navigate to
   * @param {Object} options - Navigation options
   */
  async navigate(path, options = {}) {
    const { replace = false, state = {} } = options;

    try {
      // Run before hooks
      const canNavigate = await this.runBeforeHooks(
        path,
        this.currentRoute?.path
      );
      if (!canNavigate) return;

      // Update URL
      if (this.mode === 'history') {
        if (replace) {
          window.history.replaceState(state, '', path);
        } else {
          window.history.pushState(state, '', path);
        }
      } else {
        window.location.hash = path;
      }

      // Handle route
      await this.handleRoute();

      // Run after hooks
      await this.runAfterHooks(path, this.currentRoute?.path);
    } catch (error) {
      throw new AppError(
        `Navigation failed: ${error.message}`,
        ErrorTypes.RUNTIME,
        { path, error }
      );
    }
  }

  /**
   * Handle current route
   */
  async handleRoute() {
    const path = this.getCurrentPath();
    const route = this.findRoute(path);

    if (!route) {
      await this.handleNotFound(path);
      return;
    }

    try {
      // Create context
      const context = {
        path,
        params: route.match(path).params,
        query: this.parseQuery(),
        route,
        router: this,
      };

      // Run middlewares
      await this.runMiddlewares(context);

      // Execute route handler
      await route.handler(context);

      // Update current route
      this.currentRoute = { path, route, context };
    } catch (error) {
      await this.errorHandler(error, { path, route });
    }
  }

  /**
   * Get current path based on mode
   * @returns {string} Current path
   */
  getCurrentPath() {
    if (this.mode === 'history') {
      return window.location.pathname + window.location.search;
    } else {
      return window.location.hash.slice(1) || '/';
    }
  }

  /**
   * Find matching route
   * @param {string} path - Path to match
   * @returns {Route|null} Matching route
   */
  findRoute(path) {
    // Remove query string for matching
    const pathWithoutQuery = path.split('?')[0];

    for (const route of this.routes) {
      if (route.match(pathWithoutQuery)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Parse query string
   * @returns {Object} Query parameters
   */
  parseQuery() {
    const query = {};
    const searchParams = new URLSearchParams(window.location.search);

    for (const [key, value] of searchParams) {
      query[key] = value;
    }

    return query;
  }

  /**
   * Run middlewares
   * @param {Object} context - Route context
   */
  async runMiddlewares(context) {
    for (const middleware of this.middlewares) {
      let nextCalled = false;

      await middleware(context, () => {
        nextCalled = true;
      });

      if (!nextCalled) {
        throw new Error('Middleware did not call next()');
      }
    }
  }

  /**
   * Run before navigation hooks
   * @param {string} to - Target path
   * @param {string} from - Current path
   * @returns {boolean} Whether to continue navigation
   */
  async runBeforeHooks(_to, _from) {
    for (const hook of this.beforeHooks) {
      const result = await hook(_to, _from);
      if (result === false) return false;
    }
    return true;
  }

  /**
   * Run after navigation hooks
   * @param {string} to - Target path
   * @param {string} from - Previous path
   */
  async runAfterHooks(_to, _from) {
    for (const hook of this.afterHooks) {
      await hook(_to, _from);
    }
  }

  /**
   * Handle 404 not found
   * @param {string} path - Not found path
   */
  async handleNotFound(path) {
    const notFoundRoute = this.routes.find(
      r => r.path === '*' || r.path === '/404'
    );

    if (notFoundRoute) {
      await notFoundRoute.handler({
        path,
        params: {},
        query: this.parseQuery(),
      });
    } else {
      console.error(`Route not found: ${path}`);
      document.body.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>404 - Page Not Found</h1>
          <p>The page "${path}" could not be found.</p>
          <a href="/">Go Home</a>
        </div>
      `;
    }
  }

  /**
   * Default error handler
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  defaultErrorHandler(error, context) {
    console.error('Router error:', error, context);
  }

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  }

  /**
   * Go forward in history
   */
  forward() {
    window.history.forward();
  }

  /**
   * Go to specific history index
   * @param {number} delta - History delta
   */
  go(delta) {
    window.history.go(delta);
  }

  /**
   * Get all registered routes
   * @returns {Array<Object>} Route information
   */
  getRoutes() {
    return this.routes.map(route => ({
      path: route.path,
      options: route.options,
    }));
  }
}

/**
 * Create router with common routes
 * @param {Object} options - Router options
 * @returns {Router} Configured router
 */
export const createRouter = (options = {}) => {
  const router = new Router(options);

  // Add common middlewares
  router.use(async (context, next) => {
    console.log(`Navigating to: ${context.path}`);
    await next();
  });

  // Add navigation guards
  router.beforeEach((_to, _from) => {
    // Add your navigation guards here
    return true;
  });

  return router;
};

// Export default router instance
export default createRouter();
