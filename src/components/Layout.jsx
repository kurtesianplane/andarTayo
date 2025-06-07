import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SunIcon, MoonIcon, MapPinIcon, BellIcon, LockClosedIcon, HomeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import ServiceAlertBanner from '../components/ServiceAlertBanner';
import NearestStopButton from '../transport/edsa-carousel/components/NearestStopButton';
import FareInfoTooltip from '../components/FareInfoTooltip';
import { useAlerts } from '../context/AlertContext';
import { scrollToTopInstant } from '../utils/scrollUtils';
import andarTayoLogo from '../assets/andarTayo_logo.svg';
import PWAStatusIndicator from '../components/PWA/PWAStatusIndicator';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAlerts } = useAlerts();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNearestStopOpen, setIsNearestStopOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isFareInfoVisible, setIsFareInfoVisible] = useState(false);  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    scrollToTopInstant();
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNearestStopFound = (stop, distance) => {
    try {
      setIsNearestStopOpen(false);
      alert(`Nearest stop is ${stop.name} (${distance}km away)`);
    } catch (err) {
      console.error('Error in handleNearestStopFound:', err);
    }
  };

  const isHomePage = location.pathname === '/';

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-16 lg:pb-0 font-sans antialiased ${isDarkMode ? 'dark' : ''}`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg',
        }}
      />
      
      <FareInfoTooltip isVisible={isFareInfoVisible} setIsVisible={setIsFareInfoVisible} />
      
      {!isHomePage && (
        <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10">
          <nav className="px-4 h-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img src={andarTayoLogo} alt="andarTayo!" className="w-6 h-6" />
                <h1 className="text-base font-semibold andartayo-brand">
                  andarTayo!
                </h1>
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex space-x-1">
                <button
                  onClick={() => navigate('/')}
                  className="px-2.5 py-1 text-sm rounded-md transition-colors flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <HomeIcon className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="px-2.5 py-1 text-sm rounded-md transition-colors flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                  About
                </button>
                <button
                  onClick={() => setIsNearestStopOpen(!isNearestStopOpen)}
                  className={`px-2.5 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                    isNearestStopOpen
                    ? 'bg-ph-blue-50 dark:bg-ph-blue-500/20 text-ph-blue-500 dark:text-ph-blue-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  <MapPinIcon className="w-4 h-4" />
                  Find Stop
                </button>
                <button
                  onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                  className={`px-2.5 py-1 text-sm rounded-md transition-colors flex items-center gap-1 relative ${
                    isAlertsOpen
                    ? 'bg-ph-blue-50 dark:bg-ph-blue-500/20 text-ph-blue-500 dark:text-ph-blue-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
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
                </button>
              </div>
              <button
                onClick={() => navigate('/maintainer')}
                className="admin-button p-1 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <LockClosedIcon className="h-4 w-4" />
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-1 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                {isDarkMode ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
              </button>
              <PWAStatusIndicator />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700"
              >
                <div className="px-4 py-3 space-y-2">
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    <HomeIcon className="w-4 h-4" />
                    Home
                  </button>
                  <button
                    onClick={() => {
                      navigate('/about');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    <InformationCircleIcon className="w-4 h-4" />
                    About
                  </button>
                  <button
                    onClick={() => {
                      setIsNearestStopOpen(!isNearestStopOpen);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    <MapPinIcon className="w-4 h-4" />
                    Find Nearest Stop
                  </button>
                  <button
                    onClick={() => {
                      setIsAlertsOpen(!isAlertsOpen);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    <div className="relative">
                      <BellIcon className="w-4 h-4" />
                      {activeAlerts.length > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    Alerts {activeAlerts.length > 0 && `(${activeAlerts.length})`}
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                  >
                    {isDarkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      <AnimatePresence>
        {isNearestStopOpen && (
          <NearestStopButton 
            onStopFound={handleNearestStopFound}
            onClose={() => setIsNearestStopOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAlertsOpen && activeAlerts.length > 0 && (
          <div className="relative z-50">
            <ServiceAlertBanner alerts={activeAlerts} expanded />
          </div>
        )}
      </AnimatePresence>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
