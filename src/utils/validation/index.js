/**
 * Content validation utilities
 * Provides efficient validation for CMS content and component props
 */

import DOMPurify from 'dompurify';
import { getValidationSchema } from '../../config/components.js';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Validates component props against schema
 * @param {Object} props - Props to validate
 * @param {string} componentType - Component type for schema lookup
 * @returns {Object} Validated and sanitized props
 * @throws {ValidationError} If validation fails
 */
export const validateComponentProps = (props, componentType) => {
  const schema = getValidationSchema(componentType);

  if (!schema) {
    console.warn(`No validation schema found for: ${componentType}`);
    return props;
  }

  const validatedProps = {};
  const errors = [];

  // Validate each field in schema
  Object.entries(schema).forEach(([field, rules]) => {
    const value = props[field];

    try {
      validatedProps[field] = validateField(value, rules, field);
    } catch (error) {
      errors.push(error.message);
    }
  });

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(', ')}`);
  }

  return validatedProps;
};

/**
 * Validates individual field against rules
 * @param {*} value - Value to validate
 * @param {Object} rules - Validation rules
 * @param {string} fieldName - Field name for error messages
 * @returns {*} Validated value
 */
const validateField = (value, rules, fieldName) => {
  // Handle required fields
  if (
    rules.required &&
    (value === undefined || value === null || value === '')
  ) {
    throw new ValidationError(`${fieldName} is required`, fieldName);
  }

  // Use default if value is undefined
  if (value === undefined && rules.default !== undefined) {
    return rules.default;
  }

  // Skip validation if value is not provided and not required
  if (value === undefined || value === null) {
    return value;
  }

  // Type validation
  if (rules.type) {
    validateType(value, rules.type, fieldName);
  }

  // String validations
  if (rules.type === 'string') {
    if (rules.maxLength && value.length > rules.maxLength) {
      throw new ValidationError(
        `${fieldName} must be ${rules.maxLength} characters or less`,
        fieldName
      );
    }

    if (rules.minLength && value.length < rules.minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${rules.minLength} characters`,
        fieldName
      );
    }

    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      throw new ValidationError(
        `${fieldName} does not match required pattern`,
        fieldName
      );
    }
  }

  // Number validations
  if (rules.type === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      throw new ValidationError(
        `${fieldName} must be at least ${rules.min}`,
        fieldName
      );
    }

    if (rules.max !== undefined && value > rules.max) {
      throw new ValidationError(
        `${fieldName} must be at most ${rules.max}`,
        fieldName
      );
    }
  }

  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    throw new ValidationError(
      `${fieldName} must be one of: ${rules.enum.join(', ')}`,
      fieldName
    );
  }

  // Array validation
  if (rules.type === 'array') {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }
  }

  // Object validation
  if (rules.type === 'object' && rules.properties) {
    if (typeof value !== 'object' || value === null) {
      throw new ValidationError(`${fieldName} must be an object`, fieldName);
    }

    // Validate object properties
    Object.entries(rules.properties).forEach(([prop, propRules]) => {
      validateField(value[prop], propRules, `${fieldName}.${prop}`);
    });
  }

  return value;
};

/**
 * Validates value type
 * @param {*} value - Value to validate
 * @param {string} expectedType - Expected type
 * @param {string} fieldName - Field name for error messages
 */
const validateType = (value, expectedType, fieldName) => {
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        throw new ValidationError(`${fieldName} must be a string`, fieldName);
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        throw new ValidationError(`${fieldName} must be a number`, fieldName);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new ValidationError(`${fieldName} must be a boolean`, fieldName);
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        throw new ValidationError(`${fieldName} must be an array`, fieldName);
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new ValidationError(`${fieldName} must be an object`, fieldName);
      }
      break;

    case 'asset':
      validateAsset(value, fieldName);
      break;

    case 'richtext':
      validateRichText(value, fieldName);
      break;

    default:
      console.warn(`Unknown type validation: ${expectedType}`);
  }
};

/**
 * Validates Storyblok asset object
 * @param {Object} asset - Asset object to validate
 * @param {string} fieldName - Field name for error messages
 */
const validateAsset = (asset, fieldName) => {
  if (!asset || typeof asset !== 'object') {
    throw new ValidationError(
      `${fieldName} must be a valid asset object`,
      fieldName
    );
  }

  if (!asset.filename) {
    throw new ValidationError(`${fieldName} must have a filename`, fieldName);
  }

  // Basic URL validation
  try {
    new URL(asset.filename);
  } catch {
    throw new ValidationError(`${fieldName} must have a valid URL`, fieldName);
  }
};

/**
 * Validates Storyblok rich text object
 * @param {Object} richText - Rich text object to validate
 * @param {string} fieldName - Field name for error messages
 */
const validateRichText = (richText, fieldName) => {
  if (!richText || typeof richText !== 'object') {
    throw new ValidationError(
      `${fieldName} must be a valid rich text object`,
      fieldName
    );
  }

  if (!richText.type || !richText.content) {
    throw new ValidationError(
      `${fieldName} must have type and content`,
      fieldName
    );
  }

  if (!Array.isArray(richText.content)) {
    throw new ValidationError(
      `${fieldName} content must be an array`,
      fieldName
    );
  }
};

/**
 * Sanitizes HTML content to prevent XSS using DOMPurify
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = html => {
  if (typeof window === 'undefined') {
    // Server-side or test environment
    // Return a basic sanitization for non-browser environments
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'span',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover'],
  });
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidURL = url => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
