import { useState, useEffect, useCallback } from 'react';

const PWA_INSTALL_STATES = {
  UNKNOWN: 'unknown',
  AVAILABLE: 'available', 
  INSTALLED: 'installed',
  NOT_SUPPORTED: 'not_supported'
};

const ENGAGEMENT_EVENTS = {
  ROUTE_PLANNED: 'route_planned',
  TRANSPORT_VIEWED: 'transport_viewed', 
  REPEAT_VISIT: 'repeat_visit',
  EXTENDED_SESSION: 'extended_session'
};

export const usePWA = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installState, setInstallState] = useState(PWA_INSTALL_STATES.UNKNOWN);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [userEngagement, setUserEngagement] = useState({
    routesPlanned: 0,
    transportsViewed: new Set(),
    sessionStart: Date.now(),
    visitCount: 0
  });
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setInstallState(PWA_INSTALL_STATES.INSTALLED);
      return;
    }

    const savedEngagement = localStorage.getItem('andartayo-engagement');
    if (savedEngagement) {
      try {
        const parsed = JSON.parse(savedEngagement);
        setUserEngagement(prev => ({
          ...prev,
          ...parsed,
          sessionStart: Date.now(),
          visitCount: (parsed.visitCount || 0) + 1,
          transportsViewed: new Set(parsed.transportsViewed || [])
        }));
      } catch (error) {
        console.warn('Failed to load engagement data:', error);
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallState(PWA_INSTALL_STATES.AVAILABLE);
    };

    const handleAppInstalled = () => {
      setInstallState(PWA_INSTALL_STATES.INSTALLED);
      setInstallPrompt(null);
      setShowInstallPrompt(false);
      
      trackEngagement(ENGAGEMENT_EVENTS.APP_INSTALLED);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const saveEngagement = () => {
      const dataToSave = {
        ...userEngagement,
        transportsViewed: Array.from(userEngagement.transportsViewed)
      };
      localStorage.setItem('andartayo-engagement', JSON.stringify(dataToSave));
    };

    const interval = setInterval(saveEngagement, 30000);
    window.addEventListener('beforeunload', saveEngagement);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', saveEngagement);
      saveEngagement();
    };
  }, [userEngagement]);
  const trackEngagement = useCallback((event, data = {}) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    setUserEngagement(prev => {
      const updated = { ...prev };
      
      switch (event) {
        case ENGAGEMENT_EVENTS.ROUTE_PLANNED:
          updated.routesPlanned += 1;
          break;
        case ENGAGEMENT_EVENTS.TRANSPORT_VIEWED:
          if (data.transport) {
            updated.transportsViewed.add(data.transport);
          }
          break;
      }
      
      return updated;
    });

    checkContextualPrompt(event);
  }, [userEngagement]);

  const checkContextualPrompt = useCallback((triggerEvent) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile || installState !== PWA_INSTALL_STATES.AVAILABLE || showInstallPrompt) {
      return;
    }

    const { routesPlanned, transportsViewed, visitCount, sessionStart } = userEngagement;
    const sessionDuration = Date.now() - sessionStart;

    const shouldShow = (
      (triggerEvent === ENGAGEMENT_EVENTS.ROUTE_PLANNED && routesPlanned >= 2) ||
      (triggerEvent === ENGAGEMENT_EVENTS.TRANSPORT_VIEWED && transportsViewed.size >= 2) ||
      (visitCount >= 3 && routesPlanned > 0) ||
      (sessionDuration > 300000 && routesPlanned > 0)
    );

    if (shouldShow) {
      setTimeout(() => setShowInstallPrompt(true), 1500);
    }
  }, [installState, showInstallPrompt, userEngagement]);

  const installPWA = useCallback(async () => {
    if (!installPrompt) return false;

    try {
      const result = await installPrompt.prompt();
      const outcome = await result.userChoice;
      
      if (outcome === 'accepted') {
        setInstallState(PWA_INSTALL_STATES.INSTALLED);
        trackEngagement('app_installed');
      }
      
      setInstallPrompt(null);
      setShowInstallPrompt(false);
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Failed to install PWA:', error);
      return false;
    }
  }, [installPrompt, trackEngagement]);

  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);

    sessionStorage.setItem('install-prompt-dismissed', 'true');
  }, []);

  const isPWASupported = 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;

  return {
    installState,
    canInstall: installState === PWA_INSTALL_STATES.AVAILABLE,
    isInstalled: installState === PWA_INSTALL_STATES.INSTALLED,

    installPWA,
    showInstallPrompt,
    dismissInstallPrompt,

    trackEngagement,
    userEngagement: {
      ...userEngagement,
      transportsViewed: Array.from(userEngagement.transportsViewed)
    },

    isOnline,
    isPWASupported,

    ENGAGEMENT_EVENTS,
    PWA_INSTALL_STATES
  };
};

export default usePWA;
