import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SunIcon, MoonIcon, MapPinIcon, BellIcon, LockClosedIcon, HomeIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import ServiceAlertBanner from '../components/ServiceAlertBanner';
import FareInfoTooltip from '../components/FareInfoTooltip';
import MobileNav from '../components/MobileNav';
import AlertCard from '../components/AlertCard';
import { useAlerts } from '../context/AlertContext';
import { useDarkMode } from '../context/DarkModeContext';
import { scrollToTopInstant } from '../utils/scrollUtils';
import andarTayoLogo from '../assets/andarTayo_logo.svg';
import PWAStatusIndicator from '../components/PWA/PWAStatusIndicator';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAlerts } = useAlerts();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  const [isNearestStopOpen, setIsNearestStopOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isFareInfoVisible, setIsFareInfoVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileNavActiveTab, setMobileNavActiveTab] = useState('planner');
  // Check if current page is a transport page
  const isTransportPage = location.pathname.includes('/transport/');
  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/about';  useEffect(() => {
    scrollToTopInstant();
    setIsMobileMenuOpen(false);
    // Reset mobile nav tab when navigating to transport pages
    if (isTransportPage) {
      setMobileNavActiveTab('planner');
    }
  }, [location.pathname, isTransportPage]);

  const handleMobileNavTabChange = (tabId) => {
    setMobileNavActiveTab(tabId);
    
    if (tabId === 'alerts') {
      setIsAlertsOpen(!isAlertsOpen);
    }
  };
  const handleFindNearestStop = () => {
    setIsNearestStopOpen(!isNearestStopOpen);
  };

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-900 pb-16 lg:pb-0 font-sans antialiased ${isDarkMode ? 'dark' : ''}`}>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg',
        }}
      />
      
      <FareInfoTooltip isVisible={isFareInfoVisible} setIsVisible={setIsFareInfoVisible} />
      
      {(!isHomePage) && (
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
                </button>                <button
                  onClick={() => setIsNearestStopOpen(!isNearestStopOpen)}
                  className={`px-2.5 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                    isNearestStopOpen
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
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
            </div>            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-1 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${isTransportPage ? 'hidden' : 'block'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>          <AnimatePresence>
            {isMobileMenuOpen && !isTransportPage && (
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
                  </button>                  <button
                    onClick={() => {
                      setIsNearestStopOpen(!isNearestStopOpen);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                      isNearestStopOpen
                        ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
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
      )}      <AnimatePresence>
        {isNearestStopOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-50 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-600"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
          </motion.div>
        )}
      </AnimatePresence>      <AnimatePresence>
        {isAlertsOpen && (
          <AlertCard
            isVisible={isAlertsOpen}
            onDismiss={() => setIsAlertsOpen(false)}
            alerts={activeAlerts}
          />
        )}
      </AnimatePresence><main>
        <Outlet />
      </main>

      {/* Mobile Navigation for Transport Pages */}
      {isTransportPage && (
        <MobileNav
          activeTab={mobileNavActiveTab}
          onTabChange={handleMobileNavTabChange}
          activeAlertsCount={activeAlerts.length}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onFindNearestStop={handleFindNearestStop}
        />
      )}
    </div>
  );
};

export default Layout;
