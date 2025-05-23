module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    // Error prevention
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    
    // Code quality
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'warn',
    
    // Best practices
    'eqeqeq': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // ES6+ features
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'object-shorthand': 'error',
    
    // Import/Export
    'no-duplicate-imports': 'error',
  },
  globals: {
    // Global variables for browser environment
    window: 'readonly',
    document: 'readonly',
    console: 'readonly',
    
    // Import meta for Vite
    'import': 'readonly',
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.config.js',
    'server/',
  ],
};