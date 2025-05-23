/**
 * Component registry configuration
 * Central registry for all component factories and validation schemas
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
 * Component factory registry
 * Maps component names to their factory functions
 */
export const COMPONENT_FACTORIES = new Map([
  ['Button', Button],
  ['Typography', Typography],
  ['Card', Card],
  ['Grid', Grid],
  ['Section', Section],
  ['Image', Image],
  ['Hero', Hero],
  ['Header', Header],
  ['Footer', Footer],
  ['Navigation', Navigation],
]);

/**
 * CMS to Svarog-UI component mapping
 * Maps Storyblok component types to Svarog-UI components
 */
export const CMS_COMPONENT_MAP = new Map([
  ['hero_section', 'Hero'],
  ['text_block', 'Typography'],
  ['button', 'Button'],
  ['card', 'Card'],
  ['image', 'Image'],
  ['grid', 'Grid'],
  ['section', 'Section'],
  ['header', 'Header'],
  ['footer', 'Footer'],
  ['navigation', 'Navigation'],
]);

/**
 * Component validation schemas
 * Defines required and optional properties for each component type
 */
export const COMPONENT_SCHEMAS = {
  hero_section: {
    title: { type: 'string', required: true, maxLength: 100 },
    subtitle: { type: 'string', maxLength: 200 },
    background_image: { type: 'asset' },
    cta_button: {
      type: 'object',
      properties: {
        text: { type: 'string', required: true },
        url: { type: 'string', required: true },
        variant: { type: 'string', enum: ['primary', 'secondary', 'outline'] },
      },
    },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  text_block: {
    content: { type: 'richtext', required: true },
    variant: {
      type: 'string',
      enum: ['body', 'heading', 'caption'],
      default: 'body',
    },
    alignment: {
      type: 'string',
      enum: ['left', 'center', 'right'],
      default: 'left',
    },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  button: {
    text: { type: 'string', required: true, maxLength: 50 },
    url: { type: 'string', required: true },
    variant: {
      type: 'string',
      enum: ['primary', 'secondary', 'outline'],
      default: 'primary',
    },
    size: {
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    disabled: { type: 'boolean', default: false },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  card: {
    title: { type: 'string', required: true, maxLength: 100 },
    content: { type: 'string', maxLength: 500 },
    image: { type: 'asset' },
    link: {
      type: 'object',
      properties: {
        text: { type: 'string', required: true },
        url: { type: 'string', required: true },
      },
    },
    variant: {
      type: 'string',
      enum: ['default', 'elevated', 'outlined'],
      default: 'default',
    },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  image: {
    src: { type: 'asset', required: true },
    alt: { type: 'string', required: true },
    caption: { type: 'string' },
    responsive: { type: 'boolean', default: true },
    lazy: { type: 'boolean', default: true },
  },

  grid: {
    columns: { type: 'number', min: 1, max: 12, default: 12 },
    gap: {
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    children: { type: 'array', required: true },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  section: {
    variant: {
      type: 'string',
      enum: ['default', 'primary', 'secondary'],
      default: 'default',
    },
    padding: {
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    children: { type: 'array', required: true },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  header: {
    logo: {
      type: 'object',
      properties: {
        src: { type: 'asset', required: true },
        alt: { type: 'string', required: true },
        href: { type: 'string', default: '/' },
      },
    },
    navigation: { type: 'array', default: [] },
    variant: {
      type: 'string',
      enum: ['default', 'transparent', 'fixed'],
      default: 'default',
    },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  footer: {
    copyright: { type: 'string' },
    links: { type: 'array', default: [] },
    social: { type: 'array', default: [] },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },

  navigation: {
    items: { type: 'array', required: true },
    variant: {
      type: 'string',
      enum: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    theme: {
      type: 'string',
      enum: ['default', 'cabalou', 'muchandy'],
      default: 'default',
    },
  },
};

/**
 * Gets component factory by name
 * @param {string} componentName - Name of the component
 * @returns {Function|null} Component factory function
 */
export const getComponentFactory = (componentName) => {
  return COMPONENT_FACTORIES.get(componentName) || null;
};

/**
 * Gets CMS component mapping
 * @param {string} cmsComponentType - CMS component type
 * @returns {string|null} Svarog-UI component name
 */
export const getCMSMapping = (cmsComponentType) => {
  return CMS_COMPONENT_MAP.get(cmsComponentType) || null;
};

/**
 * Gets validation schema for component type
 * @param {string} componentType - Component type
 * @returns {Object|null} Validation schema
 */
export const getValidationSchema = (componentType) => {
  return COMPONENT_SCHEMAS[componentType] || null;
};

/**
 * Registers a new component factory
 * @param {string} name - Component name
 * @param {Function} factory - Factory function
 */
export const registerComponentFactory = (name, factory) => {
  COMPONENT_FACTORIES.set(name, factory);
};

/**
 * Registers a new CMS mapping
 * @param {string} cmsType - CMS component type
 * @param {string} svarogType - Svarog-UI component name
 */
export const registerCMSMapping = (cmsType, svarogType) => {
  CMS_COMPONENT_MAP.set(cmsType, svarogType);
};
