// File: src/config/components.js
/**
 * Complete component registry configuration
 * Maps ALL Svarog-UI components to Storyblok
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
  BlogCard,
  BlogDetail,
  BlogList,
  Checkbox,
  CollapsibleHeader,
  ConditionSelector,
  ContactInfo,
  Form,
  FormActions,
  FormGroup,
  FormSection,
  Input,
  Link,
  Logo,
  Map,
  MuchandyHero,
  Page,
  Pagination,
  PhoneRepairForm,
  PriceDisplay,
  ProductCard,
  Radio,
  RadioGroup,
  Rating,
  Select,
  StepsIndicator,
  StickyContactIcons,
  Tabs,
  UsedPhonePriceForm,
} from 'svarog-ui';

/**
 * Component factory registry - ALL Svarog-UI components
 */
export const COMPONENT_FACTORIES = new Map([
  // Layout Components
  ['Grid', Grid],
  ['Section', Section],
  ['Page', Page],

  // Content Components
  ['Hero', Hero],
  ['MuchandyHero', MuchandyHero],
  ['Typography', Typography],
  ['Card', Card],
  ['Image', Image],
  ['Logo', Logo],

  // Navigation Components
  ['Header', Header],
  ['CollapsibleHeader', CollapsibleHeader],
  ['Navigation', Navigation],
  ['Footer', Footer],
  ['Pagination', Pagination],
  ['Tabs', Tabs],

  // Form Components
  ['Form', Form],
  ['FormGroup', FormGroup],
  ['FormSection', FormSection],
  ['FormActions', FormActions],
  ['Input', Input],
  ['Select', Select],
  ['Checkbox', Checkbox],
  ['Radio', Radio],
  ['RadioGroup', RadioGroup],
  ['ConditionSelector', ConditionSelector],

  // UI Components
  ['Button', Button],
  ['Link', Link],
  ['Rating', Rating],
  ['PriceDisplay', PriceDisplay],
  ['StepsIndicator', StepsIndicator],

  // Blog Components
  ['BlogCard', BlogCard],
  ['BlogList', BlogList],
  ['BlogDetail', BlogDetail],

  // Product Components
  ['ProductCard', ProductCard],

  // Specialized Components
  ['PhoneRepairForm', PhoneRepairForm],
  ['UsedPhonePriceForm', UsedPhonePriceForm],
  ['ContactInfo', ContactInfo],
  ['StickyContactIcons', StickyContactIcons],
  ['Map', Map],
]);

/**
 * CMS to Svarog-UI component mapping - ALL components
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
 * Component validation schemas - Extended for all components
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
 * Gets component factory by name
 * @param {string} componentName - Name of the component
 * @returns {Function|null} Component factory function
 */
export const getComponentFactory = componentName => {
  return COMPONENT_FACTORIES.get(componentName) || null;
};

/**
 * Gets CMS component mapping
 * @param {string} cmsComponentType - CMS component type
 * @returns {string|null} Svarog-UI component name
 */
export const getCMSMapping = cmsComponentType => {
  return CMS_COMPONENT_MAP.get(cmsComponentType) || null;
};

/**
 * Gets validation schema for component type
 * @param {string} componentType - Component type
 * @returns {Object|null} Validation schema
 */
export const getValidationSchema = componentType => {
  return COMPONENT_SCHEMAS[componentType] || null;
};

/**
 * Gets all available component types for showcase
 * @returns {Array<Object>} Component info for showcase
 */
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

/**
 * Gets component category for organization
 * @param {string} componentType - Component type
 * @returns {string} Component category
 */
const getComponentCategory = componentType => {
  const categories = {
    // Layout
    grid: 'Layout',
    section: 'Layout',
    page: 'Layout',

    // Content
    hero_section: 'Content',
    muchandy_hero: 'Content',
    text_block: 'Content',
    card: 'Content',
    image: 'Content',
    logo: 'Content',

    // Navigation
    header: 'Navigation',
    collapsible_header: 'Navigation',
    navigation: 'Navigation',
    footer: 'Navigation',
    pagination: 'Navigation',
    tabs: 'Navigation',

    // Forms
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

    // UI Elements
    button: 'UI Elements',
    link: 'UI Elements',
    rating: 'UI Elements',
    price_display: 'UI Elements',
    steps_indicator: 'UI Elements',

    // Blog
    blog_card: 'Blog',
    blog_list: 'Blog',
    blog_detail: 'Blog',

    // Products
    product_card: 'Products',

    // Specialized
    phone_repair_form: 'Specialized',
    used_phone_price_form: 'Specialized',
    contact_info: 'Specialized',
    sticky_contact_icons: 'Specialized',
    map: 'Specialized',
  };

  return categories[componentType] || 'Other';
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
