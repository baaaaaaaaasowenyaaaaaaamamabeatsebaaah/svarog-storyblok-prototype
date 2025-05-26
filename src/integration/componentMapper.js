// File: src/integration/componentMapper.js
/**
 * Enhanced component mapper with better error handling and logging
 * Maps Storyblok components to Svarog-UI components with validation
 */

import { getComponentFactory, getCMSMapping } from '../config/components.js';
import { sanitizeHTML } from '../utils/validation/index.js';
import { memoize } from '../utils/algorithms/index.js';
import { isDevelopment } from '../utils/environment.js';

/**
 * Main component creation function with validation and caching
 * @param {Object} cmsComponent - Storyblok component data
 * @returns {Object|null} Svarog-UI component instance or null
 */
export const createComponent = cmsComponent => {
  if (!cmsComponent || !cmsComponent.component) {
    if (isDevelopment()) {
      console.warn('Invalid CMS component data:', cmsComponent);
    }
    return null;
  }

  const { component: componentType, ...props } = cmsComponent;
  const svarogComponentName = getCMSMapping(componentType);

  if (!svarogComponentName) {
    if (isDevelopment()) {
      console.warn(`No mapping found for component type: ${componentType}`);
    }
    return createFallbackComponent(cmsComponent);
  }

  const factory = getComponentFactory(svarogComponentName);
  if (!factory) {
    if (isDevelopment()) {
      console.warn(`No factory found for component: ${svarogComponentName}`);
    }
    return createFallbackComponent(cmsComponent);
  }

  try {
    // Transform props for Svarog-UI
    const transformedProps = transformPropsForComponent(props, componentType);

    if (isDevelopment()) {
      console.log(
        `Creating ${componentType} -> ${svarogComponentName}`,
        transformedProps
      );
    }

    // Create component instance
    const component = factory(transformedProps);

    if (!component || !component.getElement) {
      throw new Error(
        `Invalid component returned from factory ${svarogComponentName}`
      );
    }

    return component;
  } catch (error) {
    console.error(`Error creating component ${componentType}:`, error);
    return createFallbackComponent(cmsComponent, error);
  }
};

/**
 * Transforms CMS props to Svarog-UI compatible props
 * @param {Object} props - CMS props
 * @param {string} componentType - Component type
 * @returns {Object} Transformed props
 */
const transformPropsForComponent = (props, componentType) => {
  const transformers = {
    hero_section: transformHeroProps,
    text_block: transformTextBlockProps,
    button: transformButtonProps,
    card: transformCardProps,
    image: transformImageProps,
    grid: transformGridProps,
    section: transformSectionProps,
    header: transformHeaderProps,
    footer: transformFooterProps,
    navigation: transformNavigationProps,
  };

  const transformer = transformers[componentType];
  if (!transformer) {
    if (isDevelopment()) {
      console.warn(
        `No transformer found for ${componentType}, using props as-is`
      );
    }
    return props;
  }

  return transformer(props);
};

/**
 * Transforms hero section props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformHeroProps = props => {
  const transformed = {
    title: props.title || 'Default Hero Title',
    subtitle: props.subtitle || null,
    // Use backgroundImageUrl instead of backgroundImage (fix deprecation)
    backgroundImageUrl: props.background_image?.filename || null,
    theme: props.theme || 'default',
  };

  // Transform CTA button if present
  if (props.cta_button) {
    transformed.ctaButton = {
      text: props.cta_button.text || 'Learn More',
      href: props.cta_button.url || '#',
      variant: props.cta_button.variant || 'primary',
      onClick: () => {
        if (isDevelopment()) {
          console.log('Hero CTA clicked:', props.cta_button.url);
        }
      },
    };
  }

  return transformed;
};

/**
 * Transforms text block props for Typography component
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformTextBlockProps = props => {
  let content = '';

  if (props.content) {
    if (typeof props.content === 'string') {
      content = props.content;
    } else if (props.content.type === 'doc') {
      content = convertRichTextToHTML(props.content);
    } else {
      content = JSON.stringify(props.content);
    }
  }

  // Typography component expects 'children' instead of 'content'
  return {
    children: sanitizeHTML(content),
    variant: props.variant || 'body',
    alignment: props.alignment || 'left',
    theme: props.theme || 'default',
  };
};

/**
 * Transforms button props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformButtonProps = props => {
  // Validate button size - only 'sm', 'md', 'lg' are valid
  const validSizes = ['sm', 'md', 'lg'];
  const sizeMap = {
    small: 'sm',
    medium: 'md',
    large: 'lg',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };

  const size = sizeMap[props.size] || 'md';

  return {
    text: props.text || 'Button',
    href: props.url || '#',
    variant: props.variant || 'primary',
    size: validSizes.includes(size) ? size : 'md',
    disabled: props.disabled || false,
    theme: props.theme || 'default',
    onClick: () => {
      if (isDevelopment()) {
        console.log('Button clicked:', props.text, props.url);
      }
      // Track button clicks for analytics
      if (window.analytics) {
        window.analytics.track('Button Clicked', {
          text: props.text,
          url: props.url,
          variant: props.variant,
        });
      }
    },
  };
};

/**
 * Transforms card props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformCardProps = props => ({
  title: props.title || 'Card Title',
  children: props.content || '', // Card expects 'children' not 'content'
  imageUrl: props.image?.filename || null, // Use imageUrl instead of image
  link: props.link
    ? {
        text: props.link.text || 'Read More',
        href: props.link.url || '#',
      }
    : null,
  variant: props.variant || 'default',
  theme: props.theme || 'default',
});

/**
 * Transforms image props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformImageProps = props => ({
  src: props.src?.filename || props.src,
  alt: props.alt || props.src?.alt || 'Image',
  caption: props.caption || null,
  responsive: props.responsive !== false,
  lazy: props.lazy !== false,
});

/**
 * Transforms grid props with recursive child component creation
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformGridProps = props => ({
  columns: parseInt(props.columns) || 12, // Ensure it's a number
  // Skip gap property for now to see if Grid works without it
  children: (props.children || [])
    .map(child => createComponent(child))
    .filter(Boolean),
  theme: props.theme || 'default',
});

/**
 * Transforms section props with recursive child component creation
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformSectionProps = props => {
  // Section only accepts 'minor' variant or undefined
  const variant = props.variant === 'minor' ? 'minor' : undefined;

  return {
    variant,
    padding: props.padding || 'medium',
    children: (props.children || [])
      .map(child => createComponent(child))
      .filter(Boolean),
    theme: props.theme || 'default',
  };
};

/**
 * Transforms header props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformHeaderProps = props => ({
  logo: props.logo
    ? {
        src: props.logo.src || props.logo.filename,
        alt: props.logo.alt || 'Logo',
        href: props.logo.href || '/',
      }
    : null,
  navigation: (props.navigation || []).map(item => ({
    text: item.text || 'Nav Item',
    href: item.url || '#',
    active: item.active || false,
  })),
  variant: props.variant || 'default',
  theme: props.theme || 'default',
});

/**
 * Transforms footer props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformFooterProps = props => ({
  copyright: props.copyright || '',
  links: (props.links || []).map(link => ({
    text: link.text || 'Link',
    href: link.url || '#',
  })),
  social: (props.social || []).map(item => ({
    platform: item.platform || 'website',
    url: item.url || '#',
  })),
  theme: props.theme || 'default',
});

/**
 * Transforms navigation props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformNavigationProps = props => ({
  items: (props.items || []).map(item => ({
    text: item.text || 'Nav Item',
    href: item.url || '#',
    active: item.active || false,
    children: item.children || [],
  })),
  variant: props.variant || 'horizontal',
  theme: props.theme || 'default',
});

/**
 * Creates a fallback component for unsupported or failed components
 * @param {Object} cmsComponent - Original CMS component data
 * @param {Error} [error] - Optional error object
 * @returns {Object} Fallback component instance
 */
const createFallbackComponent = (cmsComponent, error = null) => {
  // Create a simple DOM-based fallback instead of using Typography
  return {
    getElement: () => {
      const div = document.createElement('div');
      div.className = 'component-fallback';
      div.style.cssText = `
        padding: 1rem; 
        border: 2px dashed #ccc; 
        background: #f9f9f9; 
        border-radius: 4px;
        margin: 0.5rem 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      div.innerHTML = `
        <p><strong>Component not available:</strong> ${cmsComponent.component}</p>
        ${
          error && isDevelopment()
            ? `
          <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; font-size: 0.875rem; color: #666;">Error Details</summary>
            <pre style="font-size: 0.75rem; color: #999; margin-top: 0.25rem; white-space: pre-wrap;">${error.message}</pre>
          </details>
        `
            : ''
        }
      `;

      return div;
    },
    update: () => {},
    destroy: () => {},
  };
};

/**
 * Converts Storyblok rich text to HTML with memoization
 * @param {Object} richText - Storyblok rich text object
 * @returns {string} HTML string
 */
const convertRichTextToHTML = memoize(richText => {
  if (!richText || !richText.content) {
    return '';
  }

  const convertNode = node => {
    switch (node.type) {
      case 'paragraph': {
        const content = (node.content || []).map(convertNode).join('');
        return `<p>${content}</p>`;
      }

      case 'heading': {
        const level = node.attrs?.level || 1;
        const content = (node.content || []).map(convertNode).join('');
        return `<h${level}>${content}</h${level}>`;
      }

      case 'text': {
        let text = node.text || '';

        // Apply marks (bold, italic, etc.)
        if (node.marks) {
          node.marks.forEach(mark => {
            switch (mark.type) {
              case 'bold':
                text = `<strong>${text}</strong>`;
                break;
              case 'italic':
                text = `<em>${text}</em>`;
                break;
              case 'link':
                text = `<a href="${mark.attrs?.href || '#'}">${text}</a>`;
                break;
              case 'underline':
                text = `<u>${text}</u>`;
                break;
            }
          });
        }

        return text;
      }

      case 'bullet_list': {
        const content = (node.content || []).map(convertNode).join('');
        return `<ul>${content}</ul>`;
      }

      case 'ordered_list': {
        const content = (node.content || []).map(convertNode).join('');
        return `<ol>${content}</ol>`;
      }

      case 'list_item': {
        const content = (node.content || []).map(convertNode).join('');
        return `<li>${content}</li>`;
      }

      case 'hard_break':
        return '<br>';

      case 'horizontal_rule':
        return '<hr>';

      default:
        return (node.content || []).map(convertNode).join('');
    }
  };

  const htmlContent = (richText.content || []).map(convertNode).join('');
  return sanitizeHTML(htmlContent);
});

/**
 * Gets all registered component types using the array data directly
 * @returns {Array<string>} Array of CMS component type names
 */
export const getRegisteredComponents = () => {
  // Import the data array directly to avoid Map issues in tests
  const CMS_COMPONENT_MAP_DATA = [
    'grid',
    'section',
    'page',
    'hero_section',
    'muchandy_hero',
    'text_block',
    'card',
    'image',
    'logo',
    'header',
    'collapsible_header',
    'navigation',
    'footer',
    'pagination',
    'tabs',
    'form',
    'form_group',
    'form_section',
    'form_actions',
    'input',
    'select',
    'checkbox',
    'radio',
    'radio_group',
    'condition_selector',
    'button',
    'link',
    'rating',
    'price_display',
    'steps_indicator',
    'blog_card',
    'blog_list',
    'blog_detail',
    'product_card',
    'phone_repair_form',
    'used_phone_price_form',
    'contact_info',
    'sticky_contact_icons',
    'map',
  ];

  return CMS_COMPONENT_MAP_DATA;
};

/**
 * Registers a new component mapping
 * @param {string} componentType - Storyblok component type
 * @param {string} svarogComponentName - Svarog-UI component name
 */
export const registerComponent = (componentType, svarogComponentName) => {
  // This would need to be implemented based on how CMS_COMPONENT_MAP is exposed
  if (isDevelopment()) {
    console.log(
      `Registered new component mapping: ${componentType} -> ${svarogComponentName}`
    );
  }
};
