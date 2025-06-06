import React, { useEffect } from 'react';
import { usePWA } from '../../hooks/usePWA';
import InstallPrompt from './InstallPrompt';

const PWAManager = ({ children }) => {
  const {
    showInstallPrompt,
    installPWA,
    dismissInstallPrompt,
    trackEngagement,
    userEngagement,
    ENGAGEMENT_EVENTS,
    isPWASupported
  } = usePWA();

  useEffect(() => {
    if ('serviceWorker' in navigator && isPWASupported) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully:', registration.scope);
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New app version available');
                }
              });
            }
          });
          
        } catch (error) {
          console.warn('Service Worker registration failed:', error);
        }
      });
    }
  }, [isPWASupported]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      console.log('PWA installed successfully');
    }
  };

  const getPromptContext = () => {
    const { routesPlanned, transportsViewed, visitCount } = userEngagement;
    
    if (routesPlanned >= 2) return 'route_success';
    if (transportsViewed.length >= 2) return 'multi_transport';
    if (visitCount >= 3) return 'repeat_visitor';
    return 'general';
  };

  return (
    <>
      {children}

      <InstallPrompt
        isVisible={showInstallPrompt}
        onInstall={handleInstall}
        onDismiss={dismissInstallPrompt}
        context={getPromptContext()}
        userEngagement={userEngagement}
      />
    </>
  );
};

export const withPWATracking = (WrappedComponent, eventType) => {
  return function PWATrackedComponent(props) {
    const { trackEngagement } = usePWA();
    
    const handleTrackEngagement = (data) => {
      if (eventType) {
        trackEngagement(eventType, data);
      }
    };

    return (
      <WrappedComponent
        {...props}
        trackPWAEngagement={handleTrackEngagement}
      />
    );
  };
};

export default PWAManager;
