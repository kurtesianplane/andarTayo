import React from 'react';
import { motion } from 'framer-motion';
import andarTayoLogo from '../assets/andarTayo_logo.svg';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src={andarTayoLogo} alt="andarTayo!" className="w-16 h-16" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 bg-clip-text text-transparent">
                About andarTayo!
              </span>
            </h1>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              andarTayo! is dedicated to making public transportation in Metro Manila more accessible, 
              efficient, and user-friendly. We believe that better transit information leads to better 
              commuting experiences for everyone.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">🗺️ Smart Route Planning</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Plan optimal routes across Metro Manila's rail and BRT systems with real-time information.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">💰 Fare Calculator</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get accurate fare estimates for your journey with multiple payment method options.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">📱 Mobile-First Design</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Optimized for mobile devices with PWA support for offline functionality.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">⚡ Real-time Updates</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Stay informed with service alerts and transit information as it happens.
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transit Systems Covered</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-2xl mb-2">🚈</div>
                <h3 className="font-semibold text-green-700 dark:text-green-300">LRT-1</h3>
                <p className="text-sm text-green-600 dark:text-green-400">25 stations</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-2xl mb-2">🚇</div>
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">LRT-2</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">13 stations</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-2xl mb-2">🚊</div>
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">MRT-3</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">13 stations</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div className="text-2xl mb-2">🚌</div>
                <h3 className="font-semibold text-red-700 dark:text-red-300">EDSA Carousel</h3>
                <p className="text-sm text-red-600 dark:text-red-400">Coming Soon</p>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Technology Stack</h2>
            <div className="flex flex-wrap gap-3">
              {['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'React Router', 'PWA'].map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-500 dark:text-gray-400">
              Made with ❤️ for Filipino commuters
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
