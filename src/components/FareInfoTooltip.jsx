import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const springTransition = {
  type: "spring",
  damping: 30,
  stiffness: 300
};

const FareInfoTooltip = ({ isVisible, setIsVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[9999]"
            onClick={() => setIsVisible(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={springTransition}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 p-5 z-[10000]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
                Passenger Categories
              </h3>
              <motion.button
                onClick={() => setIsVisible(false)}
                className="text-neutral-400 hover:text-neutral-500 dark:text-neutral-500 dark:hover:text-neutral-400 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-800/30 rounded-full p-1.5 flex-shrink-0 text-green-700 dark:text-green-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">Regular</h4>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">Standard fare rate with no discounts</p>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-800/30 rounded-full p-1.5 flex-shrink-0 text-blue-700 dark:text-blue-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">PWD/Senior Citizen</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5">20% discount with valid ID (RA 9994, 10754)</p>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-800/30 rounded-full p-1.5 flex-shrink-0 text-purple-700 dark:text-purple-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-purple-800 dark:text-purple-300">Student/Child</h4>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">20% discount for students and children</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

FareInfoTooltip.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  setIsVisible: PropTypes.func.isRequired
};

export default FareInfoTooltip;
