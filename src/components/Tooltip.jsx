import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [portalContainer, setPortalContainer] = useState(null);
  const triggerRef = useRef(null);
  
  useEffect(() => {
    // Create portal container if it doesn't exist
    let portalRoot = document.getElementById('tooltip-portal');
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'tooltip-portal';
      portalRoot.style.position = 'fixed';
      portalRoot.style.top = '0';
      portalRoot.style.left = '0';
      portalRoot.style.width = '100%';
      portalRoot.style.height = '100%';
      portalRoot.style.pointerEvents = 'none';
      portalRoot.style.zIndex = '9999';
      document.body.appendChild(portalRoot);
    }
    setPortalContainer(portalRoot);
    
    return () => {
      // Cleanup on unmount
      if (portalRoot && portalRoot.childNodes.length === 0 && portalRoot.parentNode) {
        portalRoot.parentNode.removeChild(portalRoot);
      }
    };
  }, []);

  const updateTooltipPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      
      // Calculate position - center of screen
      setPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    }
  };

  const handleMouseEnter = () => {
    updateTooltipPosition();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
        {portalContainer && createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed max-w-xs w-72 p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-700 dark:text-neutral-300 pointer-events-auto z-[9999]"
              style={{ 
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>,
        portalContainer
      )}
    </>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.node.isRequired,
};

export default Tooltip;
