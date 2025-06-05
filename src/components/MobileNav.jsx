import React from 'react';
import PropTypes from 'prop-types';
import {
  CalculatorIcon,
  BellIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

export default function MobileNav({ 
  activeTab, 
  onTabChange, 
  activeAlertsCount, 
  isDarkMode, 
  onToggleDarkMode, 
  onFindNearestStop 
}) {
  const tabs = [
    {
      id: 'planner',
      name: 'Route',
      icon: CalculatorIcon,
    },
    {
      id: 'nearby',
      name: 'Find Stop',
      icon: MapPinIcon,
      isAction: true,
      action: onFindNearestStop
    },
    {
      id: 'alerts',
      name: 'Alerts',
      icon: BellIcon,
    },
    {
      id: 'settings',
      name: 'Theme',
      icon: isDarkMode ? SunIcon : MoonIcon,
      isAction: true,
      action: onToggleDarkMode
    },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 lg:hidden">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors
              ${activeTab === tab.id && !tab.isAction
                ? 'text-ph-blue-500 dark:text-ph-blue-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            onClick={() => {
              if (tab.isAction && tab.action) {
                tab.action();
              } else {
                onTabChange(tab.id);
              }
            }}
          >
            <div className="relative">
              <tab.icon className={`h-5 w-5 ${
                activeTab === tab.id && !tab.isAction ? 'stroke-[2px]' : 'stroke-[1.5px]'
              }`} />
              {tab.id === 'alerts' && activeAlertsCount > 0 && activeTab !== 'alerts' && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">{tab.name}</span>
              {tab.id === 'alerts' && activeAlertsCount > 0 && (
                <span className="px-1 py-0.5 text-xs font-medium bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-full min-w-[16px] text-center">
                  {activeAlertsCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}

MobileNav.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  activeAlertsCount: PropTypes.number,
  isDarkMode: PropTypes.bool.isRequired,
  onToggleDarkMode: PropTypes.func.isRequired,
  onFindNearestStop: PropTypes.func.isRequired,
};