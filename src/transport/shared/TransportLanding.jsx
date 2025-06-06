import React from 'react';
import { motion } from 'framer-motion';
import andarTayoLogo from '../../assets/andarTayo_logo.svg';

const TransportLanding = ({ onModeSelect }) => {
  const transportModes = [
    {
      id: 'edsa-carousel',
      name: 'EDSA Carousel',
      description: 'Bus Rapid Transit System along EDSA',
      icon: '🚌',
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
      icon: '🚇',
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
      icon: '🚊',
      color: '#1e40af',
      stats: {
        stations: '13 stations',
        length: '16.9 km',
        frequency: '3-7 mins'
      },      features: ['North to south Metro Manila railway', 'Passes through business districts', 'Has connections with LRT-2, EDSA Carousel, and LRT-1'],
      available: true
    },    {
      id: 'lrt-1',
      name: 'LRT Line 1',
      description: 'Light Rail Transit from Roosevelt to Dr. Santos',
      icon: '🚈',
      color: '#16a34a',
      stats: {
        stations: '25 stations',
        length: '32.4 km',
        frequency: '3-7 mins'
      },      features: ['Oldest line in the Philippines', 'Has connections with LRT-2, EDSA Carousel, PNR, and MRT-3', 'Runs along Manila Bay', 'Cavite Extension Phase 1 opened November 2024'],
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
              />              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold">
                <span className="bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 bg-clip-text text-transparent">
                  andarTayo!
                </span>
              </h1>
            </div>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your intelligent companion for Metro Manila's growing transit network
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Interactive Planning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span>Informed Commute</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                <span>Better Public Transport</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
        </motion.div>        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      style={{ backgroundColor: `${mode.color}20` }}
                    >
                      {mode.icon}
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
                    {mode.stats.frequency.split(' ')[0]}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Frequency
                  </div>
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Key Features</h4>
                <div className="space-y-3">
                  {mode.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div 
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: mode.color }}
                      >
                        ✓
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {mode.available && (
                <div 
                  className="p-6 text-center text-white font-semibold group-hover:shadow-inner transition-all duration-300 mt-auto"
                  style={{ backgroundColor: mode.color }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Plan {mode.name} Route</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <img src={andarTayoLogo} alt="andarTayo!" className="w-10 h-10" />
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">andarTayo!</h3>
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-2xl">
                  Empowering commuters with real-time transit information and intelligent route planning 
                  for Metro Manila's evolving public transportation ecosystem.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {[
                    { icon: '🗺️', title: 'Smart Planning', desc: 'AI-powered route optimization' },
                    { icon: '⏱️', title: 'Real-time Data', desc: 'Live transit updates' },
                    { icon: '💰', title: 'Fare Calculator', desc: 'Accurate cost estimation' },
                    { icon: '📱', title: 'Mobile First', desc: 'Optimized for all devices' }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-center group cursor-pointer"
                    >
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {feature.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
                  Coming Soon
                </h3>                <div className="space-y-4">
                  {[
                    { icon: '🚌', title: 'EDSA Carousel BRT', status: 'Beta Testing', color: 'blue' },
                    { icon: '📍', title: 'Nearest Stop Finder', status: 'Planning', color: 'yellow' },
                    { icon: '🔄', title: 'Multi-modal Routing', status: 'Planning', color: 'yellow' },
                    { icon: '⚡', title: 'Real-time Arrivals', status: 'Research', color: 'purple' },
                    { icon: '📊', title: 'Crowd Analytics', status: 'Research', color: 'purple' }
                  ].map((item, index) => {
                    const colorClasses = {
                      blue: 'bg-blue-400',
                      green: 'bg-green-400', 
                      yellow: 'bg-yellow-400',
                      purple: 'bg-purple-400',
                      pink: 'bg-pink-400',
                      amber: 'bg-amber-400'
                    };
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform duration-200">
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${colorClasses[item.color]}`}></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-12 border-t border-gray-200 dark:border-gray-700">
              {[
                { label: 'Transit Lines', value: '4+', subtext: 'Rail & BRT systems' },
                { label: 'Stations Covered', value: '60+', subtext: 'Across Metro Manila' },
                { label: 'Daily Commuters', value: '2M+', subtext: 'Potential users served' },
                { label: 'Route Combinations', value: '1000+', subtext: 'Possible journeys' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="text-center group"
                >
                  <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white mt-2">
                    {stat.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.subtext}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Made with ❤️ for Filipino commuters
              </p>
              <div className="flex justify-center items-center gap-6 text-xs text-gray-400 dark:text-gray-500">
                <span>React + Vite</span>
                <span>•</span>
                <span>Tailwind CSS</span>
                <span>•</span>
                <span>Framer Motion</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TransportLanding;