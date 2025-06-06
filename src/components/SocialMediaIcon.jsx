import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SocialMediaIcon = ({ platform, url, className = '', size = 'md' }) => {
  // Define platform-specific icons and colors
  const platformConfig = {
    facebook: {
      icon: '📘',
      name: 'Facebook',
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      borderColor: 'border-blue-200 dark:border-blue-700',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10'
    },
    twitter: {
      icon: '🐦',
      name: 'Twitter',
      bgColor: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      borderColor: 'border-sky-200 dark:border-sky-700',
      hoverBg: 'hover:bg-sky-50 dark:hover:bg-sky-500/10'
    },
    instagram: {
      icon: '📷',
      name: 'Instagram',
      bgColor: 'bg-pink-600 hover:bg-pink-700',
      textColor: 'text-white',
      borderColor: 'border-pink-200 dark:border-pink-700',
      hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-500/10'
    },
    youtube: {
      icon: '📺',
      name: 'YouTube',
      bgColor: 'bg-red-600 hover:bg-red-700',
      textColor: 'text-white',
      borderColor: 'border-red-200 dark:border-red-700',
      hoverBg: 'hover:bg-red-50 dark:hover:bg-red-500/10'
    },
    linkedin: {
      icon: '💼',
      name: 'LinkedIn',
      bgColor: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white',
      borderColor: 'border-blue-200 dark:border-blue-700',
      hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-500/10'
    },
    tiktok: {
      icon: '🎵',
      name: 'TikTok',
      bgColor: 'bg-gray-900 hover:bg-black',
      textColor: 'text-white',
      borderColor: 'border-gray-200 dark:border-gray-700',
      hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-500/10'
    },
    website: {
      icon: '🌐',
      name: 'Website',
      bgColor: 'bg-green-600 hover:bg-green-700',
      textColor: 'text-white',
      borderColor: 'border-green-200 dark:border-green-700',
      hoverBg: 'hover:bg-green-50 dark:hover:bg-green-500/10'
    },
    email: {
      icon: '📧',
      name: 'Email',
      bgColor: 'bg-gray-600 hover:bg-gray-700',
      textColor: 'text-white',
      borderColor: 'border-gray-200 dark:border-gray-700',
      hoverBg: 'hover:bg-gray-50 dark:hover:bg-gray-500/10'
    },
    phone: {
      icon: '📞',
      name: 'Phone',
      bgColor: 'bg-emerald-600 hover:bg-emerald-700',
      textColor: 'text-white',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
      hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
    }
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8 p-1.5',
      icon: 'text-sm',
      text: 'text-xs'
    },
    md: {
      button: 'w-10 h-10 p-2',
      icon: 'text-lg',
      text: 'text-sm'
    },
    lg: {
      button: 'w-12 h-12 p-2.5',
      icon: 'text-xl',
      text: 'text-base'
    }
  };

  const config = platformConfig[platform.toLowerCase()] || platformConfig.website;
  const sizes = sizeConfig[size] || sizeConfig.md;
  const handleClick = () => {
    // Handle different URL types
    let finalUrl = url;
    
    if (platform.toLowerCase() === 'email') {
      finalUrl = url.startsWith('mailto:') ? url : `mailto:${url}`;
    } else if (platform.toLowerCase() === 'phone') {
      finalUrl = url.startsWith('tel:') ? url : `tel:${url}`;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }

    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  // Get appropriate title and aria-label based on platform
  const getTitle = () => {
    switch (platform.toLowerCase()) {
      case 'email':
        return 'Send us an email';
      case 'phone':
        return 'Call us';
      default:
        return `Visit our ${config.name}`;
    }
  };

  const getAriaLabel = () => {
    switch (platform.toLowerCase()) {
      case 'email':
        return 'Send us an email';
      case 'phone':
        return 'Call us';
      default:
        return `Visit our ${config.name} page`;
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        ${sizes.button} 
        ${config.bgColor} 
        ${config.textColor}
        rounded-full
        flex items-center justify-center
        shadow-sm
        transition-all duration-200
        border border-transparent
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500
        group
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      title={getTitle()}
      aria-label={getAriaLabel()}
    >
      <span className={`${sizes.icon} select-none`}>
        {config.icon}
      </span>
    </motion.button>
  );
};

// Variant for showing with text label
export const SocialMediaIconWithLabel = ({ platform, url, className = '', size = 'md', showLabel = true }) => {
  const platformConfig = {
    facebook: {
      icon: '📘',
      name: 'Facebook',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20',
      textColor: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-700',
    },
    twitter: {
      icon: '🐦',
      name: 'Twitter',
      bgColor: 'bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20',
      textColor: 'text-sky-700 dark:text-sky-400',
      borderColor: 'border-sky-200 dark:border-sky-700',
    },
    instagram: {
      icon: '📷',
      name: 'Instagram',
      bgColor: 'bg-pink-50 dark:bg-pink-500/10 hover:bg-pink-100 dark:hover:bg-pink-500/20',
      textColor: 'text-pink-700 dark:text-pink-400',
      borderColor: 'border-pink-200 dark:border-pink-700',
    },
    youtube: {
      icon: '📺',
      name: 'YouTube',
      bgColor: 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20',
      textColor: 'text-red-700 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-700',
    },
    linkedin: {
      icon: '💼',
      name: 'LinkedIn',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20',
      textColor: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-700',
    },
    tiktok: {
      icon: '🎵',
      name: 'TikTok',
      bgColor: 'bg-gray-50 dark:bg-gray-500/10 hover:bg-gray-100 dark:hover:bg-gray-500/20',
      textColor: 'text-gray-700 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700',
    },
    website: {
      icon: '🌐',
      name: 'Website',
      bgColor: 'bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20',
      textColor: 'text-green-700 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-700',
    },
    email: {
      icon: '📧',
      name: 'Email',
      bgColor: 'bg-gray-50 dark:bg-gray-500/10 hover:bg-gray-100 dark:hover:bg-gray-500/20',
      textColor: 'text-gray-700 dark:text-gray-400',
      borderColor: 'border-gray-200 dark:border-gray-700',
    },
    phone: {
      icon: '📞',
      name: 'Phone',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
      textColor: 'text-emerald-700 dark:text-emerald-400',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
    }
  };

  const sizeConfig = {
    sm: {
      button: 'px-3 py-1.5',
      icon: 'text-sm',
      text: 'text-xs',
      gap: 'gap-1.5'
    },
    md: {
      button: 'px-4 py-2',
      icon: 'text-lg',
      text: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      button: 'px-5 py-2.5',
      icon: 'text-xl',
      text: 'text-base',
      gap: 'gap-2.5'
    }
  };

  const config = platformConfig[platform.toLowerCase()] || platformConfig.website;
  const sizes = sizeConfig[size] || sizeConfig.md;
  const handleClick = () => {
    let finalUrl = url;
    
    if (platform.toLowerCase() === 'email') {
      finalUrl = url.startsWith('mailto:') ? url : `mailto:${url}`;
    } else if (platform.toLowerCase() === 'phone') {
      finalUrl = url.startsWith('tel:') ? url : `tel:${url}`;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      finalUrl = `https://${url}`;
    }

    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  // Get appropriate title and aria-label based on platform
  const getTitle = () => {
    switch (platform.toLowerCase()) {
      case 'email':
        return 'Send us an email';
      case 'phone':
        return 'Call us';
      default:
        return `Visit our ${config.name}`;
    }
  };

  const getAriaLabel = () => {
    switch (platform.toLowerCase()) {
      case 'email':
        return 'Send us an email';
      case 'phone':
        return 'Call us';
      default:
        return `Visit our ${config.name} page`;
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        ${sizes.button}
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        rounded-lg
        border
        flex items-center ${sizes.gap}
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-blue-500
        group
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      title={getTitle()}
      aria-label={getAriaLabel()}
    >
      <span className={`${sizes.icon} select-none`}>
        {config.icon}
      </span>
      {showLabel && (
        <span className={`${sizes.text} font-medium`}>
          {config.name}
        </span>
      )}
    </motion.button>
  );
};

SocialMediaIcon.propTypes = {
  platform: PropTypes.oneOf([
    'facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 
    'tiktok', 'website', 'email', 'phone'
  ]).isRequired,
  url: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

SocialMediaIconWithLabel.propTypes = {
  platform: PropTypes.oneOf([
    'facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 
    'tiktok', 'website', 'email', 'phone'
  ]).isRequired,
  url: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool
};

export default SocialMediaIcon;
