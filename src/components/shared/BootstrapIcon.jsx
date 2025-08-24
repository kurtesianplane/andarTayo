import React, { useState, useEffect, useMemo } from 'react';
import { fallbackIcons } from './FallbackIcons';

/**
 * Bootstrap Icon component that renders Bootstrap Icons using icon font classes
 * Includes fallback icons for critical icons that may not load properly on some deployments
 * @param {string} name - The Bootstrap icon name (e.g., 'train-front-fill')
 * @param {string} className - Additional CSS classes
 * @param {number|string} size - Icon size (default: 16px)
 * @param {string} color - Icon color (default: currentColor)
 * @param {object} style - Additional inline styles
 */
const BootstrapIcon = ({ 
  name, 
  className = '', 
  size = 16, 
  color = 'currentColor',
  style = {},
  ...props 
}) => {
  const [useFallback, setUseFallback] = useState(false);
  const [iconFontLoaded, setIconFontLoaded] = useState(true);
  
  // Stable reference to prevent unnecessary re-renders
  const iconName = useMemo(() => name, [name]);
  
  // Check if Bootstrap Icons font is loaded
  useEffect(() => {
    let mounted = true;
    
    // Check if the Bootstrap Icons font is available
    const checkFontLoaded = () => {
      if (!mounted) return;
      
      if (document.fonts && document.fonts.check) {
        try {
          const isFontLoaded = document.fonts.check('1em "bootstrap-icons"');
          if (!isFontLoaded && mounted) {
            setIconFontLoaded(false);
            if (fallbackIcons[iconName]) {
              setUseFallback(true);
            }
          }
        } catch (error) {
          // Fallback to using the icon font anyway
          console.warn('Could not check font loading status:', error);
        }
      }
    };

    // Initial check
    checkFontLoaded();

    // Check again after fonts are loaded
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (mounted) checkFontLoaded();
      });
    }    
    return () => {
      mounted = false;
    };
  }, [iconName]);
    // If we have a fallback icon and should use it, render the fallback
  if (useFallback && fallbackIcons[iconName]) {
    const FallbackComponent = fallbackIcons[iconName];
    return (
      <FallbackComponent
        className={className}
        size={size}
        style={{ color, ...style }}
        {...props}
      />
    );
  }
  // Check if className contains Tailwind sizing classes (w-* h-* or text-*)
  const hasTailwindSizing = /\b[wh]-\d+\b/.test(className);
  const hasTextSizing = /\btext-\w+\b/.test(className);
  
  // Only apply fontSize if no Tailwind sizing classes are present
  const iconStyle = {
    color,
    lineHeight: 1,
    ...style
  };
    // Map text size classes to actual font sizes for better control
  if (hasTextSizing && !hasTailwindSizing) {
    // Override default size when using text classes for better visibility
    if (className.includes('text-8xl')) iconStyle.fontSize = '128px';
    else if (className.includes('text-7xl')) iconStyle.fontSize = '112px';
    else if (className.includes('text-6xl')) iconStyle.fontSize = '96px';
    else if (className.includes('text-5xl')) iconStyle.fontSize = '72px';
    else if (className.includes('text-4xl')) iconStyle.fontSize = '60px';
    else if (className.includes('text-3xl')) iconStyle.fontSize = '48px';
  } else if (!hasTailwindSizing && !hasTextSizing && size) {
    iconStyle.fontSize = typeof size === 'number' ? `${size}px` : size;
  }
  // Render using Bootstrap Icons font classes
  return (
    <i
      className={`bi bi-${iconName} ${className}`}
      style={iconStyle}
      {...props}
      onError={() => {
        // If there's an error and we have a fallback, use it
        if (fallbackIcons[iconName]) {
          setUseFallback(true);
        }
      }}
    />
  );
};

export default BootstrapIcon;
