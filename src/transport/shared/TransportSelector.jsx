import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

const TransportSelector = ({ selectedMode = 'edsa-carousel', onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const transportModes = [
    {
      id: 'edsa-carousel',
      name: 'EDSA Carousel',
      color: 'red',
      icon: '🚌',
      available: false,
      description: 'Bus Rapid Transit on EDSA'
    },
    {
      id: 'lrt-2',
      name: 'LRT-2',
      color: 'blue',
      icon: '🚇',
      available: true,
      description: 'Blue Line • Recto ↔ Antipolo'
    },
    {
      id: 'mrt-3',
      name: 'MRT-3',
      color: 'blue',
      icon: '🚊',
      available: true
    },    {
      id: 'lrt-1',
      name: 'LRT-1',
      color: 'green',
      icon: '🚈',
      available: true
    }
  ];

  const selectedTransport = transportModes.find(mode => mode.id === selectedMode);
  const handleModeSelect = (mode) => {
    if (mode.available) {
      onModeChange?.(mode.id);
      setIsOpen(false);
    } else {
      setShowComingSoon(true);
      setIsOpen(false);
    }
  };

  const getColorClasses = (color, isSelected = false) => {
    const colorMap = {
      red: {
        bg: isSelected ? 'bg-red-500' : 'bg-red-100 dark:bg-red-500/20',
        text: isSelected ? 'text-white' : 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-700',
        hover: 'hover:bg-red-50 dark:hover:bg-red-500/10'
      },
      blue: {
        bg: isSelected ? 'bg-blue-500' : 'bg-blue-100 dark:bg-blue-500/20',
        text: isSelected ? 'text-white' : 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-700',
        hover: 'hover:bg-blue-50 dark:hover:bg-blue-500/10'
      },
      green: {
        bg: isSelected ? 'bg-green-500' : 'bg-green-100 dark:bg-green-500/20',
        text: isSelected ? 'text-white' : 'text-green-700 dark:text-green-400',
        border: 'border-green-200 dark:border-green-700',
        hover: 'hover:bg-green-50 dark:hover:bg-green-500/10'
      },
      purple: {
        bg: isSelected ? 'bg-purple-500' : 'bg-purple-100 dark:bg-purple-500/20',
        text: isSelected ? 'text-white' : 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-700',
        hover: 'hover:bg-purple-50 dark:hover:bg-purple-500/10'
      }
    };
    return colorMap[color];
  };

  return (
    <>
      <div className="relative">        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
        >
          <span className="text-lg">{selectedTransport.icon}</span>
          <span className="font-medium text-sm hidden sm:inline">
            {selectedTransport.name}
          </span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-lg z-20 overflow-hidden"
              >
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Select Transport Mode
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  {transportModes.map((mode) => {
                    const colors = getColorClasses(mode.color, mode.id === selectedMode);
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleModeSelect(mode)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          mode.id === selectedMode 
                            ? `${colors.bg} ${colors.text}` 
                            : `${colors.bg} ${colors.text} ${colors.border} ${colors.hover}`
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{mode.icon}</span>
                          <div className="text-left">
                            <div className="font-medium text-sm">{mode.name}</div>
                            {!mode.available && (
                              <div className="text-xs opacity-70">Coming Soon</div>
                            )}
                          </div>
                        </div>
                        {mode.id === selectedMode && (
                          <div className="w-2 h-2 bg-current rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Coming Soon Popup */}
      <AnimatePresence>
        {showComingSoon && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[9999]"
              onClick={() => setShowComingSoon(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="fixed inset-0 flex items-center justify-center z-[10000] p-4"
            >
              <div className="w-full max-w-sm bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Coming Soon
                  </h3>
                  <button
                    onClick={() => setShowComingSoon(false)}
                    className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">🚧</div>
                  <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Feature in Development
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                    We're working hard to bring you support for all Metro Manila transport modes. Stay tuned for updates!
                  </p>
                  <button
                    onClick={() => setShowComingSoon(false)}
                    className="w-full py-2.5 bg-ph-blue-500 dark:bg-ph-blue-600 text-white font-medium rounded-lg text-sm hover:bg-ph-blue-600 dark:hover:bg-ph-blue-700 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransportSelector;
