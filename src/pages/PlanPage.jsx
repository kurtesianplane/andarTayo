import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Train, 
  Bus, 
  ArrowUpDown, 
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
  ExternalLink,
  Footprints
} from 'lucide-react';
import { TRANSPORT_TYPES, TRANSPORT_CONFIG } from '../transport/shared/config/transportConfig';
import { useTransportData, useRoutePlanner } from '../transport/shared/hooks/useTransport';
import { useMultiModalRoutePlanner, useMultiModalStations } from '../transport/shared/hooks/useMultiModalRoutePlanner';
import { useAlerts } from '../context/AlertContext';
import { getTrainCarSuggestion } from '../transport/shared/utils/trainCarRecommendations';

function formatFare(value) {
  if (value === null || value === undefined) return '₱—';
  if (typeof value !== 'number') return `${value}`;
  const rounded = Math.round(value * 100) / 100;
  return `₱${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}

function normalizeName(name = '') {
  return (name || '').replace(/\s*\(Formerly[^)]*\)/gi, '').replace(/\s+Station$/i, '').trim();
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa = s1 * s1 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

const LINES = [
  // Multi-modal is now a pseudo-line for pill rendering priority
  { id: 'multi-modal', name: 'Multi-modal', shortName: 'Multi', bgClass: 'bg-gradient-to-r from-lrt1 via-mrt3 to-carousel', isMultiModal: true },
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
  // Remove planMode state, use a single mode with pills for all options
  const [selectedPill, setSelectedPill] = useState('multi-modal');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('sjt');
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [showStationPicker, setShowStationPicker] = useState(null);
  // Multi-modal state
  const [originNodeId, setOriginNodeId] = useState('');
  const [destinationNodeId, setDestinationNodeId] = useState('');
  const [passengerType, setPassengerType] = useState('regular');
  const [routePreference, setRoutePreference] = useState('fastest');
  const [showPicker, setShowPicker] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const includeLines = useMemo(
    () => [TRANSPORT_TYPES.LRT1, TRANSPORT_TYPES.LRT2, TRANSPORT_TYPES.MRT3, TRANSPORT_TYPES.EDSA_CAROUSEL],
    [],
  );
  const { nodes, loading: nodesLoading } = useMultiModalStations(includeLines);
  const {
    route: multiRoute,
    loading: multiRouteLoading,
    error: multiRouteError,
    calculateRoute: multiCalculateRoute,
    clearRoute: multiClearRoute,
  } = useMultiModalRoutePlanner(includeLines);

  const { data: transportData, loading: dataLoading } = useTransportData(selectedPill);
  // Always call useRoutePlanner to comply with React rules
  const validSingleLine = [TRANSPORT_TYPES.LRT1, TRANSPORT_TYPES.LRT2, TRANSPORT_TYPES.MRT3, TRANSPORT_TYPES.EDSA_CAROUSEL];
  const isMultiModal = selectedPill === 'multi-modal';
  const isSingleLine = validSingleLine.includes(selectedPill);
  // Always call with a valid type, only use output if isSingleLine
  const routePlanner = useRoutePlanner(isSingleLine ? selectedPill : validSingleLine[0]);
  const route = isSingleLine ? routePlanner.route : null;
  const fare = isSingleLine ? routePlanner.fare : null;
  const routeLoading = isSingleLine ? routePlanner.loading : false;
  const routeError = isSingleLine ? routePlanner.error : null;
  const calculateRoute = isSingleLine ? routePlanner.calculateRoute : undefined;
  const clearRoute = isSingleLine ? routePlanner.clearRoute : () => {};
  const getPaymentMethods = isSingleLine ? routePlanner.getPaymentMethods : () => [];
  const { getStopAlerts, isStopDisabled } = useAlerts();

  const nodeById = useMemo(() => {
    const map = new Map();
    nodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [nodes]);
  const filteredNodes = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return nodes;
    return nodes.filter((n) => n.name.toLowerCase().includes(t) || n.lineName.toLowerCase().includes(t));
  }, [nodes, searchTerm]);

  const stations = transportData?.stations || [];
  const selectedLine = LINES.find(l => l.id === selectedPill);
  const isBRT = selectedPill === TRANSPORT_TYPES.EDSA_CAROUSEL;
  // Only get payment methods for valid single-line, non-BRT
  const paymentMethods = (isSingleLine && !isBRT) ? getPaymentMethods() : [];
  const effectivePaymentMethod = (isSingleLine && isBRT) ? 'regular' : (isSingleLine ? paymentMethod : null);

  // Only reset pickers when selectedPill actually changes
  const prevSelectedPill = useRef(selectedPill);
  useEffect(() => {
    if (prevSelectedPill.current !== selectedPill) {
      setOrigin('');
      setDestination('');
      // Reset payment method to a valid default for the selected line
      if (selectedPill === TRANSPORT_TYPES.LRT1 || selectedPill === TRANSPORT_TYPES.LRT2 || selectedPill === TRANSPORT_TYPES.MRT3) {
        setPaymentMethod('sjt');
      } else if (selectedPill === TRANSPORT_TYPES.EDSA_CAROUSEL) {
        setPaymentMethod('regular');
      }
      setShowStationPicker(null);
      clearRoute();
      setOriginNodeId('');
      setDestinationNodeId('');
      setShowPicker(null);
      multiClearRoute();
      prevSelectedPill.current = selectedPill;
    }
  }, [selectedPill, clearRoute, multiClearRoute]);

  // No longer needed, handled above

  useEffect(() => {
    if (!isMultiModal && origin && destination && origin !== destination) {
      const timeout = setTimeout(async () => {
        try { await calculateRoute(origin, destination, effectivePaymentMethod); } 
        catch (e) { console.error('Route error:', e); }
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isMultiModal, origin, destination, effectivePaymentMethod, calculateRoute]);

  useEffect(() => {
    if (isMultiModal && originNodeId && destinationNodeId && originNodeId !== destinationNodeId) {
      const timeout = setTimeout(() => {
        multiCalculateRoute({ originNodeId, destinationNodeId, passengerType, routePreference });
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isMultiModal, originNodeId, destinationNodeId, passengerType, routePreference, multiCalculateRoute]);

  const getDisplayName = useCallback(
    (nodeId) => {
      const n = nodeById.get(nodeId);
      return n ? normalizeName(n.name) : '';
    },
    [nodeById],
  );

  const handleMultiAutoDetect = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    if (nodesLoading || nodes.length === 0) return;
    setAutoDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = null;
        let best = Infinity;
        for (const n of nodes) {
          if (typeof n.lat !== 'number' || typeof n.lng !== 'number') continue;
          const d = haversineKm(latitude, longitude, n.lat, n.lng);
          if (d < best) {
            best = d;
            nearest = n;
          }
        }
        if (nearest) {
          setOriginNodeId(nearest.id);
          setShowPicker('destination');
          toast.success(best < 1 ? `${Math.round(best * 1000)}m away` : `${best.toFixed(1)}km away`);
        } else {
          toast.error('Location found, but no stops have coordinates');
        }
        setAutoDetecting(false);
      },
      () => {
        toast.error('Location unavailable');
        setAutoDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [nodes, nodesLoading]);

  const selectNodeMulti = useCallback(
    (nodeId) => {
      if (originNodeId && destinationNodeId) {
        setOriginNodeId(nodeId);
        setDestinationNodeId('');
        setShowPicker('destination');
      } else if (showPicker === 'origin') {
        setOriginNodeId(nodeId);
        setShowPicker('destination');
      } else {
        setDestinationNodeId(nodeId);
        setShowPicker(null);
      }
      setSearchTerm('');
    },
    [showPicker, originNodeId, destinationNodeId],
  );

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
    if (origin && destination) {
      // Reselect: any selection becomes new origin, clear destination, prompt for to
      setOrigin(stationId);
      setDestination('');
      setShowStationPicker('destination');
      return;
    }
    if (showStationPicker === 'origin') {
      setOrigin(stationId);
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
        <div className="w-full px-0 sm:px-2">
          <div className="flex flex-nowrap gap-1 justify-center py-2 overflow-x-auto scrollbar-hide">
            {LINES.map((line, i) => (
              <motion.button
                key={line.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 25 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPill(line.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 min-w-[56px] sm:min-w-[72px] ${
                  selectedPill === line.id
                    ? `${line.bgClass} text-white shadow-lg`
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                }`}
              >
                <span className="w-5 h-5 rounded-[1.25rem] flex items-center justify-center bg-white/20">
                  {line.isMultiModal ? <Footprints className="w-4 h-4" /> : line.isBus ? <Bus className="w-4 h-4" /> : <Train className="w-4 h-4" />}
                </span>
                <span className="hidden sm:inline">{line.name}</span>
                <span className="sm:hidden">{line.shortName}</span>
              </motion.button>
            ))}
          </div>
          {/* No multi-modal controls in header; moved to main card for design cohesion */}
        </div>
      </motion.header>

      {/* Main */}
      <main className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {selectedPill !== 'multi-modal' && (
          <>
          {/* Single-line Station Selector */}
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
              <span className="text-[10px] text-zinc-400 font-medium">From</span>
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
              <span className="text-[10px] text-zinc-400 font-medium">To</span>
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
                          const isFrom = id === origin;
                          const isTo = id === destination;
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
                                isFrom ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-l-green-500' :
                                isTo ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-l-red-500' :
                                'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                              } ${i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                                isFrom || isTo ? 'bg-white/50' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                              }`}>
                                {i + 1}
                              </span>
                              <span className={isFrom || isTo ? 'font-medium text-zinc-700 dark:text-zinc-300' : 'text-zinc-700 dark:text-zinc-300'}>
                                {station.name?.replace(/ Station$/, '').replace(/\s*\(Formerly[^)]*\)/gi, '')}
                              </span>
                              {getStopAlerts(id).length > 0 && <span className="text-[10px]">⚠️</span>}
                              {isFrom && <span className="ml-auto text-[10px] text-green-600 dark:text-green-400 font-medium">From</span>}
                              {isTo && <span className="ml-auto text-[10px] text-red-600 dark:text-red-400 font-medium">To</span>}
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
          {/* Only show payment methods for non-multi-modal, non-BRT */}
          {!isMultiModal && !isBRT && paymentMethods.length > 0 && (
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
                            {getTrainCarSuggestion(selectedPill, route.fromStation?.station_id, route.toStation?.station_id, route.direction, stations)}
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
          {!route && !routeLoading && !routeError && !showStationPicker && selectedPill !== 'multi-modal' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-8 text-zinc-400 text-sm"
            >
              {!origin ? 'Tap "From" to select your starting station' : 'Tap "To" to select your destination'}
            </motion.div>
          )}
          </>
          )}


          {selectedPill === 'multi-modal' && (
          <div>
            {/* Multi-line Station Selector */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              {/* Station selectors ...existing code... */}
              <button
                onClick={() => setShowPicker(showPicker === 'origin' ? null : 'origin')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">From</div>
                  <div className={`text-sm ${originNodeId ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'}`}>
                    {originNodeId ? getDisplayName(originNodeId) : 'Select origin station/stop'}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">From</span>
                <motion.div animate={{ rotate: showPicker === 'origin' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </motion.div>
              </button>
              <div className="relative flex items-center px-4">
                <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800" />
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setOriginNodeId(destinationNodeId); setDestinationNodeId(originNodeId); }}
                  disabled={!originNodeId && !destinationNodeId}
                  className="mx-2 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
                </motion.button>
                <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800" />
              </div>
              <button
                onClick={() => setShowPicker(showPicker === 'destination' ? null : 'destination')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">To</div>
                  <div className={`text-sm ${destinationNodeId ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'}`}>
                    {destinationNodeId ? getDisplayName(destinationNodeId) : 'Select destination station/stop'}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium">To</span>
                <motion.div animate={{ rotate: showPicker === 'destination' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {showPicker && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="overflow-hidden border-t border-zinc-100 dark:border-zinc-800"
                  >
                    {/* Mobile-first: show search/actions as icon buttons in a collapsible row */}
                    <div className="sticky top-0 z-20 px-2 pt-2 pb-1 bg-transparent">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 rounded-full bg-white dark:bg-zinc-800 shadow border border-zinc-200 dark:border-zinc-700 text-mrt3 focus:outline-none focus:ring-2 focus:ring-mrt3"
                          onClick={() => setShowSearch(s => !s)}
                          aria-label="Toggle search and actions"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        {showSearch && (
                          <>
                            <input
                              type="text"
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              placeholder="Search stops..."
                              className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-mrt3"
                              autoFocus
                            />
                            <button
                              onClick={handleMultiAutoDetect}
                              disabled={nodesLoading}
                              className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-mrt3 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none"
                              aria-label="Use location"
                            >
                              <Navigation className="w-4 h-4" />
                            </button>
                            {(originNodeId || destinationNodeId) && (
                              <button
                                onClick={() => { setOriginNodeId(''); setDestinationNodeId(''); setShowPicker(null); }}
                                className="p-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-mrt3 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none"
                                aria-label="Clear selection"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {/* Grouped station list */}
                    <div className="max-h-60 overflow-y-auto rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
                      {nodesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-mrt3 border-t-transparent rounded-full" />
                        </div>
                      ) : (
                        (() => {
                          // Group filteredNodes by lineName
                          const groups = {};
                          filteredNodes.forEach(n => {
                            if (!groups[n.lineName]) groups[n.lineName] = [];
                            groups[n.lineName].push(n);
                          });
                          const lineOrder = ['LRT-1', 'LRT-2', 'MRT-3', 'Carousel'];
                          const lineColors = {
                            'LRT-1': 'from-lrt1 to-lrt1',
                            'LRT-2': 'from-lrt2 to-lrt2',
                            'MRT-3': 'from-mrt3 to-mrt3',
                            'Carousel': 'from-carousel to-carousel',
                          };
                          return lineOrder.filter(line => groups[line]).map(line => (
                            <div key={line} className="relative">
                              <div
                                className={`sticky left-0 top-2 z-10 w-fit px-4 py-1 rounded-full shadow-md text-xs font-bold uppercase tracking-wider backdrop-blur border border-white/30 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/60 bg-clip-padding flex items-center gap-2 animate-fade-in`}
                                style={{
                                  marginLeft: '0.5rem',
                                  background: 'linear-gradient(90deg, var(--tw-gradient-stops))',
                                  '--tw-gradient-from': `var(--${lineColors[line]?.split(' ')[0]})`,
                                  '--tw-gradient-to': `var(--${lineColors[line]?.split(' ')[1]})`,
                                  color: 'var(--tw-gradient-to)',
                                  filter: 'blur(0px)',
                                }}
                              >
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                  line === 'LRT-1' ? 'bg-lrt1' :
                                  line === 'LRT-2' ? 'bg-lrt2' :
                                  line === 'MRT-3' ? 'bg-mrt3' :
                                  'bg-carousel'
                                }`}></span>
                                {line}
                              </div>
                              {groups[line].map((n, i) => {
                                const isFrom = n.id === originNodeId;
                                const isTo = n.id === destinationNodeId;
                                const isOther = (showPicker === 'origin' && n.id === destinationNodeId) || (showPicker === 'destination' && n.id === originNodeId);
                                const disabled = isOther;
                                return (
                                  <motion.button
                                    key={n.id}
                                    variants={staggerItem}
                                    whileHover={!disabled ? { x: 4, backgroundColor: 'rgba(0,0,0,0.02)' } : {}}
                                    whileTap={!disabled ? { scale: 0.99 } : {}}
                                    onClick={() => !disabled && selectNodeMulti(n.id)}
                                    disabled={disabled}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                                      disabled ? 'opacity-40 cursor-not-allowed' :
                                      isFrom ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-l-green-500' :
                                      isTo ? 'bg-red-100 dark:bg-red-900/30 border-l-4 border-l-red-500' :
                                      'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                    } ${i > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                                      isFrom || isTo ? 'bg-white/50' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                    }`}>
                                      {i + 1}
                                    </span>
                                    <span className={isFrom || isTo ? 'font-medium text-zinc-700 dark:text-zinc-300' : 'text-zinc-700 dark:text-zinc-300'}>
                                      {n.name?.replace(/ Station$/, '').replace(/\s*\(Formerly[^)]*\)/gi, '')}
                                    </span>
                                    {isFrom && <span className="ml-auto text-[10px] text-green-600 dark:text-green-400 font-medium">From</span>}
                                    {isTo && <span className="ml-auto text-[10px] text-red-600 dark:text-red-400 font-medium">To</span>}
                                  </motion.button>
                                );
                              })}
                            </div>
                          ));
                        })()
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {/* Multi-modal selection buttons (cohesive with payment method icons), now outside the station selector card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 py-4"
            >
              {[
                { id: 'regular', icon: Ticket, name: 'Regular' },
                { id: 'student', icon: GraduationCap, name: 'Student' },
                { id: 'discounted', icon: Heart, name: 'PWD/Senior' }
              ].map((method, i) => {
                const Icon = method.icon;
                return (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPassengerType(method.id)}
                    title={method.name}
                    className={`relative group p-3 rounded-xl transition-all duration-200 ${
                      passengerType === method.id
                        ? 'bg-mrt3 text-white shadow-lg'
                        : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {method.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                    </div>
                  </motion.button>
                );
              })}
              {/* Fastest/Affordable toggle button, styled as icon button with tooltip, with BETA label below */}
              <div className="flex flex-col items-center">
                <div className="relative flex flex-col items-center">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + 3 * 0.05 }}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRoutePreference(routePreference === 'fastest' ? 'affordable' : 'fastest')}
                    title={routePreference === 'fastest' ? 'Fastest' : 'Most affordable'}
                    className={`relative group p-3 rounded-xl transition-all duration-200 ${
                      routePreference === 'fastest'
                        ? 'bg-mrt3 text-white shadow-lg'
                        : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {routePreference === 'fastest' ? <ArrowUpDown className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {routePreference === 'fastest' ? 'Fastest' : 'Most affordable'}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
                    </div>
                  </motion.button>
                  <span className="absolute left-1/2 -translate-x-1/2 mt-2 block text-[10px] text-zinc-400" style={{ letterSpacing: '0.08em', fontSize: '10px', lineHeight: '1.1', bottom: '-1.6em' }}>BETA</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}

          <AnimatePresence mode="wait">
            {multiRouteLoading && (
              <motion.div key="loading" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-6 h-6 border-2 border-mrt3 border-t-transparent rounded-full" />
              </motion.div>
            )}
            {multiRouteError && (
              <motion.div key="error" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300">
                {multiRouteError}
              </motion.div>
            )}
            {multiRoute && !multiRouteLoading && (
              <motion.div key="results" variants={cardVariants} initial="hidden" animate="visible" exit="exit"
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mrt3 flex items-center justify-center text-white">
                      <Train className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-white">
                        <span className="truncate">{getDisplayName(originNodeId)}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{getDisplayName(destinationNodeId)}</span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {multiRoute.linesUsed.length} lines • {multiRoute.transfers.length} transfers
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
                  {[
                    { value: formatFare(multiRoute.totalFare), label: 'Total fare' },
                    { value: `${multiRoute.totalTimeMinutes}`, label: 'Minutes' },
                    { value: `${multiRoute.transfers.length}`, label: 'Transfers' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 text-center">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="p-4 space-y-3">
                  {multiRoute.warnings?.length > 0 && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                      {multiRoute.warnings.map((w, idx) => <div key={idx}>• {w}</div>)}
                    </div>
                  )}
                  <div className="space-y-2">
                    {multiRoute.segments.map((seg, idx) => {
                      const cfg = TRANSPORT_CONFIG[seg.lineId];
                      const isBus = cfg?.type === 'brt';
                      const badgeClass = seg.lineId === TRANSPORT_TYPES.LRT1 ? 'bg-lrt1' : seg.lineId === TRANSPORT_TYPES.LRT2 ? 'bg-lrt2' : seg.lineId === TRANSPORT_TYPES.MRT3 ? 'bg-mrt3' : 'bg-carousel';
                      return (
                        <React.Fragment key={`${seg.lineId}-${idx}`}>
                          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-3 flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl ${badgeClass} flex items-center justify-center text-white`}>
                                {isBus ? <Bus className="w-5 h-5" /> : <Train className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-zinc-500">{cfg?.name || seg.lineId}</div>
                                <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                                  {normalizeName(seg.fromNode?.name)} <span className="text-zinc-400">→</span> {normalizeName(seg.toNode?.name)}
                                </div>
                                <div className="mt-1 text-xs text-zinc-500">
                                  {seg.distanceUnits} {isBus ? 'stops' : 'stations'} • {seg.durationMinutes} min • {formatFare(seg.fare)}
                                </div>
                              </div>
                            </div>
                          </div>
                          {multiRoute.transfers[idx] && (
                            <div className="flex items-start gap-3 px-1">
                              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                <Footprints className="w-5 h-5" />
                              </div>
                              <div className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900/40">
                                <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                                  Transfer • {multiRoute.transfers[idx].transferTimeMinutes} min
                                </div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                  {multiRoute.transfers[idx].description}
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!multiRoute && !multiRouteLoading && !multiRouteError && !showPicker && selectedPill === 'multi-modal' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-center py-8 text-zinc-400 text-sm">
              {!originNodeId ? 'Tap "From" to select your starting point' : 'Tap "To" to select your destination'}
            </motion.div>
          
          )}
        </div>
      </main>
    </div>
  );
};

export default PlanPage;
