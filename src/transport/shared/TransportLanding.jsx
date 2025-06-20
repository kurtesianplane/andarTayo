import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TruckIcon, InformationCircleIcon, MapPinIcon, BellIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import BootstrapIcon from '../../components/shared/BootstrapIcon';
import AlertCard from '../../components/AlertCard';
import andarTayoLogo from '../../assets/andarTayo_logo.svg';
import { useAlerts } from '../../context/AlertContext';
import { useDarkMode } from '../../context/DarkModeContext';
import PWAStatusIndicator from '../../components/PWA/PWAStatusIndicator';

const TransportLanding = ({ onModeSelect }) => {
  const navigate = useNavigate();
  const { activeAlerts } = useAlerts();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [isNearestStopOpen, setIsNearestStopOpen] = useState(false);  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  const transportModes = [    {
      id: 'edsa-carousel',
      name: 'EDSA Carousel',
      description: 'Bus Rapid Transit System along EDSA',
      icon: <BootstrapIcon name="bus-front-fill" className="w-10 h-10" size={40} />,
      color: '#dc2626',
      stats: {
        stations: '18+ stops',
        length: '23.4 km',
        frequency: '3-5 mins'
      },
      features: ['Dedicated bus lanes', 'Low-floor, all-airconditioned', 'Specified stops with MRT-3 and LRT-1 connections'],
      available: false
    },    {
      id: 'lrt-2',
      name: 'LRT Line 2',
      description: 'Light Rail Transit from Recto to Antipolo',
      icon: <BootstrapIcon name="train-lightrail-front-fill" className="w-10 h-10" size={40} />,
      color: '#8E44AD',
      stats: {
        stations: '13 stations',
        length: '13.8 km',
        frequency: '4-8 mins'
      },
      features: ['East to west Mega Manila railway', 'Has connections with MRT-3 and LRT-1', 'The newest and most accessible line among the three'],
      available: true
    },    {
      id: 'mrt-3',
      name: 'MRT Line 3',
      description: 'Metro Rail Transit from North Avenue to Taft Avenue',
      icon: <BootstrapIcon name="train-front-fill" className="w-10 h-10" size={40} />,
      color: '#1e40af',
      stats: {
        stations: '13 stations',
        length: '16.9 km',
        frequency: '3-7 mins'
      },
      features: ['North to south Metro Manila railway', 'Passes through business districts', 'Has connections with LRT-2, EDSA Carousel, and LRT-1'],
      available: true
    },    
    {
      id: 'lrt-1',
      name: 'LRT Line 1',
      description: 'Light Rail Transit from Fernando Poe Jr. (Formerly Roosevelt) to Dr. Santos',
      icon: <BootstrapIcon name="train-lightrail-front-fill" className="w-10 h-10" size={40} />,
      color: '#16a34a',
      stats: {
        stations: '25 stations',
        length: '32.4 km',
        frequency: '3-7 mins'
      },
      features: ['Oldest line in the Philippines', 'Has connections with LRT-2, EDSA Carousel, PNR, and MRT-3', 'Runs along Manila Bay', 'Cavite Extension Phase 1 opened November 2024'],
      available: true
    }
  ];

  const handleModeClick = (mode) => {
    if (mode.available) {
      onModeSelect(mode.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-green-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.img 
                src={andarTayoLogo} 
                alt="andarTayo!" 
                className="w-16 h-16 sm:w-20 sm:h-20" 
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 bg-clip-text text-transparent">
                  andarTayo!
                </span>
              </h1>
            </div>            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your intelligent companion for Metro Manila's growing transit network
            </p>
              {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
            >
              <motion.button
                onClick={() => navigate('/about')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <InformationCircleIcon className="w-4 h-4" />
                About
              </motion.button>
                <motion.button
                onClick={() => setIsNearestStopOpen(!isNearestStopOpen)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  isNearestStopOpen
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MapPinIcon className="w-4 h-4" />
                Find Stop
              </motion.button>
              
              <motion.button
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md relative ${
                  isAlertsOpen
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <BellIcon className="w-4 h-4" />
                  {activeAlerts.length > 0 && !isAlertsOpen && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                Alerts
                {activeAlerts.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-full">
                    {activeAlerts.length}
                  </span>
                )}
              </motion.button>              
              <motion.button
                onClick={toggleDarkMode}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <SunIcon className="w-4 h-4" />
                ) : (
                  <MoonIcon className="w-4 h-4" />
                )}
                {isDarkMode ? 'Light' : 'Dark'}
              </motion.button>
                <motion.div
                className="inline-flex"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PWAStatusIndicator showInstallButton={true} />
              </motion.div>
            </motion.div>          </motion.div>
        </div>
          {/* Coming Soon for Find Stop */}
        {isNearestStopOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
          >
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg shadow-lg border border-amber-200 dark:border-amber-600 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Find Stop Feature
                </h3>
                <button
                  onClick={() => setIsNearestStopOpen(false)}
                  className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-2xl">🚧</div>
                  <div>
                    <div className="font-medium text-amber-800 dark:text-amber-200">Coming Soon</div>
                    <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      We're working on an advanced stop finder feature that will help you locate the nearest transit stops 
                      based on your current location. Stay tuned for this exciting update!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}        
        {/* Service Alerts Display */}
        <AlertCard
          isVisible={isAlertsOpen}
          onDismiss={() => setIsAlertsOpen(false)}
          alerts={activeAlerts}
        />
      </div>      {/* Transport Modes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-8 lg:mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Transit Line
          </h2>
          <p className="text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select from Metro Manila's rail and bus rapid transit systems to plan your journey
          </p>
        </motion.div>{/* Transport Mode Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {transportModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col min-h-[550px] ${
                mode.available 
                  ? 'cursor-pointer hover:-translate-y-2 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600' 
                  : 'opacity-75 cursor-not-allowed'
              }`}
              onClick={() => handleModeClick(mode)}
              whileHover={mode.available ? { y: -5 } : {}}
              style={{ '--mode-color': mode.color }}
            >
              {/* Header Section */}
              <div 
                className="relative p-4 sm:p-6"
                style={{
                  background: `linear-gradient(135deg, ${mode.color}15 0%, ${mode.color}25 100%)`
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">                    <div 
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                      style={{ backgroundColor: `${mode.color}20` }}
                    >
                      {React.cloneElement(mode.icon, { 
                        className: "w-6 h-6 sm:w-7 sm:h-7",
                        style: { color: mode.color }
                      })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                        {mode.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                  {!mode.available && (
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0">
                      Coming Soon
                    </div>
                  )}
                </div>
              </div>

              {/* Transport Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: mode.color }}>
                    {mode.stats.stations.split(' ')[0]}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {mode.stats.stations.includes('stations') ? 'Stations' : 'Stops'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: mode.color }}>
                    {mode.stats.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Length</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg lg:text-xl font-bold" style={{ color: mode.color }}>
                    {mode.stats.frequency}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Frequency</div>
                </div>
              </div>              {/* Features */}
              <div className="p-4 sm:p-6 pt-4 flex-grow">
                <ul className="space-y-2.5">
                  {mode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              {mode.available && (
                <div 
                  className="p-4 text-center text-white font-semibold group-hover:shadow-inner transition-all duration-300 flex-shrink-0"
                  style={{ backgroundColor: mode.color }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Plan Route</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>          ))}
        </div>
        
        {/* Made with Love Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 pt-8 border-t border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
            Made with 
            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            for Filipino commuters
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TransportLanding;