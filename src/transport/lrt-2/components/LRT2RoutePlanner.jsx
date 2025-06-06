import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Tooltip from '../../../components/Tooltip';
import AlertPopup from '../../../components/AlertPopup';
import StopConnections from '../../shared/StopConnections';
import stationsData from "../data/stations.json";
import fareMatrix from "../data/fareMatrix.json";
import _ from 'lodash';
import { useAlerts } from '../../../context/AlertContext';

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

export default function LRT2RoutePlanner({ initialFromStation, onRouteChange }) {
  const { isStopDisabled, getStopAlerts } = useAlerts();
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [category, setCategory] = useState("sjt");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [direction, setDirection] = useState('eastbound');
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

  const handleDisabledStationClick = useCallback((stationId) => {
    const alerts = getStopAlerts(stationId);
    setAlertPopup({
      isOpen: true,
      alerts: alerts
    });
  }, [getStopAlerts]);
  const availableFromStations = React.useMemo(() => 
    stationsData.stations.sort((a, b) => a.sequence - b.sequence)
  , []);

  const calculateDirection = useCallback((fromStationData, toStationData) => {
    return fromStationData.sequence < toStationData.sequence ? 'eastbound' : 'westbound';
  }, []);
  const calculateFare = useCallback((fromStation, toStation, category) => {
    try {
      const distance = Math.abs(toStation.sequence - fromStation.sequence);
      
      if (distance === 0) {
        return {
          fare: 0,
          distance: 0,
          estimatedTime: 0
        };
      }

      const fromStationName = fromStation.name;
      const toStationName = toStation.name;
      
      let fare = 15; // fallback
      
      if (category === 'sjt') {
        const fromIndex = fareMatrix.stations.indexOf(fromStationName);
        const toIndex = fareMatrix.stations.indexOf(toStationName);
        if (fromIndex !== -1 && toIndex !== -1) {
          fare = fareMatrix.single_journey[fromStationName][toIndex];
        }
      } else if (category === 'beep') {
        const fromIndex = fareMatrix.stations.indexOf(fromStationName);
        const toIndex = fareMatrix.stations.indexOf(toStationName);
        if (fromIndex !== -1 && toIndex !== -1) {
          fare = fareMatrix.beep_card[fromStationName][toIndex];
        }
      } else if (category === 'discounted') {
        const fromIndex = fareMatrix.stations.indexOf(fromStationName);
        const toIndex = fareMatrix.stations.indexOf(toStationName);
        if (fromIndex !== -1 && toIndex !== -1) {
          const sjtFare = fareMatrix.single_journey[fromStationName][toIndex];
          fare = Math.round(sjtFare * 0.8);
        }
      }
      
      const estimatedTime = distance * 2.5 + 3;
      
      return {
        fare: fare,
        distance: distance,
        estimatedTime: Math.round(estimatedTime)
      };
    } catch (error) {
      console.error('Error calculating fare:', error);
      return { fare: 15, distance: 0, estimatedTime: 5 };
    }
  }, []);

  const getConnectionIcon = useCallback((connectionType) => {
    switch (connectionType) {
      case 'rail':
        return '🚆';
      case 'bus_rapid_transit':
        return '🚍';
      case 'bus_terminals':
        return '🚌';
      case 'jeepney_routes':
        return '🚐'
      case 'uv_express':
        return '🚌';
      case 'nearby_landmarks':
        return '🏢';
    }
  }, []);

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
  }, [getConnectionIcon]);

  const handleFromStationChange = useCallback((stationId) => {    if (isStopDisabled(stationId)) {
      handleDisabledStationClick(stationId);
      return;
    }

    const selectedFromStation = availableFromStations.find(s => s.station_id === stationId);
    if (!selectedFromStation) return;

    setFromStation(stationId);
    
    const filteredToStations = availableFromStations.filter(station => 
      station.station_id !== stationId && !isStopDisabled(station.station_id)
    );
    setAvailableToStations(filteredToStations);
    
    if (toStation === stationId) {
      setToStation("");
    }
    
    setResult(null);
    setError(null);
    
    if (onRouteChange) {
      onRouteChange({
        from: selectedFromStation,
        to: null,
        line: 'lrt2'
      });
    }
  }, [availableFromStations, isStopDisabled, handleDisabledStationClick, toStation, onRouteChange]);

  const handleToStationChange = useCallback((stationId) => {
    if (isStopDisabled(stationId)) {
      handleDisabledStationClick(stationId);
      return;
    }

    setToStation(stationId);
    setResult(null);
    setError(null);
    
    if (onRouteChange) {
      const selectedFromStation = availableFromStations.find(s => s.station_id === fromStation);
      const selectedToStation = availableFromStations.find(s => s.station_id === stationId);
      
      if (onRouteChange) {
        onRouteChange({
          from: selectedFromStation,
          to: selectedToStation,
          line: 'lrt2'
        });
      }
    }
  }, [availableFromStations, fromStation, isStopDisabled, handleDisabledStationClick, onRouteChange]);

  const calculateRoute = useCallback(async () => {
    if (!fromStation || !toStation) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const fromStationData = availableFromStations.find(s => s.station_id === fromStation);
      const toStationData = availableFromStations.find(s => s.station_id === toStation);
      
      if (!fromStationData || !toStationData) {
        throw new Error('Invalid station selection');
      }
      const { fare, distance, estimatedTime } = calculateFare(fromStationData, toStationData, category);
      
      const tripDirection = calculateDirection(fromStationData, toStationData);
      
      const startSeq = Math.min(fromStationData.sequence, toStationData.sequence);
      const endSeq = Math.max(fromStationData.sequence, toStationData.sequence);
      
      const routeStations = availableFromStations
        .filter(station => station.sequence >= startSeq && station.sequence <= endSeq)
        .sort((a, b) => {
          return fromStationData.sequence < toStationData.sequence ? 
            a.sequence - b.sequence : b.sequence - a.sequence;
        });      const routeResult = {
        from: fromStationData,
        to: toStationData,
        fare: fare,
        estimatedTime: estimatedTime,
        distance: distance,
        direction: tripDirection,
        route: routeStations,
        paymentMethod: category,
        line: 'LRT-2'
      };

      setResult(routeResult);
        toast.success(`Route calculated: ₱${fare} • ${estimatedTime} min`);
      
      // auto scroll
      setTimeout(() => {
        if (routeDetailsRef.current) {
          routeDetailsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 600);

    } catch (err) {
      console.error('Route calculation error:', err);
      setError(err.message || 'Failed to calculate route');
      toast.error('Failed to calculate route');    } finally {
      setIsLoading(false);
    }
  }, [fromStation, toStation, availableFromStations, calculateFare, calculateDirection, category]);
  useEffect(() => {
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 1000);
  }, []);

  useEffect(() => {
    if (fromStation && toStation) {
      const debounced = _.debounce(calculateRoute, 300);
      debounced();
      return () => debounced.cancel();
    }
  }, [fromStation, toStation, category, calculateRoute]);

  useEffect(() => {
    if (initialFromStation?.station_id && !fromStation) {
      handleFromStationChange(initialFromStation.station_id);
    }
  }, [initialFromStation, fromStation, handleFromStationChange]);

  // payments
  const paymentMethods = [
    {
      id: 'sjt',
      name: 'Single Journey Ticket',
      description: 'Standard paper ticket',
      icon: '🎫'
    },
    {
      id: 'beep',
      name: 'Beep Card',
      description: 'Stored value discount',
      icon: '💳'
    },
    {
      id: 'discounted',
      name: 'PWD/Senior',
      description: '20% discount',
      icon: '👥'
    }
  ];

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
  }, []);

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
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">🚆</span>
            </div>            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">LRT-2 Route Planner</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Purple Line • Recto ↔ Antipolo</p>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Station
              </label>              <select
                value={fromStation}
                onChange={(e) => handleFromStationChange(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23374151' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5em'
                }}
              >
                <option value="">Select departure station</option>
                {availableFromStations.map((station) => (
                  <option 
                    key={station.station_id} 
                    value={station.station_id}
                    disabled={isStopDisabled(station.station_id)}
                  >
                    {station.name}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Station
              </label>              <select
                value={toStation}
                onChange={(e) => handleToStationChange(e.target.value)}
                disabled={!fromStation}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%23374151' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1.5em'
                }}
              >
                <option value="">Select destination station</option>
                {availableToStations.map((station) => (
                  <option 
                    key={station.station_id} 
                    value={station.station_id}
                  >
                    {station.name} ({station.municipality})
                  </option>
                ))}
              </select>
            </motion.div>

           <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-1 gap-2">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    onClick={() => setCategory(method.id)}                    className={`p-3 rounded-lg border-2 text-left transition-all duration-200 ${
                      category === method.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500 ring-opacity-20'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 hover:bg-purple-25 dark:hover:bg-purple-900/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={selectTransition}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{method.icon}</span>                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{method.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{method.description}</div>
                      </div>
                      {category === method.id && (
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
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
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        PWD/Senior Citizen Discount
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        To avail of the 20% discount, please consult the nearest LRT-2 ticket booth or station personnel. 
                        You may need to present valid identification or discount cards.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 order-2 lg:order-2"
          variants={itemVariants}
        >
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="placeholder"
                className="text-center py-12"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚆</span>
                </div>                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Plan Your LRT-2 Journey</h3>
                <p className="text-gray-500 dark:text-gray-400">Select your departure and destination stations to see route details, fare, and travel time.</p>
              </motion.div>
            ) : (              <motion.div
                key="results"
                variants={fadeVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div ref={routeDetailsRef} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Trip Summary</h3>
                    <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                      <span className="hidden sm:block capitalize">{result.direction}</span>
                      <span className="sm:hidden text-lg">
                        {result.direction === 'eastbound' ? '→' : '←'}
                      </span>
                      <span>•</span>
                      <span>{result.distance} station{result.distance !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">₱{result.fare}</div>                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {paymentMethods.find(p => p.id === category)?.name}
                        {category === 'beep' && result.fare < 15 && (
                          <span className="block text-xs text-green-600 dark:text-green-400">₱2 saved</span>
                        )}
                        {category === 'discounted' && (
                          <span className="block text-xs text-green-600 dark:text-green-400">20% discount</span>
                        )}
                      </div>
                    </div>                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{result.estimatedTime}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">minutes</div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Route Details</h4>
                    <button
                      onClick={() => setShowCommuteDetails(!showCommuteDetails)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                    >
                      {showCommuteDetails ? 'hide commute details' : 'see commute details'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {result.route.map((station, index) => {
                      const isStart = station.station_id === result.from.station_id;
                      const isEnd = station.station_id === result.to.station_id;
                      const isExpanded = expandedStations.has(station.station_id);
                      const uniqueConnections = getUniqueConnectionTypes(station);

                      return (                        <motion.div
                          key={station.station_id}
                          className={`relative cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 ${
                            !showCommuteDetails && uniqueConnections.length > 0 ? 'hover:shadow-md' : ''
                          }`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => !showCommuteDetails && uniqueConnections.length > 0 && toggleStationExpansion(station.station_id)}
                          whileHover={{ scale: !showCommuteDetails && uniqueConnections.length > 0 ? 1.02 : 1 }}
                          whileTap={{ scale: !showCommuteDetails && uniqueConnections.length > 0 ? 0.98 : 1 }}
                        >
                          <div className="flex items-start gap-3">

                            <div className="flex flex-col items-center">
                              <div className="text-lg">
                                {isStart ? '🟢' : isEnd ? '🔴' : '🔵'}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 dark:text-white">{station.name}</h5>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{station.municipality}</p>
                                  
                                  {uniqueConnections.length > 0 && (
                                    <div className="flex items-center gap-1 mt-1">
                                      {uniqueConnections.map((icon, idx) => (
                                        <span key={idx} className="text-sm">{icon}</span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {!showCommuteDetails && uniqueConnections.length > 0 && (
                                  <div className="text-xs text-purple-600 dark:text-purple-400 ml-2 pointer-events-none">
                                    {isExpanded ? '▲' : '▼'}
                                  </div>
                                )}
                              </div>                              {!showCommuteDetails && isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ 
                                    duration: 0.3, 
                                    ease: "easeInOut",
                                    height: { type: "spring", stiffness: 300, damping: 30 }
                                  }}
                                  className="mt-3 pl-4 border-l-2 border-purple-200 dark:border-purple-600 overflow-hidden"
                                >
                                  <StopConnections 
                                    connections={station.connections} 
                                    landmarks={station.nearby_landmarks}
                                    showExpanded={true}
                                  />
                                </motion.div>
                              )}
                              {showCommuteDetails && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-3 pl-4 border-l-2 border-purple-200 dark:border-purple-600"
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
                      );
                    })}
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <div>Operating Hours: 5:00 AM - 9:30 PM</div>
                    <div>Frequency: 4-6 minutes (peak), 6-8 minutes (off-peak)</div>
                    <div>Flat Rate: ₱15 (SJT), ₱13 (Beep Card), ₱12 (PWD/Senior)</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {error && (
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
              <p className="mt-1 text-sm">{error}</p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              className="flex items-center justify-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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

LRT2RoutePlanner.propTypes = {
  initialFromStation: PropTypes.object,
  onRouteChange: PropTypes.func,
};