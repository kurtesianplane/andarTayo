import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import BootstrapIcon from '../../../components/shared/BootstrapIcon';
import Tooltip from '../../../components/Tooltip';
import AlertPopup from '../../../components/AlertPopup';
import SocialMediaIcon from '../../../components/SocialMediaIcon';
import StopConnections from '../../shared/StopConnections';
import { useTransportData, useRoutePlanner } from '../../shared/hooks/useTransport';
import { getConnectionIcon } from '../../shared/utils/connectionUtils.jsx';
import { TRANSPORT_TYPES } from '../../shared/config/transportConfig';
import _ from 'lodash';
import { useAlerts } from '../../../context/AlertContext';
import { usePWA } from '../../../hooks/usePWA';
import { scrollElementIntoView } from '../../../utils/scrollUtils';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

const selectTransition = {
  type: "tween",
  duration: 0.2,
  ease: "easeOut"
};

export default function LRT1RoutePlanner({ initialFromStation, onRouteChange }) {
  const { isStopDisabled, getStopAlerts } = useAlerts();
  const { trackEngagement } = usePWA();
  const { data: transportData, loading: dataLoading, error: dataError } = useTransportData(TRANSPORT_TYPES.LRT1);
  const { 
    route, 
    fare, 
    loading: routeLoading, 
    error: routeError, 
    calculateRoute, 
    clearRoute, 
    getPaymentMethods 
  } = useRoutePlanner(TRANSPORT_TYPES.LRT1);
    const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [category, setCategory] = useState("sjt"); // Payment method
  const [availableToStations, setAvailableToStations] = useState([]);
  const [expandedLandmarks, setExpandedLandmarks] = useState(new Set());
  const [expandedStations, setExpandedStations] = useState(new Set());
  const [showCommuteDetails, setShowCommuteDetails] = useState(false);
  const [alertPopup, setAlertPopup] = useState({
    isOpen: false,
    alerts: []
  });

  const containerRef = useRef(null);
  const routeDetailsRef = useRef(null);

  // Payment methods from unified config
  const paymentMethods = getPaymentMethods();

  // disabled station in case of service alerts
  const handleDisabledStationClick = useCallback((stationId) => {
    const alerts = getStopAlerts(stationId);
    setAlertPopup({
      isOpen: true,
      alerts: alerts
    });
  }, [getStopAlerts]);  // show available stations
  const availableFromStations = React.useMemo(() => 
    transportData?.stations?.sort((a, b) => a.sequence - b.sequence) || []
  , [transportData?.stations]);
  // handle directions
  const calculateDirection = useCallback((fromStationData, toStationData) => {
    return fromStationData.sequence < toStationData.sequence ? 'southbound' : 'northbound';
  }, []);  // Handle route calculation using unified system
  const handleCalculateRoute = useCallback(async () => {
    if (!fromStation || !toStation) {
      toast.error("Please select both origin and destination stations");
      return;
    }

    try {
      const result = await calculateRoute(fromStation, toStation, category);
      
      if (result?.route) {
        // Track PWA engagement for route planning
        trackEngagement('ROUTE_PLANNED', {
          transportType: 'LRT-1',
          from: fromStation,
          to: toStation,
          fare: result.fare,
        });

        toast.success(`Route calculated: ₱${result.fare} • ${result.route.estimatedTime} min`);
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      toast.error(err.message || "Failed to calculate route");
    }
  }, [fromStation, toStation, category]);

  // Auto-scroll to route details when route is calculated
  useEffect(() => {
    if (route) {
      setTimeout(() => {
        if (routeDetailsRef.current) {
          scrollElementIntoView(routeDetailsRef.current, { 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 600);
    }
  }, [route]);

  const getUniqueConnectionTypes = useCallback((station) => {
    const connectionTypes = new Set();
    
    if (station.connections) {
      Object.keys(station.connections).forEach(type => {
        if (station.connections[type] && station.connections[type].length > 0) {
          connectionTypes.add(getConnectionIcon(type));
        }
      });
    }
    
    return Array.from(connectionTypes);
  }, []);

  const handleFromStationChange = useCallback((stationId) => {
    if (isStopDisabled(stationId)) {
      handleDisabledStationClick(stationId);
      return;
    }    setFromStation(stationId);
    clearRoute();
    
    const filtered = availableFromStations.filter(station => station.station_id !== stationId);
    setAvailableToStations(filtered);
    
    if (toStation === stationId) {
      setToStation("");
    }
  }, [availableFromStations, toStation, isStopDisabled, handleDisabledStationClick]);

  const handleToStationChange = useCallback((stationId) => {
    if (isStopDisabled(stationId)) {
      handleDisabledStationClick(stationId);
      return;
    }    setToStation(stationId);
    clearRoute();
  }, [isStopDisabled, handleDisabledStationClick, clearRoute]);  useEffect(() => {
    if (fromStation && toStation) {
      const debounced = _.debounce(handleCalculateRoute, 300);
      debounced();
      return () => debounced.cancel();
    }
  }, [fromStation, toStation, category]);

  useEffect(() => {
    if (initialFromStation?.station_id && !fromStation) {
      handleFromStationChange(initialFromStation.station_id);
    }  }, [initialFromStation, fromStation, handleFromStationChange]);

  // todo: landmarks
  const toggleLandmarkExpansion = useCallback((stationId) => {
    setExpandedLandmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) {
        newSet.delete(stationId);
      } else {
        newSet.add(stationId);
      }
      return newSet;
    });
  }, []);

  // station info
  const toggleStationExpansion = useCallback((stationId) => {
    setExpandedStations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stationId)) {
        newSet.delete(stationId);
      } else {
        newSet.add(stationId);
      }
      return newSet;
    });
  }, []);  // swap stations functionality
  const handleSwapStations = useCallback(() => {
    if (!fromStation || !toStation) {
      toast.error('Please select both departure and destination stations first');
      return;
    }

    const tempFromStation = fromStation;
    const tempToStation = toStation;
    
    // Clear current route first to prevent stale state
    clearRoute();
    
    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      setFromStation(tempToStation);
      setToStation(tempFromStation);
      
      // Update available stations for the new "to" selection
      const filtered = availableFromStations.filter(station => station.station_id !== tempToStation);
      setAvailableToStations(filtered);
      
      // Force route recalculation after swap
      setTimeout(() => {
        handleCalculateRoute();
      }, 100);
      
      toast.success('Stations swapped successfully');
    }, 50);
  }, [fromStation, toStation, availableFromStations, clearRoute, handleCalculateRoute]);

  return (
    <LayoutGroup>
      <motion.div 
        ref={containerRef}
        className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6 h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-fit order-1 lg:order-1"
          variants={itemVariants}
        >          <div className="flex items-center gap-3 mb-6">            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BootstrapIcon name="train-lightrail-front-fill" className="text-xl text-green-600" />
            </div><div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">LRT-1 Route Planner</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Green Line • Fernando Poe Jr. (Formerly Roosevelt) ↔ Dr. Santos</p>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Station
              </label>              <motion.select
                value={fromStation}
                onChange={(e) => handleFromStationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23374151' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5em'
                }}
                transition={selectTransition}
                disabled={routeLoading}
              ><option value="">Select departure station</option>
                {availableFromStations.map((station, index) => {
                  const isFirstCaviteStation = station.cavite_extension_phase === 1 && 
                    (!availableFromStations[index - 1] || !availableFromStations[index - 1].cavite_extension_phase);
                  
                  return (
                    <React.Fragment key={station.station_id}>
                      {isFirstCaviteStation && (
                        <option value="" disabled className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">                        ─── Cavite Extension Phase 1 ───
                        </option>
                      )}
                      <option 
                        value={station.station_id}
                        disabled={isStopDisabled(station.station_id)}
                        className={station.cavite_extension_phase === 1 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium" : ""}
                      >
                        {station.cavite_extension_phase === 1 ? "(NEW) " : ""}{station.name}
                        {isStopDisabled(station.station_id) && ' (Service Alert)'}
                      </option>
                    </React.Fragment>
                  );
                })}              </motion.select>
            </motion.div>

            {/* Swap Button */}
            <motion.div 
              className="flex justify-center"
              variants={itemVariants}
            >
              <motion.button
                onClick={handleSwapStations}
                disabled={routeLoading || (!fromStation || !toStation)}
                className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={springTransition}
                title="Swap departure and destination stations"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" 
                  />
                </svg>
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Station
              </label><motion.select
                value={toStation}
                onChange={(e) => handleToStationChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 appearance-none pr-10"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23374151' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5em'
                }}
                transition={selectTransition}
                disabled={!fromStation || routeLoading}
              ><option value="">Select destination station</option>
                {availableToStations.map((station, index) => {
                  const isFirstCaviteStation = station.cavite_extension_phase === 1 && 
                    (!availableToStations[index - 1] || !availableToStations[index - 1].cavite_extension_phase);
                  
                  return (
                    <React.Fragment key={station.station_id}>
                      {isFirstCaviteStation && (
                        <option value="" disabled className="font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30">
                          ─── Cavite Extension Phase 1 ───
                        </option>
                      )}
                      <option 
                        value={station.station_id}
                        disabled={isStopDisabled(station.station_id)}
                        className={station.cavite_extension_phase === 1 ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 font-medium" : ""}                      >
                        {station.cavite_extension_phase === 1 ? "NEW " : ""}{station.name}
                        {isStopDisabled(station.station_id) && ' (Service Alert)'}
                      </option>
                    </React.Fragment>
                  );
                })}
              </motion.select>
            </motion.div>            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-1 gap-2">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => setCategory(method.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      category === method.id
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500 ring-opacity-20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-green-300 hover:bg-green-25 dark:hover:bg-green-900/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={springTransition}
                  >
                    <div className="flex items-center gap-3">
                      <method.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{method.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{method.description}</div>
                      </div>
                      {category === method.id && (
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence>
              {category === 'discounted' && (
                <motion.div
                  variants={itemVariants}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                        PWD/Senior Citizen Discount
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        To avail of the 20% discount, please consult the nearest LRT-1 ticket booth or station personnel. 
                        You may need to present valid identification or discount cards.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>            {/* Social Media Links */}
            {transportData?.socials && (
              <motion.div variants={itemVariants} className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Follow {transportData.socials.transport_name}:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {transportData.socials.social_media
                    ?.filter(social => social.active)
                    ?.map((social, index) => (
                      <SocialMediaIcon 
                        key={index}
                        platform={social.platform} 
                        url={social.url} 
                        size="sm"
                      />
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right panel - Results */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 order-2 lg:order-2"
          variants={itemVariants}
        >          <AnimatePresence mode="wait">
            {!route ? (
              <motion.div
                key="placeholder"
                className="text-center py-12"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BootstrapIcon name="train-lightrail-front-fill" className="w-8 h-8 text-green-600" size={32} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Plan Your LRT-1 Journey</h3>
                <p className="text-gray-500 dark:text-gray-400">Select your departure and destination stations to see route details, fare, and travel time.</p>
              </motion.div>
            ) : (              <motion.div
                key="results"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >                <div ref={routeDetailsRef} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 mt-6 scroll-mt-16 md:scroll-mt-12">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Trip Summary</h3>
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <span className="hidden sm:block capitalize">{route.direction}</span>
                      <span className="sm:hidden text-lg">
                        {route.direction === 'southbound' ? '↓' : '↑'}
                      </span>
                      <span>•</span>
                      <span>{route.distance} station{route.distance !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">₱{fare}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {paymentMethods.find(p => p.id === category)?.name}
                        {category === 'beep' && route?.sjtFare && route.sjtFare > fare && (
                          <span className="block text-xs text-green-600 dark:text-green-400">₱{route.sjtFare - fare} saved</span>
                        )}
                        {category === 'discounted' && (
                          <span className="block text-xs text-green-600 dark:text-green-400">20% discount</span>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{route.estimatedTime}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">minutes</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Route Details</h4>                    <button
                      onClick={() => setShowCommuteDetails(!showCommuteDetails)}
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                    >
                      {showCommuteDetails ? 'hide commute details' : 'see commute details'}
                    </button>
                  </div>                  <div className="space-y-3">
                    {route.route.map((station, index) => {
                      const isStart = station.station_id === route.fromStation.station_id;
                      const isEnd = station.station_id === route.toStation.station_id;
                      const isExpanded = expandedStations.has(station.station_id);
                      const uniqueConnections = getUniqueConnectionTypes(station);
                      const isCaviteExtension = station.cavite_extension_phase === 1;
                      const isFirstCaviteStation = isCaviteExtension && 
                        (!route.route[index - 1] || !route.route[index - 1].cavite_extension_phase);

                      return (
                        <React.Fragment key={station.station_id}>

                          {/* cavite extension */}
                          {isFirstCaviteStation && (
                            <motion.div
                              className="flex items-center justify-center py-2"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                            >                              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full border-2 border-green-300 dark:border-green-600">
                                <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                                  NEW CAVITE EXTENSION PHASE 1
                                </span>
                              </div>
                            </motion.div>
                          )}
                            <motion.div
                            className={`relative cursor-pointer transition-all duration-200 ${
                              isCaviteExtension 
                                ? 'bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2'
                            } ${!showCommuteDetails && uniqueConnections.length > 0 ? 'hover:shadow-md' : ''}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => !showCommuteDetails && uniqueConnections.length > 0 && toggleStationExpansion(station.station_id)}
                            whileHover={{ scale: !showCommuteDetails && uniqueConnections.length > 0 ? 1.02 : 1 }}
                            whileTap={{ scale: !showCommuteDetails && uniqueConnections.length > 0 ? 0.98 : 1 }}
                          >                            <div className="flex items-start gap-3">                            <div className="flex flex-col items-start pt-0.5">
                                <div className="w-4 h-4 rounded-full flex items-center justify-center">
                                  {isStart ? (
                                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                  ) : isEnd ? (
                                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                  ) : isCaviteExtension ? (
                                    <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">N</div>
                                  ) : (
                                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                  )}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h5 className={`font-medium ${isCaviteExtension ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-white'}`}>
                                        {station.name}
                                      </h5>
                                      {isCaviteExtension && (
                                        <span className="text-xs bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full font-medium">
                                          NEW
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-sm ${isCaviteExtension ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                      {station.municipality}
                                    </p>
                                      {uniqueConnections.length > 0 && (
                                      <div className="flex items-center gap-1 mt-1">
                                        {uniqueConnections.map((icon, idx) => (
                                          <span key={idx}>{icon}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  {!showCommuteDetails && uniqueConnections.length > 0 && (
                                    <div className="text-xs text-green-600 dark:text-green-400 ml-2 pointer-events-none">
                                      {isExpanded ? '▲' : '▼'}
                                    </div>
                                  )}
                                </div>                                {!showCommuteDetails && isExpanded && (                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ 
                                      duration: 0.3, 
                                      ease: "easeInOut",
                                      height: { type: "spring", stiffness: 300, damping: 30 }
                                    }}
                                    className="mt-3 pl-4 border-l-2 border-green-200 dark:border-green-600 overflow-hidden"
                                  >
                                    <StopConnections 
                                      connections={station.connections} 
                                      landmarks={station.nearby_landmarks}
                                      showExpanded={true}
                                    />
                                  </motion.div>
                                )}

                                {showCommuteDetails && (                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-3 pl-4 border-l-2 border-green-200 dark:border-green-600"
                                  >
                                    <StopConnections 
                                      connections={station.connections} 
                                      landmarks={station.nearby_landmarks}
                                      showExpanded={true}
                                    />
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>Operating Hours: 4:30 AM - 10:30 PM</div>
                    <div>Frequency: 3-4 minutes (peak), 5-7 minutes (off-peak)</div>                    <div>Distance-based fares: ₱12-36 (SJT), ₱11-35 (Beep Card), ₱10-29 (PWD/Senior)</div>
                    <div className="text-green-600 dark:text-green-400">
                      NEW Cavite Extension Phase 1: Redemptorist-Aseana to Dr. Santos (opened Nov 2024)
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>          {routeError && (
            <motion.div
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="mt-1 text-sm">{routeError}</p>
            </motion.div>
          )}          {routeLoading && (
            <motion.div
              className="flex items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Calculating route...</span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <AlertPopup
        isOpen={alertPopup.isOpen}
        onClose={() => setAlertPopup({ isOpen: false, alerts: [] })}
        alerts={alertPopup.alerts}
      />
    </LayoutGroup>
  );
}

LRT1RoutePlanner.propTypes = {
  initialFromStation: PropTypes.object,
  onRouteChange: PropTypes.func,
};