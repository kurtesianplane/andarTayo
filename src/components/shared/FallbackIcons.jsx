import React from 'react';

/**
 * Fallback SVG icons for critical Bootstrap Icons that may not load properly on some deployments
 * These are individual SVG components that work reliably without requiring external SVG sprites
 */

export const TrainFrontFillIcon = ({ className = '', size = 16, style = {}, ...props }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={style}
    {...props}
  >
    <path d="M8 3.5a.5.5 0 0 1 .5.5v1.5A1.5 1.5 0 0 1 10 7h.5a.5.5 0 0 1 0 1H10a1.5 1.5 0 0 1-1.5 1.5v1.5a.5.5 0 0 1-1 0V9.5A1.5 1.5 0 0 1 6 8h-.5a.5.5 0 0 1 0-1H6a1.5 1.5 0 0 1 1.5-1.5V4a.5.5 0 0 1 .5-.5zM6 7h4a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5v-1A.5.5 0 0 1 6 7zm-2 4h8a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1zm0 1v1h8v-1H4z"/>
    <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2zm1 0v8.5h8V2H4z"/>
  </svg>
);

export const TrainLightrailFrontFillIcon = ({ className = '', size = 16, style = {}, ...props }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={style}
    {...props}
  >
    <path d="M4.5 1a.5.5 0 0 1 .5.5V2h6v-.5a.5.5 0 0 1 1 0V2h.5A1.5 1.5 0 0 1 14 3.5v8a1.5 1.5 0 0 1-1.5 1.5H12v1a.5.5 0 0 1-1 0v-1H5v1a.5.5 0 0 1-1 0v-1h-.5A1.5 1.5 0 0 1 2 11.5v-8A1.5 1.5 0 0 1 3.5 2H4v-.5a.5.5 0 0 1 .5-.5zM3 3.5v8a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-8a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zM6 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM5 9.5A1.5 1.5 0 0 1 6.5 8h3A1.5 1.5 0 0 1 11 9.5v1a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-1z"/>
  </svg>
);

export const BusFrontFillIcon = ({ className = '', size = 16, style = {}, ...props }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={style}
    {...props}
  >
    <path d="M5 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4zM4.603 2.5A.75.75 0 0 1 5.25 2h5.5a.75.75 0 0 1 .647.5L12 4H4l.603-1.5zM14 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5zM3 14h10V4.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5V14z"/>
    <path d="M5 6a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 8V6zm0 4a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1zm3.5-.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2z"/>
  </svg>
);

export const TruckFrontFillIcon = ({ className = '', size = 16, style = {}, ...props }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    style={style}
    {...props}
  >
    <path d="M5 0a2 2 0 0 0-2 2v1H1.5A1.5 1.5 0 0 0 0 4.5v7A1.5 1.5 0 0 0 1.5 13H3v1.5A1.5 1.5 0 0 0 4.5 16h7a1.5 1.5 0 0 0 1.5-1.5V13h1.5a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 14.5 3H13V2a2 2 0 0 0-2-2H5zm1 3h4v2H6V3zm-1 0v2H3V4.5a.5.5 0 0 1 .5-.5H5V3zm7 0v2h2v-.5a.5.5 0 0 0-.5-.5H11zM3 6h10v5.5a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5V6zm1 6.5h1v1H4v-1zm7 0h1v1h-1v-1z"/>
    <path d="M6 8.5A1.5 1.5 0 0 1 7.5 7h1A1.5 1.5 0 0 1 10 8.5v1A1.5 1.5 0 0 1 8.5 11h-1A1.5 1.5 0 0 1 6 9.5v-1zM7 8.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5z"/>
  </svg>
);

// Fallback icon mapping
export const fallbackIcons = {
  'train-front-fill': TrainFrontFillIcon,
  'train-lightrail-front-fill': TrainLightrailFrontFillIcon,
  'bus-front-fill': BusFrontFillIcon,
  'truck-front-fill': TruckFrontFillIcon
};
