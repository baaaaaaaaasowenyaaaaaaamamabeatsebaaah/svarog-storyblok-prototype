// src/integration/componentMapper.js
/**
 * Simplified Svarog-UI Component Mapper
 * Maps Storyblok components to Svarog-UI components
 * Uses muchandy theme only - no theme switching logic
 */

import { getComponentFactory, getCMSMapping } from '../config/components.js';
import { sanitizeHTML } from '../utils/validation/index.js';
import { memoize } from '../utils/algorithms/index.js';
import { isDevelopment } from '../utils/environment.js';

/**
 * Main component creation function
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
      console.warn(`No Svarog-UI mapping found for: ${componentType}`);
    }
    return createFallbackComponent(cmsComponent);
  }

  const factory = getComponentFactory(svarogComponentName);
  if (!factory) {
    if (isDevelopment()) {
      console.warn(`No Svarog-UI factory found for: ${svarogComponentName}`);
    }
    return createFallbackComponent(cmsComponent);
  }

  try {
    // Transform props for Svarog-UI (no theme handling needed)
    const transformedProps = transformPropsForSvarogUI(props, componentType);

    if (isDevelopment()) {
      console.log(
        `Creating ${componentType} -> ${svarogComponentName}`,
        transformedProps
      );
    }

    // Create Svarog-UI component
    const component = factory(transformedProps);

    if (!component || !component.getElement) {
      throw new Error(
        `Invalid Svarog-UI component returned from factory ${svarogComponentName}`
      );
    }

    return component;
  } catch (error) {
    console.error(
      `Error creating Svarog-UI component ${componentType}:`,
      error
    );
    return createFallbackComponent(cmsComponent, error);
  }
};

/**
 * Transform CMS props to Svarog-UI compatible props
 * @param {Object} props - CMS props
 * @param {string} componentType - Component type
 * @returns {Object} Svarog-UI compatible props
 */
const transformPropsForSvarogUI = (props, componentType) => {
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
 * Transform hero section props
 */
const transformHeroProps = props => ({
  title: props.title || 'Hero Title',
  subtitle: props.subtitle || null,
  backgroundImageUrl: props.background_image?.filename || null,
  ctaButton: props.cta_button
    ? {
        text: props.cta_button.text || 'Learn More',
        href: props.cta_button.url || '#',
        variant: props.cta_button.variant || 'primary',
      }
    : null,
});

/**
 * Transform text block props
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
    children: sanitizeHTML(content),
    variant: props.variant || 'body',
    alignment: props.alignment || 'left',
  };
};

/**
 * Transform button props
 */
const transformButtonProps = props => {
  const sizeMap = {
    small: 'sm',
    medium: 'md',
    large: 'lg',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };

  return {
    text: props.text || 'Button',
    href: props.url || '#',
    variant: props.variant || 'primary',
    size: sizeMap[props.size] || 'md',
    disabled: props.disabled || false,
  };
};

/**
 * Transform card props
 */
const transformCardProps = props => ({
  title: props.title || 'Card Title',
  children: props.content || '',
  imageUrl: props.image?.filename || null,
  link: props.link
    ? {
        text: props.link.text || 'Read More',
        href: props.link.url || '#',
      }
    : null,
  variant: props.variant || 'default',
});

/**
 * Transform image props
 */
const transformImageProps = props => ({
  src: props.src?.filename || props.src,
  alt: props.alt || props.src?.alt || 'Image',
  caption: props.caption || null,
  responsive: props.responsive !== false,
  lazy: props.lazy !== false,
});

/**
 * Transform grid props
 */
const transformGridProps = props => ({
  columns: parseInt(props.columns) || 12,
  gap: props.gap || 'medium',
  children: (props.children || [])
    .map(child => createComponent(child))
    .filter(Boolean),
});

/**
 * Transform section props
 */
const transformSectionProps = props => ({
  variant: props.variant === 'minor' ? 'minor' : undefined,
  padding: props.padding || 'medium',
  children: (props.children || [])
    .map(child => createComponent(child))
    .filter(Boolean),
});

/**
 * Transform header props
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
});

/**
 * Transform footer props
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
});

/**
 * Transform navigation props
 */
const transformNavigationProps = props => ({
  items: (props.items || []).map(item => ({
    text: item.text || 'Nav Item',
    href: item.url || '#',
    active: item.active || false,
    children: item.children || [],
  })),
  variant: props.variant || 'horizontal',
});

/**
 * Create fallback component
 */
const createFallbackComponent = (cmsComponent, error = null) => {
  return {
    getElement: () => {
      const div = document.createElement('div');
      div.className = 'svarog-fallback';

      div.innerHTML = `
        <div>
          <strong>Component not available:</strong> ${cmsComponent.component}
          ${error && isDevelopment() ? `<br><small>${error.message}</small>` : ''}
        </div>
      `;

      return div;
    },
    update: () => {},
    destroy: () => {},
  };
};

/**
 * Convert rich text to HTML
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
 * Get registered components
 */
export const getRegisteredComponents = () => {
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
