import React, { createContext, useContext, useState, useEffect } from 'react';
import alertsData from '../data/alerts.json';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    // Load alerts from JSON data
    setAlerts(alertsData.alerts);
  }, []);  useEffect(() => {
    // Filter active alerts based on current date
    const now = new Date();
    const active = alerts.filter(alert => {
      const startDate = new Date(alert.start_date);
      const endDate = new Date(alert.end_date);
      return now >= startDate && now <= endDate;
    });
    setActiveAlerts(active);
  }, [alerts]);

  const isStopDisabled = (stopId) => {
    return activeAlerts.some(alert => 
      alert.disable_stops && 
      alert.affected_stops.includes(stopId)
    );
  };

  const getStopAlerts = (stopId) => {
    return activeAlerts.filter(alert => 
      alert.affected_stops.includes(stopId)
    );
  };  const updateAlerts = (newAlerts) => {
    setAlerts(newAlerts);
  };

  const value = {
    alerts,
    activeAlerts,
    isStopDisabled,
    getStopAlerts,
    updateAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};
