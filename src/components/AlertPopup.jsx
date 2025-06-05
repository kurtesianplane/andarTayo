import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const AlertPopup = ({ isOpen, onClose, alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={onClose}
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
            <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Service Alert
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {alerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-lg border border-orange-200 dark:border-orange-800"
                  >
                    <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-2">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mb-2">
                      {alert.message}
                    </p>
                    {alert.affected_stops?.length > 0 && (
                      <p className="text-xs text-orange-500 dark:text-orange-500">
                        Affected stops: {alert.affected_stops.join(', ')}
                      </p>
                    )}
                    {alert.disable_stops && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <ExclamationTriangleIcon className="w-3 h-3" />
                        <span>This stop is currently unavailable for selection</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-ph-blue-500 dark:bg-ph-blue-600 text-white font-medium rounded-lg text-sm hover:bg-ph-blue-600 dark:hover:bg-ph-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Got it
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlertPopup;
