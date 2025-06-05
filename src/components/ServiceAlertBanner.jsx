import React from 'react';
import stopsData from '../transport/edsa-carousel/data/stops.json';

export default function ServiceAlertBanner({ alerts, expanded = false }) {
  const activeAlerts = alerts || [];

  if (activeAlerts.length === 0) return null;

  // Create a mapping of stop IDs to stop names
  const stopIdToName = stopsData.reduce((acc, stop) => {
    acc[stop.stop_id] = stop.name;
    return acc;
  }, {});

  const getAlertTypeConfig = (alert) => {
    switch (alert.type) {
      case 'closure':
        return {
          emoji: '🚫',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500',
          textColor: 'text-red-700 dark:text-red-300',
          accentColor: 'text-red-500'
        };
      case 'delay':
        return {
          emoji: '⚠️',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500',
          textColor: 'text-purple-700 dark:text-purple-300',
          accentColor: 'text-purple-500'
        };
      case 'construction':
        return {
          emoji: '🚧',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-700 dark:text-orange-300',
          accentColor: 'text-orange-500'
        };
      default:
        return {
          emoji: '⚠️',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500',
          textColor: 'text-gray-700 dark:text-gray-300',
          accentColor: 'text-gray-500'
        };
    }
  };
    return (
    <div className="space-y-2">
      {activeAlerts.map(alert => {
        const config = getAlertTypeConfig(alert);
        return (
          <div 
            key={alert.id}
            className={`${config.bgColor} ${config.borderColor} border-l-4 rounded-lg p-3 shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-lg">
                {config.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-semibold ${config.textColor}`}>
                    {alert.title}
                  </h3>
                  <div className={`text-xs ${config.accentColor} flex items-center gap-1`}>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      {new Date(alert.start_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {alert.end_date && (
                        <>
                          {' - '}
                          {new Date(alert.end_date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <p className={`text-sm ${config.textColor} opacity-90 mb-2`}>
                  {alert.message}
                </p>
                
                {alert.affected_stops && alert.affected_stops.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {alert.affected_stops.slice(0, 3).map((stopId) => (
                      <span
                        key={stopId}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.accentColor} bg-current/10`}
                      >
                        {stopIdToName[stopId] || stopId}
                      </span>
                    ))}
                    {alert.affected_stops.length > 3 && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.accentColor} bg-current/10`}>
                        +{alert.affected_stops.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}