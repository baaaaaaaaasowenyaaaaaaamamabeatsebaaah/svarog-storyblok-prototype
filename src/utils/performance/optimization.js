// src/utils/performance/optimization.js
/**
 * Performance optimization utilities
 * Provides tools for lazy loading, code splitting, and caching
 */

/**
 * Lazy load components on demand
 */
export const lazyLoadComponent = componentName => {
  return () =>
    import(
      /* webpackChunkName: "[request]" */
      /* webpackMode: "lazy" */
      `../components/${componentName}`
    );
};

/**
 * Preload critical components
 */
export const preloadCriticalComponents = () => {
  const criticalComponents = ['Hero', 'Header', 'Navigation'];

  criticalComponents.forEach(component => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = `/js/${component.toLowerCase()}.chunk.js`;
    document.head.appendChild(link);
  });
};

/**
 * Resource hints for better performance
 */
export const addResourceHints = () => {
  // Preconnect to external domains
  const preconnectDomains = [
    'https://api.storyblok.com',
    'https://a.storyblok.com',
    'https://fonts.googleapis.com',
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // DNS prefetch for additional domains
  const dnsPrefetchDomains = [
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

/**
 * Implement progressive enhancement
 */
export const progressiveEnhancement = () => {
  // Check for modern browser features
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const supportsWebP = detectWebPSupport();

  // Add feature classes to body
  if (supportsIntersectionObserver) {
    document.body.classList.add('has-intersection-observer');
  }

  if (supportsWebP) {
    document.body.classList.add('has-webp');
  }

  // Enable service worker for offline support
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('Service worker registration failed');
    });
  }
};

/**
 * Detect WebP support
 */
function detectWebPSupport() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, 1, 1);
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
}

/**
 * Optimize images loading
 */
export const optimizeImages = () => {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
};
