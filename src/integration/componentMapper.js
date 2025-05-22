/**
 * Maps Storyblok components to Svarog-UI components
 * This is the core integration layer between CMS and UI library
 */

import {
  Button,
  Typography,
  Card,
  Grid,
  Section,
  Image,
  Hero,
  Header,
  Footer,
  Navigation,
} from 'svarog-ui';

/**
 * Component mapping configuration
 * Maps Storyblok component names to Svarog-UI factory functions
 */
const COMPONENT_MAP = new Map([
  // Content components
  ['hero_section', createHeroFromCMS],
  ['text_block', createTypographyFromCMS],
  ['button', createButtonFromCMS],
  ['card', createCardFromCMS],
  ['image', createImageFromCMS],

  // Layout components
  ['grid', createGridFromCMS],
  ['section', createSectionFromCMS],

  // Navigation components
  ['header', createHeaderFromCMS],
  ['footer', createFooterFromCMS],
  ['navigation', createNavigationFromCMS],
]);

/**
 * Creates Svarog-UI Hero component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Hero component instance
 */
function createHeroFromCMS(cmsData) {
  const {
    title = '',
    subtitle = '',
    background_image = null,
    cta_button = null,
    theme = 'default',
  } = cmsData;

  return Hero({
    title,
    subtitle,
    backgroundImage: background_image?.filename || null,
    ctaButton: cta_button
      ? {
          text: cta_button.text,
          href: cta_button.url,
          variant: cta_button.variant || 'primary',
        }
      : null,
    theme,
  });
}

/**
 * Creates Svarog-UI Typography component from Storyblok rich text
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Typography component instance
 */
function createTypographyFromCMS(cmsData) {
  const {
    content = null,
    variant = 'body',
    alignment = 'left',
    theme = 'default',
  } = cmsData;

  // Convert Storyblok rich text to HTML
  const htmlContent = convertRichTextToHTML(content);

  return Typography({
    content: htmlContent,
    variant,
    alignment,
    theme,
  });
}

/**
 * Creates Svarog-UI Button component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Button component instance
 */
function createButtonFromCMS(cmsData) {
  const {
    text = '',
    url = '#',
    variant = 'primary',
    size = 'medium',
    disabled = false,
    theme = 'default',
  } = cmsData;

  return Button({
    text,
    href: url,
    variant,
    size,
    disabled,
    theme,
    onClick: (event) => {
      // Track button clicks for analytics
      if (window.analytics) {
        window.analytics.track('Button Clicked', {
          text,
          url,
          variant,
        });
      }
    },
  });
}

/**
 * Creates Svarog-UI Card component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Card component instance
 */
function createCardFromCMS(cmsData) {
  const {
    title = '',
    content = '',
    image = null,
    link = null,
    variant = 'default',
    theme = 'default',
  } = cmsData;

  return Card({
    title,
    content,
    image: image?.filename || null,
    link: link
      ? {
          text: link.text,
          href: link.url,
        }
      : null,
    variant,
    theme,
  });
}

/**
 * Creates Svarog-UI Image component from Storyblok asset
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Image component instance
 */
function createImageFromCMS(cmsData) {
  const {
    src = '',
    alt = '',
    caption = '',
    responsive = true,
    lazy = true,
  } = cmsData;

  return Image({
    src: src.filename || src,
    alt: alt || src.alt || '',
    caption,
    responsive,
    lazy,
  });
}

/**
 * Creates Svarog-UI Grid component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Grid component instance
 */
function createGridFromCMS(cmsData) {
  const {
    columns = 12,
    gap = 'medium',
    children = [],
    theme = 'default',
  } = cmsData;

  // Recursively create child components
  const childComponents = children.map((child) => createComponent(child));

  return Grid({
    columns,
    gap,
    children: childComponents,
    theme,
  });
}

/**
 * Creates Svarog-UI Section component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Section component instance
 */
function createSectionFromCMS(cmsData) {
  const {
    variant = 'default',
    padding = 'medium',
    children = [],
    theme = 'default',
  } = cmsData;

  const childComponents = children.map((child) => createComponent(child));

  return Section({
    variant,
    padding,
    children: childComponents,
    theme,
  });
}

/**
 * Creates Svarog-UI Header component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Header component instance
 */
function createHeaderFromCMS(cmsData) {
  const {
    logo = null,
    navigation = [],
    variant = 'default',
    theme = 'default',
  } = cmsData;

  return Header({
    logo: logo
      ? {
          src: logo.filename,
          alt: logo.alt,
          href: '/',
        }
      : null,
    navigation: navigation.map((item) => ({
      text: item.text,
      href: item.url,
      active: item.active || false,
    })),
    variant,
    theme,
  });
}

/**
 * Creates Svarog-UI Footer component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Footer component instance
 */
function createFooterFromCMS(cmsData) {
  const {
    copyright = '',
    links = [],
    social = [],
    theme = 'default',
  } = cmsData;

  return Footer({
    copyright,
    links: links.map((link) => ({
      text: link.text,
      href: link.url,
    })),
    social: social.map((item) => ({
      platform: item.platform,
      url: item.url,
    })),
    theme,
  });
}

/**
 * Creates Svarog-UI Navigation component from Storyblok data
 * @param {Object} cmsData - Storyblok component data
 * @returns {Object} Svarog-UI Navigation component instance
 */
function createNavigationFromCMS(cmsData) {
  const { items = [], variant = 'horizontal', theme = 'default' } = cmsData;

  return Navigation({
    items: items.map((item) => ({
      text: item.text,
      href: item.url,
      active: item.active || false,
      children: item.children || [],
    })),
    variant,
    theme,
  });
}

/**
 * Main component creation function
 * @param {Object} cmsComponent - Storyblok component data
 * @returns {Object|null} Svarog-UI component instance or null
 */
export const createComponent = (cmsComponent) => {
  if (!cmsComponent || !cmsComponent.component) {
    console.warn('Invalid CMS component data:', cmsComponent);
    return null;
  }

  const { component: componentType, ...props } = cmsComponent;
  const factory = COMPONENT_MAP.get(componentType);

  if (!factory) {
    console.warn(`No factory found for component type: ${componentType}`);
    return createFallbackComponent(cmsComponent);
  }

  try {
    return factory(props);
  } catch (error) {
    console.error(`Error creating component ${componentType}:`, error);
    return createFallbackComponent(cmsComponent, error);
  }
};

/**
 * Creates a fallback component for unsupported or failed components
 * @param {Object} cmsComponent - Original CMS component data
 * @param {Error} [error] - Optional error object
 * @returns {Object} Fallback component instance
 */
function createFallbackComponent(cmsComponent, error = null) {
  return Typography({
    content: `<div class="component-fallback">
      <p><strong>Component not available:</strong> ${cmsComponent.component}</p>
      ${error ? `<details><summary>Error</summary><pre>${error.message}</pre></details>` : ''}
    </div>`,
    variant: 'body',
  });
}

/**
 * Converts Storyblok rich text to HTML
 * @param {Object} richText - Storyblok rich text object
 * @returns {string} HTML string
 */
function convertRichTextToHTML(richText) {
  if (!richText || !richText.content) {
    return '';
  }

  // This is a simplified converter - in production you might want to use
  // @storyblok/richtext or implement a more comprehensive converter
  return richText.content
    .map((node) => {
      if (node.type === 'paragraph') {
        const text =
          node.content?.map((textNode) => textNode.text || '').join('') || '';
        return `<p>${text}</p>`;
      }
      return '';
    })
    .join('');
}

/**
 * Gets all registered component types
 * @returns {Array<string>} Array of component type names
 */
export const getRegisteredComponents = () => {
  return Array.from(COMPONENT_MAP.keys());
};

/**
 * Registers a new component mapping
 * @param {string} componentType - Storyblok component type
 * @param {Function} factory - Svarog-UI factory function
 */
export const registerComponent = (componentType, factory) => {
  COMPONENT_MAP.set(componentType, factory);
};
