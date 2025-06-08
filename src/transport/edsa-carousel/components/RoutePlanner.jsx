import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Tooltip from '../../../components/Tooltip';
import AlertPopup from '../../../components/AlertPopup';
import StopConnections from '../../shared/StopConnections';
import SocialMediaIcon from '../../../components/SocialMediaIcon';
import _ from 'lodash';
import { useAlerts } from '../../../context/AlertContext';
import { usePWA } from '../../../hooks/usePWA';
import { useTransportData, useRoutePlanner } from '../../shared/hooks/useTransport';
import { getConnectionIcon } from '../../shared/utils/connectionUtils.jsx';
import { TRANSPORT_TYPES } from '../../shared/config/transportConfig';

// Animation variants
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

/**
 * EDSA Carousel Route Planner Component
 * 
 * A component that allows users to plan their journey using the EDSA Carousel BRT system by selecting
 * start and end stops, calculating fares and estimated travel time with distance-based pricing.
 * 
 * @component
 * @param {Object} props
 * @param {Object} [props.initialFromStop] - Optional initial 'from' stop to pre-populate
 */
export default function EDSACarouselRoutePlanner({ initialFromStop, onRouteChange }) {
  const { isStopDisabled, getStopAlerts } = useAlerts();
  const { trackEngagement } = usePWA();
  
  // Use unified transport data system
  const { data: transportData, loading: dataLoading, error: dataError } = useTransportData(TRANSPORT_TYPES.EDSA_CAROUSEL);
  const { 
    route, 
    fare, 
    loading: routeLoading, 
    error: routeError, 
    calculateRoute, 
    clearRoute, 
    getPaymentMethods 
  } = useRoutePlanner(TRANSPORT_TYPES.EDSA_CAROUSEL);
  
  const [fromStop, setFromStop] = useState("");
  const [toStop, setToStop] = useState("");
  const [category, setCategory] = useState("regular"); // Passenger category
  const [direction, setDirection] = useState('southbound');
  const [availableToStops, setAvailableToStops] = useState([]);
  const [expandedLandmarks, setExpandedLandmarks] = useState(new Set());
  const [expandedStops, setExpandedStops] = useState(new Set());
  const [showCommuteDetails, setShowCommuteDetails] = useState(false);
  const [alertPopup, setAlertPopup] = useState({
    isOpen: false,
    alerts: []
  });

  // Loading and error states from unified system
  const isLoading = dataLoading || routeLoading;
  const error = dataError || routeError;

  // Payment methods from unified config
  const paymentMethods = getPaymentMethods();

  // Handle disabled stop selection
  const handleDisabledStopClick = useCallback((stopId) => {
    const alerts = getStopAlerts(stopId);
    setAlertPopup({
      isOpen: true,
      alerts: alerts
    });
  }, [getStopAlerts]);  // Memoize the available stops
  const availableFromStops = React.useMemo(() => 
    transportData?.stations ? transportData.stations.sort((a, b) => a.sequence - b.sequence) : []
  , [transportData?.stations]);
  // Update available destination stops when origin changes
  useEffect(() => {
    if (fromStop && transportData?.stations) {
      const fromStopData = transportData.stations.find(s => s.stop_id === fromStop);
      if (fromStopData) {
        // Filter out the selected origin and any disabled stops
        const available = transportData.stations.filter(stop => 
          stop.stop_id !== fromStop && !isStopDisabled(stop.stop_id)
        );
        setAvailableToStops(available);
        
        // Reset destination if it's the same as origin or disabled
        if (toStop === fromStop || isStopDisabled(toStop)) {
          setToStop("");
        }
      }
    } else {
      setAvailableToStops([]);
      setToStop("");
    }
  }, [fromStop, toStop, isStopDisabled, transportData?.stations]);
  // Set initial from stop if provided
  useEffect(() => {
    if (initialFromStop && initialFromStop.stop_id && !fromStop) {
      setFromStop(initialFromStop.stop_id);
    }
  }, [initialFromStop, fromStop]);  // Handle route calculation using unified system
  const handleCalculateRoute = useCallback(async () => {
    if (!fromStop || !toStop) {
      return;
    }

    try {
      const result = await calculateRoute(fromStop, toStop, category);
      
      if (result?.route) {
        // Track PWA engagement for route planning
        trackEngagement('ROUTE_PLANNED', {
          transportType: 'EDSA Carousel',
          from: result.route.fromStation?.name,
          to: result.route.toStation?.name,
          fare: result.fare,
          distance: result.route.distance
        });

        // Notify parent component of route change
        if (onRouteChange) {
          onRouteChange(result.route);
        }

        // Show success toast
        toast.success(`Route calculated: ₱${result.fare} (${result.route.distance}km)`);
      }
    } catch (err) {
      console.error('Route calculation error:', err);
      toast.error(err.message || "Failed to calculate route");
    }
  }, [fromStop, toStop, category, onRouteChange]);

  // Trigger calculation when inputs change
  useEffect(() => {
    if (fromStop && toStop && fromStop !== toStop) {
      const debounced = _.debounce(handleCalculateRoute, 300);
      debounced();
      return () => debounced.cancel();
    }
  }, [fromStop, toStop, category]);
  // Get unique connection types for filtering
  const getUniqueConnectionTypes = useCallback((stops) => {
    const types = new Set();
    stops.forEach(stop => {
      const details = transportData?.stopDetails?.[stop.stop_id];
      if (details && details.connections) {
        Object.keys(details.connections).forEach(type => {
          if (details.connections[type] && details.connections[type].length > 0) {
            types.add(type);
          }
        });
      }
    });
    return Array.from(types);
  }, [transportData?.stopDetails]);

  // Toggle landmarks expansion for a stop
  const toggleLandmarks = useCallback((stopId) => {
    setExpandedLandmarks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stopId)) {
        newSet.delete(stopId);
      } else {
        newSet.add(stopId);
      }
      return newSet;
    });
  }, []);

  // Toggle stop details expansion
  const toggleStopDetails = useCallback((stopId) => {
    setExpandedStops(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stopId)) {
        newSet.delete(stopId);
      } else {
        newSet.add(stopId);
      }
      return newSet;
    });
  }, []);

  // Handle stop selection with disabled check
  const handleStopSelection = useCallback((stopId, isFromStop = true) => {
    if (isStopDisabled(stopId)) {
      handleDisabledStopClick(stopId);
      return;
    }

    if (isFromStop) {
      setFromStop(stopId);
    } else {
      setToStop(stopId);
    }
  }, [isStopDisabled, handleDisabledStopClick]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >        <motion.h1 
          variants={itemVariants}
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          EDSA Carousel Route Planner
        </motion.h1>
        <motion.p 
          variants={itemVariants}
          className="text-gray-600 dark:text-gray-300"
        >
          Plan your journey from Monumento to PITX via EDSA BRT
        </motion.p>
      </motion.div>

      {/* Route Selection Form */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        <LayoutGroup>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* From Stop */}
            <motion.div layout className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                From Stop
              </label>
              <motion.select
                layout
                value={fromStop}
                onChange={(e) => handleStopSelection(e.target.value, true)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-orange-500 focus:border-orange-500 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                transition={selectTransition}
              >                <option value="">Select origin stop</option>
                {availableFromStops.map(stop => {
                  const isDisabled = isStopDisabled(stop.stop_id);
                  const connectionIcon = getConnectionIcon(stop, transportData?.stopDetails);
                  
                  return (
                    <option 
                      key={stop.stop_id} 
                      value={stop.stop_id}
                      disabled={isDisabled}
                      className={isDisabled ? 'text-gray-400' : ''}
                    >
                      {stop.name} {connectionIcon} {isDisabled ? '(Closed)' : ''}
                    </option>
                  );
                })}
              </motion.select>
            </motion.div>

            {/* To Stop */}
            <motion.div layout className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                To Stop
              </label>
              <motion.select
                layout
                value={toStop}
                onChange={(e) => handleStopSelection(e.target.value, false)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-orange-500 focus:border-orange-500 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !fromStop}
                transition={selectTransition}
              >                <option value="">Select destination stop</option>
                {availableToStops.map(stop => {
                  const connectionIcon = getConnectionIcon(stop, transportData?.stopDetails);
                  
                  return (
                    <option key={stop.stop_id} value={stop.stop_id}>
                      {stop.name} {connectionIcon}
                    </option>
                  );
                })}
              </motion.select>
            </motion.div>            {/* Passenger Category */}
            <motion.div layout className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Passenger Category
              </label>
              <motion.select
                layout
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                transition={selectTransition}              >
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </motion.select>
            </motion.div>
          </div>
        </LayoutGroup>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center justify-center py-4"
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              <span className="ml-2 text-orange-600 dark:text-orange-400">Calculating route...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>      {/* Trip Summary */}
      <AnimatePresence>
        {route && (
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="bg-orange-50 dark:bg-orange-900/20 rounded-xl shadow-lg p-6 border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-orange-600 dark:text-orange-400">
                Trip Summary
              </h2>              <div className="text-sm text-orange-600 dark:text-orange-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16v12H4V4zm14 2H6v8h12V6zM2 18h20v2H2v-2z" />
                  <rect x="6" y="8" width="3" height="4" />
                  <rect x="11" y="8" width="3" height="4" />
                  <rect x="16" y="8" width="2" height="4" />
                </svg>
                {route.direction === 'southbound' ? '→ PITX' : '→ Monumento'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ₱{route.fare}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {category.charAt(0).toUpperCase() + category.slice(1)} Fare
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {route.distance}km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {route.estimatedTime}min
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Estimated Time</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {route.numberOfStops}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Stops</div>
              </div>
            </div>

            {/* Route Details Toggle */}
            <button
              onClick={() => setShowCommuteDetails(!showCommuteDetails)}
              className="w-full bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 
                       text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg transition-colors duration-200 
                       flex items-center justify-center"
            >
              <InformationCircleIcon className="h-4 w-4 mr-2" />
              {showCommuteDetails ? 'Hide' : 'Show'} Route Details
            </button>

            {/* Expandable Route Details */}
            <AnimatePresence>
              {showCommuteDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="mt-4 space-y-4"
                >                  {/* Operating Info */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Operating Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Hours:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{route.operatingHours || "5:00 AM - 10:00 PM"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Frequency:</span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">{route.frequency || "5-10 minutes"}</span>
                      </div>
                    </div>
                  </div>                  {/* Route Path */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Route Path ({route.route?.length || 0} stops)
                    </h3>
                    <div className="space-y-2">
                      {route.route?.map((stop, index) => {
                        const isOrigin = stop.stop_id === route.fromStation?.stop_id;
                        const isDestination = stop.stop_id === route.toStation?.stop_id;
                        const connectionIcon = getConnectionIcon(stop, transportData?.stopDetails);
                        
                        return (
                          <motion.div
                            key={stop.stop_id}
                            variants={itemVariants}
                            className={`flex items-center p-2 rounded-lg transition-colors duration-200 ${
                              isOrigin || isDestination 
                                ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white 
                                          flex items-center justify-center text-sm font-medium mr-3">
                              {index + 1}
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <span className={`font-medium ${
                                  isOrigin || isDestination 
                                    ? 'text-orange-700 dark:text-orange-300' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {stop.name}
                                </span>
                                {connectionIcon && (
                                  <span className="ml-2 text-lg">{connectionIcon}</span>
                                )}
                                {(isOrigin || isDestination) && (
                                  <span className="ml-2 text-xs px-2 py-1 bg-orange-200 dark:bg-orange-800 
                                                 text-orange-700 dark:text-orange-300 rounded">
                                    {isOrigin ? 'Origin' : 'Destination'}
                                  </span>
                                )}
                              </div>
                              
                              {/* Stop Connections */}
                              <StopConnections 
                                stop={stop}
                                stopDetails={transportData?.stopDetails?.[stop.stop_id]}
                                isExpanded={expandedStops.has(stop.stop_id)}
                                onToggle={() => toggleStopDetails(stop.stop_id)}
                                colorScheme="orange"
                              />
                            </div>
                          </motion.div>
                        );
                      })}                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Social Media & Updates */}
            {transportData?.socials && (
              <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-700">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Follow {transportData.socials.transport_name}:</span>
                </div>                <div className="flex flex-wrap gap-2">
                  {transportData.socials.social_media
                    ?.filter(social => social.active)
                    .map((social, index) => (
                      <SocialMediaIcon
                        key={index}
                        platform={social.platform}
                        url={social.url}
                        className="!w-auto !h-auto !px-3 !py-1 !rounded-full !text-xs !font-medium
                                 !bg-orange-100 !text-orange-700 hover:!bg-orange-200 dark:!bg-orange-900/30 
                                 dark:!text-orange-300 dark:hover:!bg-orange-900/50 !transition-colors !duration-200"
                        size="sm"
                      />
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Popup */}
      <AlertPopup
        isOpen={alertPopup.isOpen}
        onClose={() => setAlertPopup({ isOpen: false, alerts: [] })}
        alerts={alertPopup.alerts}
      />
    </div>
  );
}

EDSACarouselRoutePlanner.propTypes = {
  initialFromStop: PropTypes.object,
  onRouteChange: PropTypes.func
};