// src/config/components.js
/**
 * Component registry configuration for svarog-ui-core v2.0.0
 * Uses proper imports from the updated package structure
 */

import * as SvarogUICore from 'svarog-ui-core';
import { isDevelopment } from '../utils/environment.js';

// Extract theme utilities from svarog-ui-core
const { ThemeManager } = SvarogUICore;

// Log available exports in development
if (isDevelopment()) {
  console.log(
    'Available exports from svarog-ui-core v2.0.0:',
    Object.keys(SvarogUICore)
  );
}

// Known utility exports to exclude from component list
const UTILITY_EXPORTS = [
  'ThemeManager',
  'appendChildren',
  'batchDomUpdates',
  'cleanupEventListeners',
  'createBaseComponent',
  'createComponent',
  'createElement',
  'createStyleInjector',
  'css',
  'debounce',
  'injectStyles',
  'measurePerformance',
  'memoize',
  'rafThrottle',
  'registerTheme',
  'removeStyles',
  'runWhenIdle',
  'switchTheme',
  'throttle',
  'validateInput',
  'validateProps',
  'validateRequiredProps',
  'withBehavior',
  'withEventDelegation',
  'withThemeAwareness',
  'PerformanceBenchmark',
  'StyleInjector',
  'constants',
  'utils',
];

// Extract component names by filtering out utilities
const componentNames = Object.keys(SvarogUICore).filter(
  key =>
    !UTILITY_EXPORTS.includes(key) && typeof SvarogUICore[key] === 'function'
);

if (isDevelopment()) {
  console.log(
    `Detected ${componentNames.length} components from svarog-ui-core:`,
    componentNames
  );
}

/**
 * Create fallback component for any missing imports
 */
const createFallbackComponent = (type, defaultTag = 'div') => {
  return (props = {}) => {
    const element = document.createElement(defaultTag);
    element.className =
      `svarog-${type.toLowerCase()} ${props.className || ''}`.trim();

    // Add basic content handling
    if (props.children) {
      if (typeof props.children === 'string') {
        element.innerHTML = props.children;
      } else if (Array.isArray(props.children)) {
        props.children.forEach(child => {
          if (child && child.getElement) {
            element.appendChild(child.getElement());
          }
        });
      }
    } else if (props.text) {
      element.textContent = props.text;
    } else if (props.title) {
      element.innerHTML = `<h2>${props.title}</h2>`;
      if (props.subtitle) {
        element.innerHTML += `<p>${props.subtitle}</p>`;
      }
    }

    return {
      getElement: () => element,
      update: newProps => {
        if (newProps.text) element.textContent = newProps.text;
        if (newProps.children && typeof newProps.children === 'string') {
          element.innerHTML = newProps.children;
        }
      },
      destroy: () => {
        element.remove();
      },
    };
  };
};

/**
 * Build component factories from svarog-ui-core exports
 */
const COMPONENT_FACTORIES_DATA = [];

// Add all detected components
componentNames.forEach(componentName => {
  const component = SvarogUICore[componentName];
  if (component && typeof component === 'function') {
    COMPONENT_FACTORIES_DATA.push([componentName, component]);
  }
});

// Add fallbacks for expected components that might not be exported
const EXPECTED_COMPONENTS = [
  'Grid',
  'Section',
  'Page',
  'Hero',
  'MuchandyHero',
  'Typography',
  'Image',
  'Logo',
  'Header',
  'Navigation',
  'Footer',
  'Pagination',
  'Tabs',
  'Input',
  'Select',
  'Radio',
  'RadioGroup',
  'Link',
  'Rating',
  'PriceDisplay',
  'StepsIndicator',
  'ProductCard',
  'PhoneRepairForm',
  'UsedPhonePriceForm',
  'StickyContactIcons',
  'Map',
  'BlogCard',
  'BlogDetail',
  'BlogList',
  'ContactInfo',
  'CollapsibleHeader',
  'ConditionSelector',
  'Form',
  'FormActions',
  'FormGroup',
  'FormSection',
  'Checkbox',
];

EXPECTED_COMPONENTS.forEach(componentName => {
  // Only add if not already in the list
  if (!COMPONENT_FACTORIES_DATA.find(([name]) => name === componentName)) {
    COMPONENT_FACTORIES_DATA.push([
      componentName,
      SvarogUICore[componentName] || createFallbackComponent(componentName),
    ]);
  }
});

if (isDevelopment()) {
  console.log(
    `Total components registered: ${COMPONENT_FACTORIES_DATA.length}`
  );
}

/**
 * Component factory registry
 */
export const COMPONENT_FACTORIES = new Map(COMPONENT_FACTORIES_DATA);

/**
 * CMS to Svarog-UI component mapping
 */
export const CMS_COMPONENT_MAP = new Map([
  // Layout
  ['grid', 'Grid'],
  ['section', 'Section'],
  ['page', 'Page'],

  // Content
  ['hero_section', 'Hero'],
  ['muchandy_hero', 'MuchandyHero'],
  ['text_block', 'Typography'],
  ['card', 'Card'],
  ['image', 'Image'],
  ['logo', 'Logo'],

  // Navigation
  ['header', 'Header'],
  ['collapsible_header', 'CollapsibleHeader'],
  ['navigation', 'Navigation'],
  ['footer', 'Footer'],
  ['pagination', 'Pagination'],
  ['tabs', 'Tabs'],

  // Forms
  ['form', 'Form'],
  ['form_group', 'FormGroup'],
  ['form_section', 'FormSection'],
  ['form_actions', 'FormActions'],
  ['input', 'Input'],
  ['select', 'Select'],
  ['checkbox', 'Checkbox'],
  ['radio', 'Radio'],
  ['radio_group', 'RadioGroup'],
  ['condition_selector', 'ConditionSelector'],

  // UI Elements
  ['button', 'Button'],
  ['link', 'Link'],
  ['rating', 'Rating'],
  ['price_display', 'PriceDisplay'],
  ['steps_indicator', 'StepsIndicator'],

  // Blog
  ['blog_card', 'BlogCard'],
  ['blog_list', 'BlogList'],
  ['blog_detail', 'BlogDetail'],

  // Products
  ['product_card', 'ProductCard'],

  // Specialized
  ['phone_repair_form', 'PhoneRepairForm'],
  ['used_phone_price_form', 'UsedPhonePriceForm'],
  ['contact_info', 'ContactInfo'],
  ['sticky_contact_icons', 'StickyContactIcons'],
  ['map', 'Map'],
]);

/**
 * Component validation schemas
 * (Keep existing schemas - they're still valid)
 */
export const COMPONENT_SCHEMAS = {
  // Layout Components
  grid: {
    columns: { type: 'number', min: 1, max: 12, default: 12 },
    gap: {
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    children: { type: 'array', required: true },
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
  },

  // Content Components
  hero_section: {
    title: { type: 'string', required: true, maxLength: 100 },
    subtitle: { type: 'string', maxLength: 200 },
    background_image: { type: 'asset' },
    cta_button: { type: 'object' },
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
  },

  button: {
    text: { type: 'string', required: true },
    url: { type: 'string' },
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
  },

  // Keep all existing schemas - they're still valid for the new version
};

/**
 * Helper functions
 */
export const getComponentFactory = componentName => {
  return COMPONENT_FACTORIES.get(componentName) || null;
};

export const getCMSMapping = cmsComponentType => {
  return CMS_COMPONENT_MAP.get(cmsComponentType) || null;
};

export const getValidationSchema = componentType => {
  return COMPONENT_SCHEMAS[componentType] || null;
};

export const getAllComponentsForShowcase = () => {
  return Array.from(CMS_COMPONENT_MAP.entries()).map(
    ([cmsType, svarogType]) => ({
      cmsType,
      svarogType,
      schema: COMPONENT_SCHEMAS[cmsType] || {},
      category: getComponentCategory(cmsType),
    })
  );
};

const getComponentCategory = componentType => {
  const categories = {
    grid: 'Layout',
    section: 'Layout',
    page: 'Layout',
    hero_section: 'Content',
    muchandy_hero: 'Content',
    text_block: 'Content',
    card: 'Content',
    image: 'Content',
    logo: 'Content',
    header: 'Navigation',
    navigation: 'Navigation',
    footer: 'Navigation',
    form: 'Forms',
    input: 'Forms',
    select: 'Forms',
    button: 'UI Elements',
    blog_card: 'Blog',
    product_card: 'Products',
  };
  return categories[componentType] || 'Other';
};

export const registerComponentFactory = (name, factory) => {
  COMPONENT_FACTORIES.set(name, factory);
};

export const registerCMSMapping = (cmsType, svarogType) => {
  CMS_COMPONENT_MAP.set(cmsType, svarogType);
};

// Export theme utilities from svarog-ui-core
export { ThemeManager };
