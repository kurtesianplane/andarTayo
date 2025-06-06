import React, { useState } from 'react';
import { 
  NoSymbolIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { usePWA } from '../../hooks/usePWA';
import MobileInstallInstructions from './MobileInstallInstructions';

const PWAStatusIndicator = ({ className = '' }) => {
  const { isOnline, isInstalled, canInstall, installPWA } = usePWA();
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleInstallClick = async () => {
    if (isMobile()) {
      setShowMobileInstructions(true);
    }
  };

  const shouldShowStatus = !isOnline || (isMobile() && (isInstalled || canInstall));

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
