import React from 'react';
import { motion } from 'framer-motion';
import MRT3RoutePlanner from './components/MRT3RoutePlanner';

const MRT3 = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">

      {/* header */}
      <motion.div
        className="px-4 py-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
            MRT-3 Blue Line
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Metro Rail Transit Line 3 • North Avenue ↔ Taft Avenue
          </p>
        </div>
      </motion.div>

      {/* route planner */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <MRT3RoutePlanner />
        </div>
      </div>
    </div>
  );
};

export default MRT3;
