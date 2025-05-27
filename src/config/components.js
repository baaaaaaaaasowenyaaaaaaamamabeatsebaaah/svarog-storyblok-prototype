// src/config/components.js

/**
 * Component registry configuration
 * Smart loader that imports all components from svarog-ui-core
 */

import * as SvarogUICore from 'svarog-ui-core';
import { defaultTheme } from 'svarog-ui';

// Log what's available in the core package
console.log(
  'Available exports from svarog-ui-core:',
  Object.keys(SvarogUICore)
);

// Extract all component-related exports (excluding utilities)
const utilityExports = [
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
  'defaultTheme',
  'getCurrentTheme',
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
];

// Get all component names by filtering out utilities
const componentNames = Object.keys(SvarogUICore).filter(
  key => !utilityExports.includes(key)
);

console.log('Detected components:', componentNames);

// Extract theme utilities
const { ThemeManager, getCurrentTheme, registerTheme, switchTheme } =
  SvarogUICore;

/**
 * Create a fallback component for any missing imports
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

    // Apply theme if available
    if (props.theme) {
      element.setAttribute('data-theme', props.theme);
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
 * Dynamically build component factories based on available exports
 */
const COMPONENT_FACTORIES_DATA = [];

// Add all detected components
componentNames.forEach(componentName => {
  const component = SvarogUICore[componentName];
  if (component && typeof component === 'function') {
    COMPONENT_FACTORIES_DATA.push([componentName, component]);
  }
});

// Add fallbacks for components that might not be exported but we know exist
const expectedComponents = [
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
];

expectedComponents.forEach(componentName => {
  // Only add if not already in the list
  if (!COMPONENT_FACTORIES_DATA.find(([name]) => name === componentName)) {
    COMPONENT_FACTORIES_DATA.push([
      componentName,
      SvarogUICore[componentName] || createFallbackComponent(componentName),
    ]);
  }
});

console.log('Total components registered:', COMPONENT_FACTORIES_DATA.length);

/**
 * Component factory registry
 */
export const COMPONENT_FACTORIES = new Map(COMPONENT_FACTORIES_DATA);

/**
 * CMS to Svarog-UI component mapping
 * This mapping stays the same regardless of what components are available
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

  page: {
    title: { type: 'string', required: true },
    description: { type: 'string' },
    children: { type: 'array', required: true },
  },

  // Content Components
  hero_section: {
    title: { type: 'string', required: true, maxLength: 100 },
    subtitle: { type: 'string', maxLength: 200 },
    background_image: { type: 'asset' },
    cta_button: { type: 'object' },
  },

  muchandy_hero: {
    title: { type: 'string', required: true },
    subtitle: { type: 'string' },
    backgroundVideo: { type: 'string' },
    ctaButtons: { type: 'array' },
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

  card: {
    title: { type: 'string', required: true },
    content: { type: 'string' },
    image: { type: 'asset' },
    link: { type: 'object' },
    variant: {
      type: 'string',
      enum: ['default', 'elevated', 'outlined'],
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

  logo: {
    src: { type: 'asset', required: true },
    alt: { type: 'string', required: true },
    href: { type: 'string', default: '/' },
    size: {
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
  },

  // Navigation Components
  header: {
    logo: { type: 'object' },
    navigation: { type: 'array' },
    variant: {
      type: 'string',
      enum: ['default', 'transparent', 'fixed'],
      default: 'default',
    },
  },

  collapsible_header: {
    logo: { type: 'object' },
    navigation: { type: 'array' },
    collapseOnScroll: { type: 'boolean', default: true },
  },

  navigation: {
    items: { type: 'array', required: true },
    variant: {
      type: 'string',
      enum: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
  },

  footer: {
    copyright: { type: 'string' },
    links: { type: 'array' },
    social: { type: 'array' },
  },

  pagination: {
    currentPage: { type: 'number', required: true },
    totalPages: { type: 'number', required: true },
    onPageChange: { type: 'function' },
  },

  tabs: {
    tabs: { type: 'array', required: true },
    defaultTab: { type: 'number', default: 0 },
  },

  // Form Components
  form: {
    onSubmit: { type: 'function' },
    validation: { type: 'object' },
    children: { type: 'array', required: true },
  },

  form_group: {
    label: { type: 'string' },
    error: { type: 'string' },
    children: { type: 'array', required: true },
  },

  form_section: {
    title: { type: 'string' },
    description: { type: 'string' },
    children: { type: 'array', required: true },
  },

  form_actions: {
    primaryAction: { type: 'object' },
    secondaryAction: { type: 'object' },
    alignment: {
      type: 'string',
      enum: ['left', 'center', 'right'],
      default: 'right',
    },
  },

  input: {
    type: { type: 'string', default: 'text' },
    name: { type: 'string', required: true },
    label: { type: 'string' },
    placeholder: { type: 'string' },
    value: { type: 'string' },
    required: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
  },

  select: {
    name: { type: 'string', required: true },
    label: { type: 'string' },
    options: { type: 'array', required: true },
    value: { type: 'string' },
    required: { type: 'boolean', default: false },
  },

  checkbox: {
    name: { type: 'string', required: true },
    label: { type: 'string', required: true },
    checked: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
  },

  radio: {
    name: { type: 'string', required: true },
    value: { type: 'string', required: true },
    label: { type: 'string', required: true },
    checked: { type: 'boolean', default: false },
  },

  radio_group: {
    name: { type: 'string', required: true },
    options: { type: 'array', required: true },
    value: { type: 'string' },
  },

  condition_selector: {
    conditions: { type: 'array', required: true },
    value: { type: 'string' },
    onChange: { type: 'function' },
  },

  // UI Components
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

  link: {
    text: { type: 'string', required: true },
    href: { type: 'string', required: true },
    target: { type: 'string', enum: ['_self', '_blank'], default: '_self' },
    variant: {
      type: 'string',
      enum: ['default', 'underline', 'button'],
      default: 'default',
    },
  },

  rating: {
    value: { type: 'number', min: 0, max: 5, default: 0 },
    readonly: { type: 'boolean', default: false },
    size: {
      type: 'string',
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
  },

  price_display: {
    price: { type: 'number', required: true },
    currency: { type: 'string', default: 'EUR' },
    originalPrice: { type: 'number' },
    showDiscount: { type: 'boolean', default: true },
  },

  steps_indicator: {
    steps: { type: 'array', required: true },
    currentStep: { type: 'number', default: 0 },
    variant: {
      type: 'string',
      enum: ['dots', 'numbers', 'progress'],
      default: 'dots',
    },
  },

  // Blog Components
  blog_card: {
    title: { type: 'string', required: true },
    excerpt: { type: 'string' },
    image: { type: 'asset' },
    date: { type: 'string' },
    author: { type: 'string' },
    link: { type: 'string', required: true },
  },

  blog_list: {
    posts: { type: 'array', required: true },
    variant: { type: 'string', enum: ['grid', 'list'], default: 'grid' },
    columns: { type: 'number', min: 1, max: 4, default: 3 },
  },

  blog_detail: {
    title: { type: 'string', required: true },
    content: { type: 'richtext', required: true },
    author: { type: 'object' },
    date: { type: 'string' },
    tags: { type: 'array' },
  },

  // Product Components
  product_card: {
    name: { type: 'string', required: true },
    price: { type: 'number', required: true },
    image: { type: 'asset', required: true },
    description: { type: 'string' },
    link: { type: 'string' },
    inStock: { type: 'boolean', default: true },
  },

  // Specialized Components
  phone_repair_form: {
    phoneModels: { type: 'array', required: true },
    repairTypes: { type: 'array', required: true },
    onSubmit: { type: 'function' },
  },

  used_phone_price_form: {
    phoneModels: { type: 'array', required: true },
    conditions: { type: 'array', required: true },
    basePrice: { type: 'object' },
    onCalculate: { type: 'function' },
  },

  contact_info: {
    phone: { type: 'string' },
    email: { type: 'string' },
    address: { type: 'string' },
    hours: { type: 'array' },
  },

  sticky_contact_icons: {
    phone: { type: 'string' },
    whatsapp: { type: 'string' },
    email: { type: 'string' },
    position: { type: 'string', enum: ['left', 'right'], default: 'right' },
  },

  map: {
    location: { type: 'object', required: true },
    zoom: { type: 'number', default: 14 },
    height: { type: 'string', default: '400px' },
    markers: { type: 'array' },
  },
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
    collapsible_header: 'Navigation',
    navigation: 'Navigation',
    footer: 'Navigation',
    pagination: 'Navigation',
    tabs: 'Navigation',
    form: 'Forms',
    form_group: 'Forms',
    form_section: 'Forms',
    form_actions: 'Forms',
    input: 'Forms',
    select: 'Forms',
    checkbox: 'Forms',
    radio: 'Forms',
    radio_group: 'Forms',
    condition_selector: 'Forms',
    button: 'UI Elements',
    link: 'UI Elements',
    rating: 'UI Elements',
    price_display: 'UI Elements',
    steps_indicator: 'UI Elements',
    blog_card: 'Blog',
    blog_list: 'Blog',
    blog_detail: 'Blog',
    product_card: 'Products',
    phone_repair_form: 'Specialized',
    used_phone_price_form: 'Specialized',
    contact_info: 'Specialized',
    sticky_contact_icons: 'Specialized',
    map: 'Specialized',
  };

  return categories[componentType] || 'Other';
};

export const registerComponentFactory = (name, factory) => {
  COMPONENT_FACTORIES.set(name, factory);
};

export const registerCMSMapping = (cmsType, svarogType) => {
  CMS_COMPONENT_MAP.set(cmsType, svarogType);
};

// Export theme utilities
export {
  ThemeManager,
  defaultTheme,
  getCurrentTheme,
  registerTheme,
  switchTheme,
};
