import React, { useState } from 'react';
import PropTypes from 'prop-types';
import MobileNav from './MobileNav';
import { useAlerts } from '../context/AlertContext';

const TransportPageWrapper = ({ 
  children, 
  isDarkMode, 
  onToggleDarkMode, 
  onFindNearestStop,
  onShowAlerts 
}) => {
  const [activeTab, setActiveTab] = useState('planner');
  const { activeAlerts } = useAlerts();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    if (tabId === 'alerts' && onShowAlerts) {
      onShowAlerts();
    }
  };

  return (
    <div className="pb-16 lg:pb-0">
      {children}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        activeAlertsCount={activeAlerts.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        onFindNearestStop={onFindNearestStop}
      />
    </div>
  );
};

TransportPageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  onToggleDarkMode: PropTypes.func.isRequired,
  onFindNearestStop: PropTypes.func.isRequired,
  onShowAlerts: PropTypes.func,
};

export default TransportPageWrapper;
