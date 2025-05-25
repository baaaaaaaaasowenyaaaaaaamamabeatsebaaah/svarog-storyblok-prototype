// File: src/utils/images/storyblokImages.js
/**
 * Storyblok image optimization utilities
 * Provides responsive image generation and optimization
 */

/**
 * Default breakpoints for responsive images
 */
const DEFAULT_BREAKPOINTS = [320, 640, 768, 1024, 1280, 1536, 1920];

/**
 * Default quality settings
 */
const DEFAULT_QUALITY = 80;

/**
 * Storyblok image service class
 */
export class StoryblokImageService {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Transform Storyblok image URL with parameters
   * @param {string} imageUrl - Original image URL
   * @param {Object} options - Transformation options
   * @returns {string} Transformed image URL
   */
  transform(imageUrl, options = {}) {
    if (!imageUrl || !this.isStoryblokUrl(imageUrl)) {
      return imageUrl;
    }

    const cacheKey = `${imageUrl}${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const url = new URL(imageUrl);
    const transforms = [];

    // Width
    if (options.width) {
      transforms.push(`${options.width}x0`);
    }

    // Height
    if (options.height && !options.width) {
      transforms.push(`0x${options.height}`);
    }

    // Both width and height
    if (options.width && options.height) {
      transforms[0] = `${options.width}x${options.height}`;
    }

    // Filters
    const filters = [];

    // Quality
    if (options.quality !== undefined) {
      filters.push(`quality(${options.quality})`);
    }

    // Format
    if (options.format) {
      filters.push(`format(${options.format})`);
    }

    // Blur
    if (options.blur) {
      filters.push(`blur(${options.blur})`);
    }

    // Grayscale
    if (options.grayscale) {
      filters.push('grayscale()');
    }

    // Build transform string
    if (transforms.length > 0 || filters.length > 0) {
      const transformStr = transforms.join('/');
      const filterStr = filters.length > 0 ? `:${filters.join(':')}` : '';

      // Insert transform into URL
      const pathParts = url.pathname.split('/');
      pathParts.splice(3, 0, 'm', `${transformStr}${filterStr}`);
      url.pathname = pathParts.join('/');
    }

    const transformedUrl = url.toString();
    this.cache.set(cacheKey, transformedUrl);

    return transformedUrl;
  }

  /**
   * Check if URL is from Storyblok
   * @param {string} url - URL to check
   * @returns {boolean} True if Storyblok URL
   */
  isStoryblokUrl(url) {
    return url && url.includes('storyblok.com');
  }

  /**
   * Generate srcset for responsive images
   * @param {string} imageUrl - Original image URL
   * @param {Array<number>} breakpoints - Width breakpoints
   * @param {Object} options - Additional options
   * @returns {string} Srcset string
   */
  generateSrcset(imageUrl, breakpoints = DEFAULT_BREAKPOINTS, options = {}) {
    if (!this.isStoryblokUrl(imageUrl)) {
      return '';
    }

    return breakpoints
      .map(width => {
        const url = this.transform(imageUrl, {
          ...options,
          width,
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Generate picture element with sources
   * @param {string} imageUrl - Original image URL
   * @param {Object} options - Configuration options
   * @returns {Object} Picture element data
   */
  generatePictureData(imageUrl, options = {}) {
    const {
      alt = '',
      breakpoints = DEFAULT_BREAKPOINTS,
      formats = ['webp', 'jpg'],
      sizes = '100vw',
      quality = DEFAULT_QUALITY,
      loading = 'lazy',
      className = '',
    } = options;

    if (!this.isStoryblokUrl(imageUrl)) {
      return {
        sources: [],
        img: { src: imageUrl, alt, loading, className },
      };
    }

    // Generate sources for each format
    const sources = formats.slice(0, -1).map(format => ({
      type: `image/${format}`,
      srcset: this.generateSrcset(imageUrl, breakpoints, { format, quality }),
      sizes,
    }));

    // Default img element (last format)
    const defaultFormat = formats[formats.length - 1];
    const img = {
      src: this.transform(imageUrl, {
        width: breakpoints[breakpoints.length - 1],
        format: defaultFormat,
        quality,
      }),
      srcset: this.generateSrcset(imageUrl, breakpoints, {
        format: defaultFormat,
        quality,
      }),
      sizes,
      alt,
      loading,
      className,
    };

    return { sources, img };
  }

  /**
   * Create optimized image element
   * @param {string} imageUrl - Original image URL
   * @param {Object} options - Image options
   * @returns {HTMLElement} Image or picture element
   */
  createOptimizedImage(imageUrl, options = {}) {
    const { usePicture = true, ...pictureOptions } = options;

    if (!usePicture || !this.isStoryblokUrl(imageUrl)) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = options.alt || '';
      img.loading = options.loading || 'lazy';
      if (options.className) img.className = options.className;
      return img;
    }

    const pictureData = this.generatePictureData(imageUrl, pictureOptions);
    const picture = document.createElement('picture');

    // Add sources
    pictureData.sources.forEach(sourceData => {
      const source = document.createElement('source');
      Object.assign(source, sourceData);
      picture.appendChild(source);
    });

    // Add img
    const img = document.createElement('img');
    Object.assign(img, pictureData.img);
    picture.appendChild(img);

    return picture;
  }

  /**
   * Preload critical images
   * @param {Array<string>} imageUrls - Image URLs to preload
   * @param {Object} options - Preload options
   */
  preloadImages(imageUrls, options = {}) {
    const {
      format = 'webp',
      width = 1920,
      quality = DEFAULT_QUALITY,
    } = options;

    imageUrls.forEach(url => {
      if (!this.isStoryblokUrl(url)) return;

      const transformedUrl = this.transform(url, { format, width, quality });
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = transformedUrl;
      link.type = `image/${format}`;

      document.head.appendChild(link);
    });
  }

  /**
   * Calculate focal point for smart cropping
   * @param {Object} focal - Focal point from Storyblok
   * @returns {string} Object position CSS value
   */
  calculateFocalPoint(focal) {
    if (!focal) return 'center center';

    const x = focal.x || 50;
    const y = focal.y || 50;

    return `${x}% ${y}%`;
  }

  /**
   * Clear transform cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
export const imageService = new StoryblokImageService();

/**
 * Helper function to create responsive image
 * @param {string} url - Image URL
 * @param {Object} options - Options
 * @returns {HTMLElement} Optimized image element
 */
export const createResponsiveImage = (url, options) => {
  return imageService.createOptimizedImage(url, options);
};

/**
 * Helper to get optimized image URL
 * @param {string} url - Original URL
 * @param {Object} options - Transform options
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options) => {
  return imageService.transform(url, options);
};

/**
 * Generate sizes attribute based on layout
 * @param {string} layout - Layout type
 * @returns {string} Sizes attribute value
 */
export const generateSizes = (layout = 'full') => {
  const sizesMap = {
    full: '100vw',
    content: '(min-width: 1280px) 1280px, 100vw',
    half: '(min-width: 768px) 50vw, 100vw',
    third: '(min-width: 768px) 33vw, 100vw',
    quarter: '(min-width: 768px) 25vw, (min-width: 640px) 50vw, 100vw',
    fixed: '300px',
  };

  return sizesMap[layout] || sizesMap.full;
};

/**
 * Create lazy loading observer
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver} Observer instance
 */
export const createLazyImageObserver = (options = {}) => {
  const { rootMargin = '50px', threshold = 0.01, onLoad = () => {} } = options;

  return new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;

          if (src) {
            img.src = src;
            delete img.dataset.src;
          }

          if (srcset) {
            img.srcset = srcset;
            delete img.dataset.srcset;
          }

          img.addEventListener(
            'load',
            () => {
              img.classList.add('loaded');
              onLoad(img);
            },
            { once: true }
          );

          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin,
      threshold,
    }
  );
};

/**
 * Detect WebP support
 * @returns {Promise<boolean>} WebP support
 */
export const detectWebPSupport = () => {
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Export default instance
export default imageService;
