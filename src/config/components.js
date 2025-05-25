// File: src/config/components.js
/**
 * Component registry configuration
 * Central registry for all component factories and validation schemas
 */

// JSDoc import types to help IntelliSense
/** @typedef {import('../types/jsdoc.js').SvarogComponentFactory} SvarogComponentFactory */

// Import with JSDoc annotations to help IDEs understand the exports
/** @type {SvarogComponentFactory} */
import {
  Button,
  /** @type {SvarogComponentFactory} */
  Typography, // Add explicit JSDoc type annotation
  Card,
  Grid,
  Section,
  Image,
  Hero,
  Header,
  Footer,
  Navigation,
} from 'svarog-ui';

// Alternative: Use JSDoc @import comment (newer JSDoc feature)
/**
 * @import {Button, Typography, Card, Grid, Section, Image, Hero, Header, Footer, Navigation} from 'svarog-ui'
 */

/**
 * Component factory registry
 * Maps component names to their factory functions
 * @type {Map<string, SvarogComponentFactory>}
 */
export const COMPONENT_FACTORIES = new Map([
  ['Button', Button],
  ['Typography', Typography], // This exists and works correctly
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
 * @type {Map<string, string>}
 */
export const CMS_COMPONENT_MAP = new Map([
  ['hero_section', 'Hero'],
  ['text_block', 'Typography'], // Keep using Typography - it works!
  ['button', 'Button'],
  ['card', 'Card'],
  ['image', 'Image'],
  ['grid', 'Grid'],
  ['section', 'Section'],
  ['header', 'Header'],
  ['footer', 'Footer'],
  ['navigation', 'Navigation'],
]);

// Rest of your existing code...
