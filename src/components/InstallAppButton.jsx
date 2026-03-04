import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DownloadIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    };

    setIsIOS(checkIOS());

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (checkIOS() && !window.navigator.standalone) {
      setShowInstallButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert('To install this app on your iOS device:\n\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" to confirm');
    }
  };

  if (!showInstallButton) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="transit-card-flat"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-lrt1/10 flex items-center justify-center">
          <DownloadIcon className="w-6 h-6 text-lrt1" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-zinc-900 dark:text-white text-sm">
            Install andarTayo!
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Faster access & offline support
          </p>
        </div>
        <motion.button
          onClick={handleInstallClick}
          className="px-4 py-2 rounded-xl bg-lrt1 text-white font-medium text-sm"
          whileTap={{ scale: 0.95 }}
        >
          {isIOS ? 'Add' : 'Install'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default InstallAppButton;
