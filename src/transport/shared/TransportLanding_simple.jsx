import React from 'react';
import { motion } from 'framer-motion';
import BootstrapIcon from '../../components/shared/BootstrapIcon';
import andarTayoLogo from '../../assets/andarTayo_logo.svg';

const TransportLanding = ({ onModeSelect }) => {
  const transportModes = [
    {
      id: 'edsa-carousel',
      name: 'EDSA Carousel',
      description: 'Bus Rapid Transit System along EDSA',
      icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h16v12H4V4zm14 2H6v8h12V6zM2 18h20v2H2v-2z" />
        <rect x="6" y="8" width="3" height="4" />
        <rect x="11" y="8" width="3" height="4" />
        <rect x="16" y="8" width="2" height="4" />
      </svg>,
      color: '#dc2626',
      stats: {
        stations: '18+ stops',
        length: '23.4 km',
        frequency: '3-5 mins'
      },
      features: ['Dedicated bus lanes', 'Low-floor, all-airconditioned', 'Specified stops with MRT-3 and LRT-1 connections'],
      available: false
    },
    {
      id: 'lrt-2',
      name: 'LRT Line 2',
      description: 'Light Rail Transit from Recto to Antipolo',
      icon: 'train-front-fill',
      color: '#8E44AD',
      stats: {
        stations: '13 stations',
        length: '13.8 km',
        frequency: '4-8 mins'
      },
      features: ['East to west Mega Manila railway', 'Has connections with MRT-3 and LRT-1', 'The newest and most accessible line among the three'],
      available: true
    },
    {
      id: 'mrt-3',
      name: 'MRT Line 3',
      description: 'Metro Rail Transit from North Avenue to Taft Avenue',
      icon: 'train-front-fill',
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
      description: 'Light Rail Transit from Roosevelt to Dr. Santos',
      icon: 'train-front-fill',
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
            </div>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your intelligent companion for Metro Manila's growing transit network
            </p>
          </motion.div>
        </div>
      </div>

      {/* Transport Modes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Transit Line
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select from Metro Manila's rail and bus rapid transit systems to plan your journey
          </p>
        </motion.div>

        {/* Transport Mode Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {transportModes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col ${
                mode.available 
                  ? 'cursor-pointer hover:-translate-y-2 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600' 
                  : 'opacity-75 cursor-not-allowed'
              }`}
              onClick={() => handleModeClick(mode)}
              whileHover={mode.available ? { y: -5 } : {}}
              style={{ '--mode-color': mode.color }}
            >
              <div 
                className="relative p-6 sm:p-8"
                style={{
                  background: `linear-gradient(135deg, ${mode.color}15 0%, ${mode.color}25 100%)`
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">                    <div 
                      className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg"
                      style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                    >
                      {typeof mode.icon === 'string' ? (
                        <BootstrapIcon name={mode.icon} className="w-8 h-8" />
                      ) : (
                        mode.icon
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {mode.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                  {!mode.available && (
                    <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                      Coming Soon
                    </div>
                  )}
                </div>
              </div>

              {/* Transport Stats */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-700/50">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: mode.color }}>
                    {mode.stats.stations.split(' ')[0]}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {mode.stats.stations.includes('stations') ? 'Stations' : 'Stops'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: mode.color }}>
                    {mode.stats.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Length</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold" style={{ color: mode.color }}>
                    {mode.stats.frequency}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Frequency</div>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 pt-0">
                <ul className="space-y-2">
                  {mode.features.slice(0, 2).map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransportLanding;
