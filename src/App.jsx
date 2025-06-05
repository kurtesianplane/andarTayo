import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import RoutePlanner from './transport/edsa-carousel/components/RoutePlanner';
import NearestStopButton from './transport/edsa-carousel/components/NearestStopButton';
import { LRT2 } from './transport/lrt-2';
import { MRT3 } from './transport/mrt-3';
import { LRT1 } from './transport/lrt-1';
import TransportLanding from './transport/shared/TransportLanding';
import ServiceAlertBanner from './components/ServiceAlertBanner';
import MobileNav from './components/MobileNav';
import ExpandableCard from './components/ExpandableCard';
import TransportSelector from './transport/shared/TransportSelector';
import { SunIcon, MoonIcon, MapPinIcon, BellIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import AdminPanel from './components/AdminPanel';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import FareInfoTooltip from './components/FareInfoTooltip';
import { AlertProvider, useAlerts } from './context/AlertContext';
import andarTayoLogo from './assets/andarTayo_logo.svg';

// Animation configuration
const springTransition = {
  type: "spring",
  damping: 25,
  stiffness: 300,
};

function AppContent() {
  const { alerts, activeAlerts } = useAlerts();
  const [selectedFromStop, setSelectedFromStop] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('planner');
  const [selectedTransportMode, setSelectedTransportMode] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNearestStopOpen, setIsNearestStopOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminPromptOpen, setIsAdminPromptOpen] = useState(false);
  const [adminInputCode, setAdminInputCode] = useState('');
  const [adminHashedCode, setAdminHashedCode] = useState('12345');
  const [isFareInfoVisible, setIsFareInfoVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check system preference for dark mode
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

  // Handle tab changes, ensuring action buttons don't become active tabs
  const handleTabChange = (tabId) => {
    // Action buttons should not become active tabs
    if (tabId === 'nearby' || tabId === 'settings') {
      return;
    }
    setActiveTab(tabId);
  };

  const handleNearestStopFound = (stop, distance) => {
    try {
      setSelectedFromStop(stop);
      setIsNearestStopOpen(false);
      alert(`Nearest stop is ${stop.name} (${distance}km away)`);
    } catch (err) {
      console.error('Error in handleNearestStopFound:', err);
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4 font-sans">
        <div className="animate-slide-up bg-red-50 dark:bg-red-500/10 rounded-lg p-4 max-w-md mx-auto mt-8 border border-red-200 dark:border-red-800">
          <h1 className="text-red-600 dark:text-white text-sm font-medium">{error}</h1>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'route':
      case 'planner':
        return (
          <div className="max-w-7xl mx-auto">
            {!selectedTransportMode ? (
              <div className="animate-slide-up">
                <TransportLanding onModeSelect={setSelectedTransportMode} />
              </div>
            ) : (
              <>
                {/* Transport Mode Selector */}
                <div className="animate-slide-up mb-4">
                  <TransportSelector 
                    selectedMode={selectedTransportMode}
                    onModeChange={setSelectedTransportMode}
                  />
                  <button
                    onClick={() => setSelectedTransportMode(null)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    ← Back to transport modes
                  </button>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                  <div className="animate-slide-up">
                    {selectedTransportMode === 'edsa-carousel' && (
                      <RoutePlanner initialFromStop={selectedFromStop} />
                    )}
                    {selectedTransportMode === 'lrt-2' && (
                      <LRT2 />
                    )}
                    {selectedTransportMode === 'mrt-3' && (
                      <MRT3 />
                    )}
                    {selectedTransportMode === 'lrt-1' && (
                      <LRT1 />
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* About section removed */}
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-4 animate-fade-in">
            {activeAlerts.length > 0 ? (
              <ServiceAlertBanner alerts={activeAlerts} expanded />
            ) : (
              <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  No Active Alerts
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  All systems are operating normally.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
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
      
      {isAdminMode ? (
        <AdminPanel 
          onExit={() => setIsAdminMode(false)} 
          initialAdminCode={adminHashedCode}
          onAdminCodeChange={(newCode) => setAdminHashedCode(newCode)}
        />
      ) : (
        <>
          <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10 mobile-hidden-header">
            <nav className="px-4 h-12 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={andarTayoLogo} alt="andarTayo!" className="w-6 h-6" />
                <h1 className="text-base font-semibold andartayo-brand">
                  andarTayo!
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex space-x-1">
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
                  onClick={() => {
                    if (isAdminMode) {
                      setIsAdminMode(false);
                    } else {
                      setIsAdminPromptOpen(true);
                    }
                  }}
                  className={`admin-button p-1 rounded-md ${
                    isAdminMode 
                    ? 'bg-ph-blue-50 dark:bg-ph-blue-500/20 text-ph-blue-500 dark:text-ph-blue-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  } transition-colors`}
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
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mobile-hidden-header md:hidden p-1 rounded-md text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
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

            {/* Mobile Dropdown Menu */}
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
                          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                      Service Alerts
                      {activeAlerts.length > 0 && (
                        <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-full">
                          {activeAlerts.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsAdminPromptOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="admin-button w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                    >
                      <LockClosedIcon className="w-4 h-4" />
                      Admin Access
                    </button>
                    <button
                      onClick={() => {
                        toggleDarkMode();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-md transition-colors"
                    >
                      {isDarkMode ? (
                        <>
                          <SunIcon className="w-4 h-4" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <MoonIcon className="w-4 h-4" />
                          Dark Mode
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* Admin Login Modal */}
          <AnimatePresence>
            {isAdminPromptOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[9999]"
                  onClick={() => setIsAdminPromptOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={springTransition}
                  className="fixed inset-0 flex items-center justify-center z-[10000] p-4"
                >
                  <div className="w-80 max-w-[90vw] bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 p-5">
                    <div className="flex flex-col items-center text-center">
                    <div className="bg-ph-blue-100 dark:bg-ph-blue-500/20 p-3 rounded-full mb-3">
                      <LockClosedIcon className="w-6 h-6 text-ph-blue-500 dark:text-ph-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                      Admin Access
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
                      Enter your admin code to continue
                    </p>
                    
                    <div className="w-full space-y-3">
                      <div>
                        <input
                          type="text"
                          value={adminInputCode}
                          onChange={(e) => setAdminInputCode(e.target.value)}
                          placeholder="Enter admin code"
                          className="w-full px-4 py-2.5 text-center text-lg tracking-wider bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-ph-blue-500/20 focus:border-ph-blue-500 dark:focus:border-ph-blue-400 transition-colors"
                          autoFocus
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => setIsAdminPromptOpen(false)}
                          className="flex-1 py-2.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-lg text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            if (adminInputCode === adminHashedCode) {
                              setIsAdminMode(true);
                              setIsAdminPromptOpen(false);
                              setAdminInputCode('');
                            } else {
                              toast.error('Invalid admin code');
                            }
                          }}
                          className="flex-1 py-2.5 bg-ph-blue-500 dark:bg-ph-blue-600 text-white font-medium rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!adminInputCode.trim()}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Login
                        </motion.button>
                      </div>
                    </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Service Alert Banner - Only visible when alerts panel is open */}
          {isAlertsOpen && activeAlerts.length > 0 && (
            <div className="px-4 animate-fade-in">
              <ServiceAlertBanner alerts={activeAlerts} />
            </div>
          )}

          <main className="px-4 pt-4">
            {renderContent()}
          </main>

          {/* Mobile Navigation */}
          <MobileNav 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            activeAlertsCount={activeAlerts.length}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onFindNearestStop={() => setIsNearestStopOpen(!isNearestStopOpen)}
          />

          {/* Mobile Alerts Modal */}
          <AnimatePresence>
            {isAlertsOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[9999]"
                  onClick={() => setIsAlertsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={springTransition}
                  className="lg:hidden fixed inset-x-0 bottom-0 bg-white dark:bg-neutral-800 rounded-t-xl shadow-2xl border-t border-neutral-200 dark:border-neutral-700 p-4 z-[10000] max-h-[80vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Service Alerts {activeAlerts.length > 0 && `(${activeAlerts.length})`}
                    </h3>
                    <button
                      onClick={() => setIsAlertsOpen(false)}
                      className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {activeAlerts.length > 0 ? (
                    <ServiceAlertBanner alerts={activeAlerts} expanded />
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">✅</div>
                      <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                        No Active Alerts
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        All systems are operating normally.
                      </p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Mobile Nearest Stop Modal */}
          <AnimatePresence>
            {isNearestStopOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[9999]"
                  onClick={() => setIsNearestStopOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={springTransition}
                  className="lg:hidden fixed inset-x-0 bottom-0 bg-white dark:bg-neutral-800 rounded-t-xl shadow-2xl border-t border-neutral-200 dark:border-neutral-700 p-4 z-[10000]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      Find Nearest Stop
                    </h3>
                    <button
                      onClick={() => setIsNearestStopOpen(false)}
                      className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <svg className="w-6 h-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <NearestStopButton onStopFound={handleNearestStopFound} />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <AlertProvider>
      <AppContent />
    </AlertProvider>
  );
}

export default App;
