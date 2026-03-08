import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowUpDown,
  Bus,
  ChevronDown,
  ChevronRight,
  Footprints,
  MapPin,
  Navigation,
  RotateCcw,
  Train,
} from 'lucide-react';
import { TRANSPORT_CONFIG, TRANSPORT_TYPES } from '../transport/shared/config/transportConfig';
import { useMultiModalRoutePlanner, useMultiModalStations } from '../transport/shared/hooks/useMultiModalRoutePlanner';

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } },
};

const dropdownVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 35 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

function formatFare(value) {
  if (value === null || value === undefined) return '₱—';
  if (typeof value !== 'number') return `${value}`;
  const rounded = Math.round(value * 100) / 100;
  return `₱${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}

function normalizeName(name = '') {
  return name
    .replace(/\s*\(Formerly[^)]*\)/gi, '')
    .replace(/\s+Station$/i, '')
    .trim();
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aa =
    s1 * s1 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

export default function MultiModalPlanPage() {
  const navigate = useNavigate();

  const includeLines = useMemo(
    () => [TRANSPORT_TYPES.LRT1, TRANSPORT_TYPES.LRT2, TRANSPORT_TYPES.MRT3, TRANSPORT_TYPES.EDSA_CAROUSEL],
    [],
  );

  const { nodes, loading: nodesLoading } = useMultiModalStations(includeLines);
  const { route, loading: routeLoading, error: routeError, calculateRoute, clearRoute } =
    useMultiModalRoutePlanner(includeLines);

  const [originNodeId, setOriginNodeId] = useState('');
  const [destinationNodeId, setDestinationNodeId] = useState('');
  const [passengerType, setPassengerType] = useState('regular'); // regular | student | discounted
  const [routePreference, setRoutePreference] = useState('fastest'); // fastest | affordable
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [showPicker, setShowPicker] = useState(null); // 'origin' | 'destination' | null
  const [searchTerm, setSearchTerm] = useState('');

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

  const getDisplayName = useCallback(
    (nodeId) => {
      const n = nodeById.get(nodeId);
      return n ? normalizeName(n.name) : '';
    },
    [nodeById],
  );

  const handleSwap = useCallback(() => {
    setOriginNodeId(destinationNodeId);
    setDestinationNodeId(originNodeId);
  }, [originNodeId, destinationNodeId]);

  const handleReset = useCallback(() => {
    setOriginNodeId('');
    setDestinationNodeId('');
    setSearchTerm('');
    setShowPicker(null);
    clearRoute();
  }, [clearRoute]);

  useEffect(() => {
    if (!originNodeId || !destinationNodeId || originNodeId === destinationNodeId) return;
    const timeout = setTimeout(() => {
      // Add routePreference here!
      calculateRoute({ originNodeId, destinationNodeId, passengerType, routePreference });
    }, 200);
    return () => clearTimeout(timeout);
  }, [originNodeId, destinationNodeId, passengerType, routePreference, calculateRoute]);

  const handleAutoDetect = useCallback(async () => {
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
  }, [nodesLoading, nodes]);

  const selectNode = useCallback(
    (nodeId) => {
      if (showPicker === 'origin') {
        setOriginNodeId(nodeId);
        setShowPicker('destination');
      } else if (showPicker === 'destination') {
        setDestinationNodeId(nodeId);
        setShowPicker(null);
      }
      setSearchTerm('');
    },
    [showPicker],
  );

  const passengerOptions = [
    { id: 'regular', label: 'Regular' },
    { id: 'student', label: 'Student' },
    { id: 'discounted', label: 'PWD/Senior' },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-24 lg:pb-6">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800 px-4 py-3"
      >
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">Trip planner</div>
            <div className="flex gap-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1">
              <button
                onClick={() => navigate('/')}
                className="px-3 py-1.5 text-xs font-medium rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Single line
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-mrt3 text-white shadow-sm">
                Multi-line
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {passengerOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPassengerType(opt.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  passengerType === opt.id
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      <main className="flex-1 px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <button
              onClick={() => setShowPicker(showPicker === 'origin' ? null : 'origin')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-lrt1/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-lrt1" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">From</div>
                <div
                  className={`text-sm ${
                    originNodeId ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'
                  }`}
                >
                  {originNodeId ? getDisplayName(originNodeId) : 'Select origin station/stop'}
                </div>
              </div>
              <motion.div animate={{ rotate: showPicker === 'origin' ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </motion.div>
            </button>

            <div className="relative flex items-center px-4">
              <div className="flex-1 border-t border-zinc-100 dark:border-zinc-800" />
              <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleSwap}
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
              <div className="w-8 h-8 rounded-full bg-carousel/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-carousel" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">To</div>
                <div
                  className={`text-sm ${
                    destinationNodeId ? 'text-zinc-900 dark:text-white font-medium' : 'text-zinc-400'
                  }`}
                >
                  {destinationNodeId ? getDisplayName(destinationNodeId) : 'Select destination station/stop'}
                </div>
              </div>
              <motion.div
                animate={{ rotate: showPicker === 'destination' ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
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
                  <div className="p-2 bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={handleAutoDetect}
                        disabled={autoDetecting || nodesLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
                      >
                        {autoDetecting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-3.5 h-3.5 border-2 border-zinc-400 border-t-transparent rounded-full"
                          />
                        ) : (
                          <Navigation className="w-3.5 h-3.5" />
                        )}
                        <span>Use location</span>
                      </button>
                      {(originNodeId || destinationNodeId) && (
                        <button
                          onClick={handleReset}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search stations, stops, or line…"
                      className="w-full mb-2 px-3 py-2 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-mrt3/40"
                    />

                    <div className="max-h-56 overflow-y-auto rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                      {nodesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-mrt3 border-t-transparent rounded-full"
                          />
                        </div>
                      ) : (
                        filteredNodes.map((n, idx) => {
                          const isSelected =
                            (showPicker === 'origin' && n.id === originNodeId) ||
                            (showPicker === 'destination' && n.id === destinationNodeId);
                          const isOther =
                            (showPicker === 'origin' && n.id === destinationNodeId) ||
                            (showPicker === 'destination' && n.id === originNodeId);

                          return (
                            <button
                              key={n.id}
                              onClick={() => !isOther && selectNode(n.id)}
                              disabled={isOther}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                                isOther ? 'opacity-40 cursor-not-allowed' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
                              } ${idx > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''} ${
                                isSelected ? `${n.bgClass} text-white` : ''
                              }`}
                            >
                              <span
                                className={`px-2 py-0.5 text-[10px] rounded-full ${
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                }`}
                              >
                                {n.lineName}
                              </span>
                              <span className={isSelected ? 'font-medium' : 'text-zinc-700 dark:text-zinc-300'}>
                                {n.name}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-6 h-6 border-2 border-mrt3 border-t-transparent rounded-full"
                />
              </motion.div>
            )}

            {routeError && (
              <motion.div
                key="error"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300"
              >
                {routeError}
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
                        {route.linesUsed.length} lines • {route.transfers.length} transfers
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-zinc-100 dark:divide-zinc-800">
                  {[
                    { value: formatFare(route.totalFare), label: 'Total fare' },
                    { value: `${route.totalTimeMinutes}`, label: 'Minutes' },
                    { value: `${route.transfers.length}`, label: 'Transfers' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 text-center">
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="p-4 space-y-3">
                  {route.warnings?.length > 0 && (
                    <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                      {route.warnings.map((w, idx) => (
                        <div key={idx}>• {w}</div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {route.segments.map((seg, idx) => {
                      const cfg = TRANSPORT_CONFIG[seg.lineId];
                      const isBus = cfg?.type === 'brt';
                      const badgeClass =
                        seg.lineId === TRANSPORT_TYPES.LRT1
                          ? 'bg-lrt1'
                          : seg.lineId === TRANSPORT_TYPES.LRT2
                            ? 'bg-lrt2'
                            : seg.lineId === TRANSPORT_TYPES.MRT3
                              ? 'bg-mrt3'
                              : 'bg-carousel';

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
                                  {normalizeName(seg.fromNode?.name)} <span className="text-zinc-400">→</span>{' '}
                                  {normalizeName(seg.toNode?.name)}
                                </div>
                                <div className="mt-1 text-xs text-zinc-500">
                                  {seg.distanceUnits} {isBus ? 'stops' : 'stations'} • {seg.durationMinutes} min •{' '}
                                  {formatFare(seg.fare)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {route.transfers[idx] && (
                            <div className="flex items-start gap-3 px-1">
                              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                <Footprints className="w-5 h-5" />
                              </div>
                              <div className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900/40">
                                <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                                  Transfer • {route.transfers[idx].transferTimeMinutes} min
                                </div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                                  {route.transfers[idx].description}
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

          {!route && !routeLoading && !routeError && !showPicker && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-8 text-zinc-400 text-sm"
            >
              {!originNodeId ? 'Tap \"From\" to select your starting point' : 'Tap \"To\" to select your destination'}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

