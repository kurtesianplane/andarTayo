import React, { useState } from 'react';
import { 
  NoSymbolIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { usePWA } from '../../hooks/usePWA';
import MobileInstallInstructions from './MobileInstallInstructions';

const PWAStatusIndicator = ({ className = '', showInstallButton = false }) => {
  const { isOnline, isInstalled, canInstall, installPWA } = usePWA();
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleInstallClick = async () => {
    if (isMobile()) {
      setShowMobileInstructions(true);
    } else if (canInstall) {
      try {
        await installPWA();
      } catch (error) {
        console.error('Installation failed:', error);
      }
    }
  };

  const shouldShowStatus = !isOnline || (isMobile() && (isInstalled || canInstall));

  // Show install button on mobile homepage if requested
  if (showInstallButton && isMobile() && !isInstalled && canInstall) {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Install App
        </button>
        <MobileInstallInstructions
          isVisible={showMobileInstructions}
          onDismiss={() => setShowMobileInstructions(false)}
        />
      </>
    );
  }

  if (!shouldShowStatus) {
    return null;
  }

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        {!isOnline && (
          <>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <NoSymbolIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Offline</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <span className="hidden sm:inline">Limited features</span>
            </div>
          </>
        )}

        {isMobile() && isInstalled && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircleIcon className="w-3 h-3" />
            <span className="hidden sm:inline">App Mode</span>
          </div>
        )}
        
        {isMobile() && !isInstalled && canInstall && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
            title="Install instructions"
          >
            <InformationCircleIcon className="w-3 h-3" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}
      </div>
      <MobileInstallInstructions
        isVisible={showMobileInstructions}
        onDismiss={() => setShowMobileInstructions(false)}
      />
    </>
  );
};

export default PWAStatusIndicator;
