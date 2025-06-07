import React from 'react';
import { motion } from 'framer-motion';
import andarTayoLogo from '../assets/andarTayo_logo.svg';
import { useNavigate } from 'react-router-dom';

const OfflinePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img src={andarTayoLogo} alt="andarTayo!" className="w-16 h-16 mx-auto mb-6" />
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            You're Offline
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            No internet connection detected. You can still access basic transit information 
            that's been cached on your device.
          </p>

          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Available Offline:</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Station information</li>
                <li>• Route planning</li>
                <li>• Fare calculations</li>
                <li>• Basic transit maps</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Continue to App
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Real-time alerts and updates will be available when you're back online.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default OfflinePage;
