import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Filter, AlertTriangle, Info, AlertCircle, Bell, Download } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { usePWA } from '../hooks/usePWA';

const AlertsPage = () => {
  const { activeAlerts, refreshAutoAlerts, loadingAuto, lastAutoFetch, autoError } = useAlerts();
  const { isStandalone, isInstallable, handleInstall } = usePWA();
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterLine, setFilterLine] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAlerts = activeAlerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    const lineMatch = filterLine === 'all' || (alert.affected_lines && alert.affected_lines.includes(filterLine));
    return severityMatch && lineMatch;
  });

  const severityConfig = {
    high: { 
      bg: 'bg-red-50 dark:bg-red-900/20', 
      border: 'border-red-200 dark:border-red-800/50', 
      text: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400',
      Icon: AlertTriangle
    },
    medium: { 
      bg: 'bg-amber-50 dark:bg-amber-900/20', 
      border: 'border-amber-200 dark:border-amber-800/50', 
      text: 'text-amber-700 dark:text-amber-300',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400',
      Icon: AlertCircle
    },
    low: { 
      bg: 'bg-blue-50 dark:bg-blue-900/20', 
      border: 'border-blue-200 dark:border-blue-800/50', 
      text: 'text-blue-700 dark:text-blue-300',
      badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',
      Icon: Info
    },
    default: { 
      bg: 'bg-zinc-50 dark:bg-zinc-800', 
      border: 'border-zinc-200 dark:border-zinc-700', 
      text: 'text-zinc-700 dark:text-zinc-300',
      badge: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400',
      Icon: Bell
    }
  };

  const lineConfig = {
    'lrt-1': { name: 'LRT-1', color: 'bg-lrt1' },
    'lrt-2': { name: 'LRT-2', color: 'bg-lrt2' },
    'mrt-3': { name: 'MRT-3', color: 'bg-mrt3' },
    'edsa-carousel': { name: 'EDSA Carousel', color: 'bg-carousel' }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 lg:pt-8 lg:pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white">
                Service Alerts
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                Live transit advisories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary p-2.5 ${showFilters ? 'bg-mrt3/10 text-mrt3' : ''}`}
              >
                <Filter className="w-5 h-5" />
              </button>
              <button
                onClick={refreshAutoAlerts}
                disabled={loadingAuto}
                className="btn-secondary p-2.5"
              >
                <RefreshCw className={`w-5 h-5 ${loadingAuto ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-5">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="transit-card"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Severity
                    </label>
                    <select
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value)}
                      className="station-select text-sm"
                    >
                      <option value="all">All</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Line
                    </label>
                    <select
                      value={filterLine}
                      onChange={(e) => setFilterLine(e.target.value)}
                      className="station-select text-sm"
                    >
                      <option value="all">All Lines</option>
                      <option value="lrt-1">LRT-1</option>
                      <option value="lrt-2">LRT-2</option>
                      <option value="mrt-3">MRT-3</option>
                      <option value="edsa-carousel">EDSA Carousel</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status bar */}
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>
              {lastAutoFetch ? `Updated ${formatDate(lastAutoFetch)}` : 'Fetching...'}
            </span>
            <span>{filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}</span>
          </div>

          {autoError && (
            <div className="alert-banner alert-error">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{autoError}</span>
            </div>
          )}

          {/* Alerts List */}
          <AnimatePresence mode="popLayout">
            {filteredAlerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="transit-card text-center py-12"
              >
                <div className="text-5xl mb-4">✨</div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  All clear
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No active alerts right now
                </p>
              </motion.div>
            ) : (
              filteredAlerts.map((alert, index) => {
                const config = severityConfig[alert.severity] || severityConfig.default;
                const IconComponent = config.Icon;
                
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    className={`${config.bg} ${config.border} border rounded-2xl p-5`}
                  >
                    <div className="flex items-start gap-4">
                      <IconComponent className={`w-6 h-6 ${config.text} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className={`font-semibold ${config.text}`}>
                            {alert.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.badge}`}>
                            {alert.severity}
                          </span>
                        </div>

                        {/* Description */}
                        {alert.description && (
                          <p className={`text-sm leading-relaxed mb-3 ${config.text} opacity-90`}>
                            {alert.description}
                          </p>
                        )}

                        {/* Affected Lines */}
                        {alert.affected_lines?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {alert.affected_lines.map(line => {
                              const lc = lineConfig[line];
                              return (
                                <span 
                                  key={line} 
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium bg-white/80 dark:bg-zinc-800/80`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${lc?.color || 'bg-zinc-400'}`} />
                                  {lc?.name || line}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs opacity-70">
                          <span className={config.text}>
                            Until {formatDate(alert.end_date)}
                          </span>
                          {alert.disable_stops && (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Stations affected</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 pt-4">
            Auto-refreshes every 5 minutes
          </p>

          {/* Install App Banner */}
          {!isStandalone && isInstallable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-mrt3 hover:bg-mrt3/90 text-white rounded-xl font-medium transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Install andarTayo! App</span>
              </button>
              <p className="text-center text-xs text-zinc-400 mt-2">
                Add to home screen for quick access
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
