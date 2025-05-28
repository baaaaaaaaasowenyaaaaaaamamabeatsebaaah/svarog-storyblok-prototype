// src/utils/debug/index.js
import debugPanel from './utils/debug/debugPanel.js';

// Only initialize in development or with debug flag
export const initDebug = () => {
  if (localStorage.getItem('debug') === 'true') {
    debugPanel.init(window.app);
  }
};
