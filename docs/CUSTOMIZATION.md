# Customization Guide

Learn how to customize your Svarog-UI + Storyblok website.

## Table of Contents
1. [Adding Custom Components](#adding-custom-components)
2. [Creating Custom Themes](#creating-custom-themes)
3. [Adding Business Logic](#adding-business-logic)
4. [Extending Functionality](#extending-functionality)

## Adding Custom Components

1. Create a new file in `src/components/custom/`
2. Export a component factory function
3. Register it in the component mapper
4. Create matching Storyblok component

### Example:

```javascript
// src/components/custom/Testimonial.js
export const Testimonial = (props) => {
  const element = document.createElement('div');
  element.className = 'testimonial';
  element.innerHTML = `
    <blockquote>
      <p>"${props.quote}"</p>
      <cite>- ${props.author}</cite>
    </blockquote>
  `;
  
  return {
    getElement: () => element,
    update: (newProps) => {
      // Update logic
    },
    destroy: () => {
      element.remove();
    }
  };
};
```

## Creating Custom Themes

1. Copy `src/theme/custom-theme.js`
2. Modify colors and styles
3. Register in theme system
4. Apply via theme switcher

## Adding Business Logic

Place feature-specific code in `src/features/`:
- Form handlers
- API integrations
- State management
- Business rules

## Extending Functionality

The template is designed to be extended without modifying core files.
Look for these markers in the code:
- `/* CUSTOM COMPONENTS */`
- `/* CUSTOM THEMES */`
- `/* CUSTOM ROUTES */`
