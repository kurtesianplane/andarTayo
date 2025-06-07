// Scroll utility functions for navigation and autoscroll behavior

/**
 * Scrolls to the top of the page smoothly
 * Used for page navigation to ensure users start at the top
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

/**
 * Scrolls to the top of the page instantly (no animation)
 * Used for immediate page transitions
 */
export const scrollToTopInstant = () => {
  window.scrollTo(0, 0);
};

/**
 * Scrolls an element into view with smooth behavior
 * Used for route details and other in-page navigation
 * @param {HTMLElement} element - The element to scroll to
 * @param {Object} options - Scroll options
 */
export const scrollElementIntoView = (element, options = {}) => {
  if (!element) return;
  
  const defaultOptions = {
    behavior: 'smooth',
    block: 'start',
    inline: 'nearest'
  };
  
  // For better mobile experience, add offset to account for header and margins
  const isMobile = window.innerWidth < 768;
  const offset = isMobile ? 80 : 60; // More offset on mobile
  
  if (options.block === 'start') {
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const targetPosition = absoluteElementTop - offset;
    
    window.scrollTo({
      top: Math.max(0, targetPosition),
      behavior: defaultOptions.behavior
    });
  } else {
    element.scrollIntoView({ ...defaultOptions, ...options });
  }
};

/**
 * Debounced scroll function to prevent excessive scroll events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
