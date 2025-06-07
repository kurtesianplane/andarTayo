import React from 'react';
import RoutePlanner from '../../transport/edsa-carousel/components/RoutePlanner';
import { motion } from 'framer-motion';

const EDSACarouselPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <motion.div
        className="px-4 py-6 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-neutral-900 dark:text-white">
            EDSA Carousel BRT
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Bus Rapid Transit • Coming Soon
          </p>
        </div>
      </motion.div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <RoutePlanner />
        </div>
      </div>
    </div>
  );
};

export default EDSACarouselPage;
