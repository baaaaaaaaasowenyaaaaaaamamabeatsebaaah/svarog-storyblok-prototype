// File: src/integration/componentMapper.js
/**
 * Enhanced component mapper with better error handling and logging
 * Maps Storyblok components to Svarog-UI components with validation
 */

import {
  getComponentFactory,
  getCMSMapping,
  CMS_COMPONENT_MAP,
} from '../config/components.js';
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
      console.log('Available mappings:', Array.from(CMS_COMPONENT_MAP.keys()));
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
    backgroundImage: props.background_image?.filename || null,
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

  return {
    content: sanitizeHTML(content),
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
const transformButtonProps = props => ({
  text: props.text || 'Button',
  href: props.url || '#',
  variant: props.variant || 'primary',
  size: props.size || 'medium',
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
});

/**
 * Transforms card props
 * @param {Object} props - CMS props
 * @returns {Object} Svarog-UI props
 */
const transformCardProps = props => ({
  title: props.title || 'Card Title',
  content: props.content || '',
  image: props.image?.filename || null,
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
  columns: props.columns || 12,
  gap: props.gap || 'medium',
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
const transformSectionProps = props => ({
  variant: props.variant || 'default',
  padding: props.padding || 'medium',
  children: (props.children || [])
    .map(child => createComponent(child))
    .filter(Boolean),
  theme: props.theme || 'default',
});

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
  const fallbackFactory = getComponentFactory('Typography');

  if (!fallbackFactory) {
    // Create a simple DOM fallback if no Typography component available
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
        `;
        div.innerHTML = `
          <p><strong>Component not available:</strong> ${cmsComponent.component}</p>
          ${error && isDevelopment() ? `<details><summary>Error Details</summary><pre>${error.message}</pre></details>` : ''}
        `;
        return div;
      },
      update: () => {},
      destroy: () => {},
    };
  }

  return fallbackFactory({
    content: `
      <div class="component-fallback" style="
        padding: 1rem; 
        border: 2px dashed #ccc; 
        background: #f9f9f9;
        border-radius: 4px;
        margin: 0.5rem 0;
      ">
        <p><strong>Component not available:</strong> ${cmsComponent.component}</p>
        ${error && isDevelopment() ? `<details><summary>Error Details</summary><pre>${error.message}</pre></details>` : ''}
      </div>
    `,
    variant: 'body',
  });
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
 * Gets all registered component types
 * @returns {Array<string>} Array of CMS component type names
 */
export const getRegisteredComponents = () => {
  return Array.from(CMS_COMPONENT_MAP.keys());
};

/**
 * Registers a new component mapping
 * @param {string} componentType - Storyblok component type
 * @param {string} svarogComponentName - Svarog-UI component name
 */
export const registerComponent = (componentType, svarogComponentName) => {
  CMS_COMPONENT_MAP.set(componentType, svarogComponentName);
  if (isDevelopment()) {
    console.log(
      `Registered new component mapping: ${componentType} -> ${svarogComponentName}`
    );
  }
};
