import React from 'react';
import PropTypes from 'prop-types';

// todo: install and import these icons from @heroicons/react/24/outline:
// import { TrainIcon, TruckIcon, BuildingStorefrontIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function StopConnections({ connections }) {
  if (!connections) return null;

  const { rail, terminal, mall, future_rail, bus_rapid_transit, bus_terminals, jeepney_routes } = connections;

  const hasConnections = rail || terminal || mall || future_rail || bus_rapid_transit || bus_terminals || jeepney_routes;
  if (!hasConnections) return null;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-3 space-y-3">      {rail && (
        <div className="flex items-start gap-2">
          {/* todo: replace with <TrainIcon className="w-5 h-5 text-ph-blue-500 dark:text-ph-blue-400 shrink-0 mt-0.5" /> */}
          <span className="w-5 h-5 inline-flex items-center justify-center text-ph-blue-500 dark:text-ph-blue-400">🚂</span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Rail Connections
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {rail.map((connection, index) => {
                const displayText = typeof connection === 'string' ? connection : connection.line;
                const walkingTime = typeof connection === 'object' ? connection.walking_time : null;
                const stationName = typeof connection === 'object' ? connection.station : null;
                
                return (
                  <span
                    key={typeof connection === 'string' ? connection : `${connection.line}-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-ph-blue-50 dark:bg-ph-blue-500/10 text-ph-blue-600 dark:text-ph-blue-400"
                    title={stationName ? `${stationName}${walkingTime ? ` (${walkingTime} min walk)` : ''}` : displayText}
                  >
                    {displayText}
                    {walkingTime && (
                      <span className="ml-1 text-xs opacity-75">
                        ({walkingTime}min)
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {future_rail && (
        <div className="flex items-start gap-2">
          {/* todo: replace with <ClockIcon className="w-5 h-5 text-ph-yellow-500 dark:text-ph-yellow-400 shrink-0 mt-0.5" /> */}
          <span className="w-5 h-5 inline-flex items-center justify-center text-ph-yellow-500 dark:text-ph-yellow-400">⏳</span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Future Rail Connections
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {future_rail.map((line) => (
                <span
                  key={line}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-ph-yellow-50 dark:bg-ph-yellow-500/10 text-ph-yellow-600 dark:text-ph-yellow-400"
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {terminal && (
        <div className="flex items-start gap-2">
          {/* todo: replace with <TruckIcon className="w-5 h-5 text-ph-green-500 dark:text-ph-green-400 shrink-0 mt-0.5" /> */}
          <span className="w-5 h-5 inline-flex items-center justify-center text-ph-green-500 dark:text-ph-green-400">🚌</span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Bus Terminal
            </p>
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
              {terminal}
            </p>
          </div>
        </div>
      )}

      {mall && (
        <div className="flex items-start gap-2">
          {/* todo: replace with <BuildingStorefrontIcon className="w-5 h-5 text-ph-purple-500 dark:text-ph-purple-400 shrink-0 mt-0.5" /> */}
          <span className="w-5 h-5 inline-flex items-center justify-center text-ph-purple-500 dark:text-ph-purple-400">🏬</span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Mall Access
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {Array.isArray(mall) ? (
                mall.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-ph-purple-50 dark:bg-ph-purple-500/10 text-ph-purple-600 dark:text-ph-purple-300"
                  >
                    {m}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-ph-purple-50 dark:bg-ph-purple-500/10 text-ph-purple-600 dark:text-ph-purple-300">
                  {mall}
                </span>
              )}
            </div>          </div>
        </div>
      )}      {bus_rapid_transit && (
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 inline-flex items-center justify-center text-red-500 dark:text-red-400">🚍</span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Bus Rapid Transit
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {bus_rapid_transit.map((brt, index) => {
                const displayText = typeof brt === 'string' ? brt : brt.system;
                const stopName = typeof brt === 'object' ? brt.stop : null;
                const walkingTime = typeof brt === 'object' ? brt.walking_time : null;
                
                return (
                  <span
                    key={typeof brt === 'string' ? brt : `brt-${index}`}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                    title={stopName ? `${stopName}${walkingTime ? ` (${walkingTime} min walk)` : ''}` : displayText}
                  >
                    {displayText}
                    {walkingTime && (
                      <span className="ml-1 text-xs opacity-75">
                        ({walkingTime}min)
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {bus_terminals && (
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 inline-flex items-center justify-center text-green-500 dark:text-green-400">🚌</span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Bus Terminals
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {bus_terminals.map((terminal, index) => (
                <span
                  key={`terminal-${index}`}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  {terminal}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {jeepney_routes && (
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 inline-flex items-center justify-center text-yellow-500 dark:text-yellow-400">🚐</span>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Jeepney Routes
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {jeepney_routes.map((route, index) => (
                <span
                  key={`jeepney-${index}`}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                >
                  {route}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

StopConnections.propTypes = {
  connections: PropTypes.shape({
    rail: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          line: PropTypes.string.isRequired,
          station: PropTypes.string,
          connection_type: PropTypes.string,
          walking_time: PropTypes.number
        })
      ])
    ),
    terminal: PropTypes.string,
    mall: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    future_rail: PropTypes.arrayOf(PropTypes.string),    bus_rapid_transit: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          system: PropTypes.string,
          stop: PropTypes.string,
          connection_type: PropTypes.string,
          walking_time: PropTypes.number
        })
      ])
    ),
    bus_terminals: PropTypes.arrayOf(PropTypes.string),
    jeepney_routes: PropTypes.arrayOf(PropTypes.string)
  })
};