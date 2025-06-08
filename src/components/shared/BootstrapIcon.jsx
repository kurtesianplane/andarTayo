import React from 'react';

/**
 * Bootstrap Icon component that renders Bootstrap Icons as inline SVG
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
  return (
    <svg
      className={`bi bi-${name} ${className}`}
      width={size}
      height={size}
      fill={color}
      viewBox="0 0 16 16"
      style={style}
      {...props}
    >
      <use xlinkHref={`/node_modules/bootstrap-icons/bootstrap-icons.svg#${name}`} />
    </svg>
  );
};

export default BootstrapIcon;
