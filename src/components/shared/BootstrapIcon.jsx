import React, { useState, useEffect } from 'react';
import { fallbackIcons } from './FallbackIcons';

/**
 * Bootstrap Icon component that renders Bootstrap Icons as inline SVG
 * Includes fallback icons for critical icons that may not load properly on some deployments
 * @param {string} name - The Bootstrap icon name (e.g., 'train-front-fill')
 * @param {string} className - Additional CSS classes
 * @param {number|string} size - Icon size (default: 16)
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
  
  // Check if we should use fallback immediately for critical icons in production
  useEffect(() => {
    // If in production and we have a fallback for this icon, use it
    if (process.env.NODE_ENV === 'production' && fallbackIcons[name]) {
      setUseFallback(true);
    }
  }, [name]);

  // If we have a fallback icon and should use it, render the fallback
  if (useFallback && fallbackIcons[name]) {
    const FallbackComponent = fallbackIcons[name];
    return (
      <FallbackComponent
        className={className}
        size={size}
        style={{ color, ...style }}
        {...props}
      />
    );
  }

  // Otherwise, render the regular Bootstrap Icon with SVG sprite
  return (
    <svg
      className={`bi bi-${name} ${className}`}
      width={size}
      height={size}
      fill={color}
      viewBox="0 0 16 16"
      style={style}
      {...props}
      onError={() => {
        // If the SVG sprite fails to load, try fallback
        if (fallbackIcons[name]) {
          setUseFallback(true);
        }
      }}
    >
      <use href={`/bootstrap-icons.svg#${name}`} />
    </svg>
  );
};

export default BootstrapIcon;
