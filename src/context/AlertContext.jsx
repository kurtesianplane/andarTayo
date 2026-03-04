import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// removed static alerts import
import { fetchAutoAlerts } from '../services/autoAlerts';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]); // auto only now
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loadingAuto, setLoadingAuto] = useState(false);
  const [lastAutoFetch, setLastAutoFetch] = useState(null);
  const [autoError, setAutoError] = useState(null);

  const refreshAutoAlerts = useCallback(async () => {
    setLoadingAuto(true);
    setAutoError(null);
    try {
      const controller = new AbortController();
      const autoList = await fetchAutoAlerts({ signal: controller.signal });
      setAlerts(autoList);
      setLastAutoFetch(new Date().toISOString());
    } catch (e) {
      setAutoError(e.message || 'Auto alerts fetch failed');
    } finally {
      setLoadingAuto(false);
    }
  }, []);

  useEffect(() => {
    refreshAutoAlerts();
    const id = setInterval(refreshAutoAlerts, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshAutoAlerts]);

  useEffect(() => {
    const now = new Date();
    setActiveAlerts(alerts.filter(alert => {
      const startDate = new Date(alert.start_date);
      const endDate = new Date(alert.end_date);
      return now >= startDate && now <= endDate;
    }));
  }, [alerts]);

  const isStopDisabled = (stopId) => activeAlerts.some(alert => alert.disable_stops && alert.affected_stops.includes(stopId));
  const getStopAlerts = (stopId) => activeAlerts.filter(alert => alert.affected_stops.includes(stopId));

  const value = {
    alerts,
    activeAlerts,
    isStopDisabled,
    getStopAlerts,
    refreshAutoAlerts,
    loadingAuto,
    lastAutoFetch,
    autoError
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};
