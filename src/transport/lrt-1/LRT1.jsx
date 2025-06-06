import React from 'react';
import { motion } from 'framer-motion';
import LRT1RoutePlanner from './components/LRT1RoutePlanner';

const LRT1 = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
        
      {/* header */}
      <motion.div
        className="px-4 py-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >        <div className="max-w-7xl mx-auto">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-neutral-900 dark:text-white">
            LRT-1 Green Line
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Light Rail Transit Line 1 • Roosevelt ↔ Baclaran
          </p>
        </div>
      </motion.div>

      {/* route plan */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <LRT1RoutePlanner />
        </div>
      </div>
    </div>
  );
};

export default LRT1;