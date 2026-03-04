import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Train, 
  Bus, 
  ArrowUpDown, 
  Clock, 
  AlertTriangle,
  Ticket,
  CreditCard,
  Heart,
  Navigation,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { TRANSPORT_TYPES } from '../transport/shared/config/transportConfig';
import { useTransportData, useRoutePlanner } from '../transport/shared/hooks/useTransport';
import { useAlerts } from '../context/AlertContext';
import { getTrainCarSuggestion } from '../transport/shared/utils/trainCarRecommendations';

const LINES = [
  { id: TRANSPORT_TYPES.LRT1, name: 'LRT-1', shortName: 'L1', bgClass: 'bg-lrt1' },
  { id: TRANSPORT_TYPES.LRT2, name: 'LRT-2', shortName: 'L2', bgClass: 'bg-lrt2' },
  { id: TRANSPORT_TYPES.MRT3, name: 'MRT-3', shortName: 'M3', bgClass: 'bg-mrt3' },
  { id: TRANSPORT_TYPES.EDSA_CAROUSEL, name: 'Carousel', shortName: 'BRT', bgClass: 'bg-carousel', isBus: true },
];

const PAYMENT_INFO = {
  sjt: { icon: Ticket, name: 'Single Journey Ticket', shortName: 'SJT' },
  beep: { icon: CreditCard, name: 'Beep Card', shortName: 'Beep' },
  student: { icon: GraduationCap, name: 'Student (50% off)', shortName: 'Student' },
  discounted: { icon: Heart, name: 'PWD/Senior (50% off)', shortName: 'PWD' },
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } }
};

const dropdownVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 35 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.03 } }
};

const staggerItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

const pulseOnce = {
  scale: [1, 1.02, 1],
  transition: { duration: 0.2 }
};

const PlanPage = () => {
  const [transportType, setTransportType] = useState(TRANSPORT_TYPES.MRT3);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('sjt');
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(null);

  const { data: transportData, loading: dataLoading } = useTransportData(transportType);
  const { route, fare, loading: routeLoading, error: routeError, calculateRoute, clearRoute, getPaymentMethods } = useRoutePlanner(transportType);
  const { getStopAlerts, isStopDisabled } = useAlerts();

  const stations = transportData?.stations || [];
  const selectedLine = LINES.find(l => l.id === transportType);
  const isBRT = transportType === TRANSPORT_TYPES.EDSA_CAROUSEL;
  const paymentMethods = isBRT ? [] : getPaymentMethods();
  const effectivePaymentMethod = isBRT ? 'regular' : paymentMethod;

  useEffect(() => {
    setOrigin('');
    setDestination('');
    setPaymentMethod(isBRT ? 'regular' : 'sjt');
    setShowStationPicker(null);
    clearRoute();
  }, [transportType, clearRoute, isBRT]);

  useEffect(() => {
    if (origin && destination && origin !== destination) {
      const timeout = setTimeout(async () => {
        try { await calculateRoute(origin, destination, effectivePaymentMethod); } 
        catch (e) { console.error('Route error:', e); }
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [origin, destination, effectivePaymentMethod, calculateRoute]);

  const handleAutoDetect = useCallback(async () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setAutoDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let minDist = Infinity, nearest = '';
        stations.forEach((station) => {
          const lat = station.lat || station.coordinates?.lat;
          const lng = station.lng || station.coordinates?.lng;
          if (lat && lng) {
            const R = 6371;
            const dLat = (lat - latitude) * Math.PI / 180;
            const dLng = (lng - longitude) * Math.PI / 180;
            const a = Math.sin(dLat/2)**2 + Math.cos(latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng/2)**2;
            const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            if (d < minDist) { minDist = d; nearest = station.station_id || station.stop_id; }
          }
        });
        if (nearest) {
          setOrigin(nearest);
          setShowStationPicker(null);
          toast.success(minDist < 1 ? `${Math.round(minDist * 1000)}m away` : `${minDist.toFixed(1)}km away`);
        }
        setAutoDetecting(false);
      },
      () => { toast.error('Location unavailable'); setAutoDetecting(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [stations]);

  const handleStationSelect = (stationId) => {
    if (showStationPicker === 'origin') {
      setOrigin(stationId);
      // Always open destination picker after selecting origin
      setShowStationPicker('destination');
    } else {
      setDestination(stationId);
      setShowStationPicker(null);
    }
  };

  const handleSwap = () => { const temp = origin; setOrigin(destination); setDestination(temp); };
  const handleReset = () => { setOrigin(''); setDestination(''); setShowStationPicker(null); clearRoute(); };

  const getStationName = (id) => {
    const s = stations.find(s => (s.station_id || s.stop_id) === id);
    return s?.name?.replace(/ Station$/, '').replace(/\s*\(Formerly[^)]*\)/gi, '') || '';
  };

  const getStationId = (s) => s.station_id || s.stop_id;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-24 lg:pb-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 px-4 py-3"
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-1.5 justify-center">
            {LINES.map((line, i) => (
              <motion.button
                key={line.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTransportType(line.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  transportType === line.id
                    ? `${line.bgClass} text-white shadow-lg`
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                }`}
              >
                {line.isBus ? <Bus className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{line.name}</span>
                <span className="sm:hidden">{line.shortName}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Main */}
      <main className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* Station Selector */}
          <motion.div 
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            {/* Origin */}
            <motion.button
              whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              onClick={() => setShowStationPicker(showStationPicker === 'origin' ? null : 'origin')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <motion.div 
                animate={origin ? pulseOnce : {}}
                className="w-8 h-8 rounded-full bg-lrt1/10 flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 text-lrt1" />
              </motion.div>
              <div className="flex-1 text-left">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">From</div>
                <div className={`text-sm ${origin ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'}`}>
                  {origin ? getStationName(origin) : 'Select origin station'}
                </div>
              </div>
              <motion.div animate={{ rotate: showStationPicker === 'origin' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </motion.div>
            </motion.button>

            {/* Divider with swap */}
            <div className="relative flex items-center px-4">
              <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800" />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSwap}
                disabled={!origin && !destination}
                className="mx-2 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
              </motion.button>
              <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800" />
            </div>

            {/* Destination */}
            <motion.button
              whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
              onClick={() => setShowStationPicker(showStationPicker === 'destination' ? null : 'destination')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <motion.div 
                animate={destination ? pulseOnce : {}}
                className="w-8 h-8 rounded-full bg-carousel/10 flex items-center justify-center"
              >
                <MapPin className="w-4 h-4 text-carousel" />
              </motion.div>
              <div className="flex-1 text-left">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">To</div>
                <div className={`text-sm ${destination ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'}`}>
                  {destination ? getStationName(destination) : 'Select destination station'}
                </div>
              </div>
              <motion.div animate={{ rotate: showStationPicker === 'destination' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </motion.div>
            </motion.button>

            {/* Station Picker Dropdown */}
            <AnimatePresence>
              {showStationPicker && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden border-t border-zinc-100 dark:border-zinc-800"
                >
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50">
                    {/* Quick actions */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="flex gap-2 mb-2"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAutoDetect}
                        disabled={autoDetecting || dataLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {autoDetecting ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full" />
                        ) : (
                          <Navigation className="w-3.5 h-3.5" />
                        )}
                        <span>Use location</span>
                      </motion.button>
                      {(origin || destination) && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleReset}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </motion.button>
                      )}
                    </motion.div>

                    {/* Station list */}
                    <motion.div 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="max-h-48 overflow-y-auto rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                    >
                      {dataLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-mrt3 border-t-transparent rounded-full" />
                        </div>
                      ) : (
                        stations.map((station, i) => {
                          const id = getStationId(station);
                          const isSelected = (showStationPicker === 'origin' && id === origin) || (showStationPicker === 'destination' && id === destination);
                          const isOther = (showStationPicker === 'origin' && id === destination) || (showStationPicker === 'destination' && id === origin);
                          const disabled = isStopDisabled(id) || isOther;
                          
                          return (
                            <motion.button
                              key={id}
                              variants={staggerItem}
                              whileHover={!disabled ? { x: 4, backgroundColor: 'rgba(0,0,0,0.02)' } : {}}
                              whileTap={!disabled ? { scale: 0.99 } : {}}
                              onClick={() => !disabled && handleStationSelect(id)}
                              disabled={disabled}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                                disabled ? 'opacity-40 cursor-not-allowed' :
                                isSelected ? `${selectedLine?.bgClass} text-white` :
                                'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                              } ${i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                              }`}>
                                {i + 1}
                              </span>
                              <span className={isSelected ? 'font-medium' : 'text-zinc-700 dark:text-zinc-300'}>
                                {station.name?.replace(/ Station$/, '').replace(/\s*\(Formerly[^)]*\)/gi, '')}
                              </span>
                              {getStopAlerts(id).length > 0 && <span className="text-[10px]">⚠️</span>}
                            </motion.button>
                          );
                        })
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Payment Method Icons */}
          {!isBRT && paymentMethods.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2"
            >
              {paymentMethods.map((method, i) => {
                const info = PAYMENT_INFO[method.id];
                const Icon = info?.icon || CreditCard;
                return (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPaymentMethod(method.id)}
                    title={info?.name || method.name}
                    className={`relative group p-3 rounded-xl transition-all duration-200 ${
                      paymentMethod === method.id
                        ? 'bg-mrt3 text-white shadow-lg'
                        : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {info?.name || method.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {/* Results */}
          <AnimatePresence mode="wait">
            {routeLoading && (
              <motion.div
                key="loading"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 flex items-center justify-center"
              >
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-6 h-6 border-2 border-mrt3 border-t-transparent rounded-full" />
              </motion.div>
            )}

            {routeError && (
              <motion.div
                key="error"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">{routeError}</div>
              </motion.div>
            )}

            {route && !routeLoading && (
              <motion.div
                key="results"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
              >
                {/* Route summary */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`w-10 h-10 rounded-xl ${selectedLine?.bgClass} flex items-center justify-center text-white`}
                    >
                      {isBRT ? <Bus className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
                        <span className="truncate">{getStationName(origin)}</span>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}>
                          <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        </motion.div>
                        <span className="truncate">{getStationName(destination)}</span>
                      </div>
                      <div className="text-xs text-zinc-500">{route.direction}</div>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
                  {[
                    { value: `₱${typeof fare === 'number' ? Math.round(fare) : fare}`, label: isBRT ? 'Cash' : PAYMENT_INFO[paymentMethod]?.shortName || 'Fare' },
                    { value: route.estimatedTime || Math.round(route.distance * 2.5), label: 'Min' },
                    { value: route.distance, label: isBRT ? 'Stops' : 'Stns' }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className="p-4 text-center"
                    >
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Extra info */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-4 pb-4 space-y-2"
                >
                  {isBRT && (
                    <div className="text-xs text-zinc-500 text-center py-2">
                      20% discount for students, PWD, and seniors — <span className="text-zinc-700 dark:text-zinc-300 font-medium">valid everyday including weekends & holidays</span>
                    </div>
                  )}

                  {!isBRT && (
                    <div className="p-3 bg-mrt3/5 dark:bg-mrt3/10 rounded-xl">
                      <div className="flex items-start gap-2">
                        <Train className="w-4 h-4 text-mrt3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            {getTrainCarSuggestion(transportType, route.fromStation?.station_id, route.toStation?.station_id, route.direction, stations)}
                          </div>
                          <a 
                            href="https://ganmatthew.github.io/train-car-calculator" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-mrt3 hover:underline"
                          >
                            <span>Research by Matthew Gan</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {(() => {
                    const fromId = route.fromStation?.station_id || route.fromStation?.stop_id;
                    const toId = route.toStation?.station_id || route.toStation?.stop_id;
                    const alerts = [...getStopAlerts(fromId), ...getStopAlerts(toId)]
                      .filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i);
                    
                    return alerts.length > 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-700 dark:text-amber-300">
                          {alerts.map((a, i) => <div key={a.id || i}>• {a.title}</div>)}
                        </div>
                      </motion.div>
                    ) : null;
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!route && !routeLoading && !routeError && !showStationPicker && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-8 text-zinc-400 text-sm"
            >
              {!origin ? 'Tap "From" to select your starting station' : 'Tap "To" to select your destination'}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlanPage;
