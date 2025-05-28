// src/theme/custom-theme.js
/**
 * Custom theme configuration
 * Customize colors, typography, and spacing
 */

export const customTheme = {
  name: 'custom',
  
  // Colors
  colors: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
  },
  
  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '16px',
    lineHeight: '1.6',
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '3rem',
  },
  
  // Apply theme
  apply: () => {
    const root = document.documentElement;
    
    // Apply colors
    Object.entries(customTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Apply typography
    root.style.setProperty('--font-family', customTheme.typography.fontFamily);
    root.style.setProperty('--font-size', customTheme.typography.fontSize);
    root.style.setProperty('--line-height', customTheme.typography.lineHeight);
    
    // Apply spacing
    Object.entries(customTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
  }
};
