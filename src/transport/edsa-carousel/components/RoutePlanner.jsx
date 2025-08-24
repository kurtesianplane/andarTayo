import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import BootstrapIcon from '../../../components/shared/BootstrapIcon';
import stopsData from '../data/stops.json';
import fareMatrixData from '../data/fareMatrix.json';

/**
 * Modern EDSA Carousel Route Planner Component
 * 
 * Features:
 * - Modern stop selection with search functionality
 * - Responsive design for all screen sizes
 * - Real-time fare calculation based on distance
 * - Clean, accessible interface
 * 
 * @component
 * @param {Object} props
 * @param {Object} [props.initialFromStop] - Optional initial 'from' stop to pre-populate
 * @param {Function} [props.onRouteChange] - Callback function when route changes
 */
export default function EDSACarouselRoutePlanner({ initialFromStop, onRouteChange }) {
  // State management
  const [fromStop, setFromStop] = useState('');
  const [toStop, setToStop] = useState('');
  const [passengerType, setPassengerType] = useState('regular');
  const [isCalculating, setIsCalculating] = useState(false);
  const [route, setRoute] = useState(null);
  const [error, setError] = useState(null);

  // Available stops sorted by sequence
  const availableStops = useMemo(() => {
    return stopsData.sort((a, b) => a.sequence - b.sequence);
  }, []);

  // Filter available destination stops based on selected origin
  const availableToStops = useMemo(() => {
    if (!fromStop) return [];
    return availableStops.filter(stop => stop.stop_id !== fromStop);
  }, [fromStop, availableStops]);
  // Passenger type options with proper descriptions
  const passengerTypes = [
    { id: 'regular', name: 'Regular Passenger', icon: 'person', description: 'Standard fare (₱15 base + ₱2.65/km)' },
    { id: 'student', name: 'Student', icon: 'book', description: '20% discount with valid student ID' },
    { id: 'pwd', name: 'Person with Disability', icon: 'person-wheelchair', description: '20% discount with PWD ID' },
    { id: 'senior', name: 'Senior Citizen', icon: 'person-cane', description: '20% discount with senior citizen ID' }
  ];

  // Calculate distance between two stops
  const calculateDistance = (stop1, stop2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    
    const lat1 = stop1.lat;
    const lon1 = stop1.lng;
    const lat2 = stop2.lat;
    const lon2 = stop2.lng;
    
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  // Calculate fare based on official EDSA Carousel fare matrix
  const calculateFare = (fromStopData, toStopData, type) => {
    try {
      // Determine direction based on stop sequences
      const direction = fromStopData.sequence < toStopData.sequence ? 'southbound' : 'northbound';
      
      // Get fare matrices from our data
      const fareMatrix = fareMatrixData[direction];
      
      if (fareMatrix && fareMatrix.fares) {
        const fromStopId = fromStopData.stop_id;
        const toStopId = toStopData.stop_id;
        
        // Try to get exact fare from matrix
        if (fareMatrix.fares[fromStopId] && fareMatrix.fares[fromStopId][toStopId]) {
          const baseFare = fareMatrix.fares[fromStopId][toStopId];
          
          // Apply discounts for special passenger types
          switch (type) {
            case 'student':
            case 'pwd':
            case 'senior':
              return Math.round(baseFare * 0.8 * 100) / 100; // 20% discount
            default:
              return baseFare;
          }
        }
      }
      
      // Fallback to distance-based calculation using official rates
      const distance = calculateDistance(fromStopData, toStopData);
      const fareConfig = fareMatrixData[type] || fareMatrixData.regular;
      const { base_fare, per_km, min_km } = fareConfig;
      
      if (distance <= min_km) {
        return base_fare;
      }
      
      const additionalKm = distance - min_km;
      return Math.round((base_fare + (additionalKm * per_km)) * 100) / 100;
      
    } catch (error) {
      console.error('Fare calculation error:', error);
      // Return minimum fare as fallback
      return 15.00;
    }
  };

  // Get route path between two stops
  const getRoutePath = (fromStopId, toStopId) => {
    const fromStopData = availableStops.find(s => s.stop_id === fromStopId);
    const toStopData = availableStops.find(s => s.stop_id === toStopId);
    
    if (!fromStopData || !toStopData) return [];

    const fromSequence = fromStopData.sequence;
    const toSequence = toStopData.sequence;
    
    const start = Math.min(fromSequence, toSequence);
    const end = Math.max(fromSequence, toSequence);
    
    return availableStops
      .filter(stop => stop.sequence >= start && stop.sequence <= end)
      .sort((a, b) => fromSequence < toSequence ? a.sequence - b.sequence : b.sequence - a.sequence);
  };

  // Handle route calculation
  const handleCalculateRoute = async () => {
    if (!fromStop || !toStop || fromStop === toStop) {
      setRoute(null);
      setError(null);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const fromStopData = availableStops.find(s => s.stop_id === fromStop);
      const toStopData = availableStops.find(s => s.stop_id === toStop);
      
      if (!fromStopData || !toStopData) {
        throw new Error('Invalid stop selection');
      }      const distance = calculateDistance(fromStopData, toStopData);
      const fare = calculateFare(fromStopData, toStopData, passengerType);
      const routePath = getRoutePath(fromStop, toStop);
      const estimatedTime = Math.round(distance * 2.5); // Rough estimate: 2.5 minutes per km

      const routeData = {
        fromStation: fromStopData,
        toStation: toStopData,
        distance: Math.round(distance * 100) / 100,
        fare: fare,
        estimatedTime: estimatedTime,
        numberOfStops: routePath.length,
        passengerType: passengerType,
        route: routePath,
        direction: fromStopData.sequence < toStopData.sequence ? 'southbound' : 'northbound'
      };

      setRoute(routeData);
      
      // Notify parent component
      if (onRouteChange) {
        onRouteChange(routeData);
      }

    } catch (err) {
      setError(err.message || 'Failed to calculate route');
      setRoute(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate route when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleCalculateRoute();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fromStop, toStop, passengerType]);

  // Set initial from stop if provided
  useEffect(() => {
    if (initialFromStop?.stop_id && !fromStop) {
      setFromStop(initialFromStop.stop_id);
    }
  }, [initialFromStop, fromStop]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BootstrapIcon 
              name="bus-front" 
              className="text-orange-600 dark:text-orange-400 text-4xl"
            />
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              EDSA Carousel
            </h1>
          </div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-orange-600 dark:text-orange-400 mb-2">
            Route Planner
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Plan your BRT journey along EDSA from Monumento to PITX with real-time fare calculation
          </p>
        </div>

        {/* Route Selection Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <BootstrapIcon name="geo-alt" className="text-orange-600 dark:text-orange-400" />
            Plan Your Journey
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* From Stop */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <BootstrapIcon name="play-circle" className="inline mr-1 text-green-600" />
                From Stop
              </label>
              <select
                value={fromStop}
                onChange={(e) => setFromStop(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                         transition-all duration-200 disabled:opacity-50"
                disabled={isCalculating}
              >
                <option value="">Select origin stop...</option>
                {availableStops.map(stop => (
                  <option key={stop.stop_id} value={stop.stop_id}>
                    {stop.name}
                    {stop.connections?.rail?.length > 0 && ` 🚊`}
                  </option>
                ))}
              </select>
            </div>

            {/* To Stop */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <BootstrapIcon name="geo-alt-fill" className="inline mr-1 text-red-600" />
                To Stop
              </label>
              <select
                value={toStop}
                onChange={(e) => setToStop(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                         transition-all duration-200 disabled:opacity-50"
                disabled={isCalculating || !fromStop}
              >
                <option value="">Select destination stop...</option>
                {availableToStops.map(stop => (
                  <option key={stop.stop_id} value={stop.stop_id}>
                    {stop.name}
                    {stop.connections?.rail?.length > 0 && ` 🚊`}
                  </option>
                ))}
              </select>
            </div>

            {/* Passenger Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <BootstrapIcon name="person" className="inline mr-1 text-blue-600" />
                Passenger Type
              </label>
              <select
                value={passengerType}
                onChange={(e) => setPassengerType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                         transition-all duration-200"
              >
                {passengerTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isCalculating && (
            <div className="mt-6 flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mr-3"></div>
              <span className="text-orange-600 dark:text-orange-400">Calculating route...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center">
                <BootstrapIcon name="exclamation-triangle" className="text-red-500 mr-2" />
                <span className="text-red-700 dark:text-red-300">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Trip Summary */}
        {route && !isCalculating && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BootstrapIcon name="card-checklist" className="text-orange-600 dark:text-orange-400" />
                Trip Summary
              </h3>
              <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                <BootstrapIcon name={route.direction === 'southbound' ? 'arrow-down' : 'arrow-up'} />
                {route.direction === 'southbound' ? 'To PITX' : 'To Monumento'}
              </div>
            </div>

            {/* Trip Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400">
                  ₱{route.fare}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {route.passengerType} Fare
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {route.distance}km
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Distance</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400">
                  ~{route.estimatedTime}min
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Est. Time</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {route.numberOfStops}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Stops</div>
              </div>
            </div>

            {/* Route Path */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BootstrapIcon name="map" className="text-orange-600 dark:text-orange-400" />
                Route Path ({route.numberOfStops} stops)
              </h4>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {route.route.map((stop, index) => {
                  const isOrigin = stop.stop_id === route.fromStation.stop_id;
                  const isDestination = stop.stop_id === route.toStation.stop_id;
                  
                  return (
                    <div
                      key={stop.stop_id}
                      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
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
                        <div className="flex items-center justify-between">
                          <span className={`font-medium ${
                            isOrigin || isDestination 
                              ? 'text-orange-700 dark:text-orange-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {stop.name}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {stop.connections?.rail?.length > 0 && (
                              <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                <BootstrapIcon name="train-front" className="text-xs" />
                                {stop.connections.rail.join(', ')}
                              </span>
                            )}
                            
                            {(isOrigin || isDestination) && (
                              <span className="text-xs px-2 py-1 bg-orange-200 dark:bg-orange-800 
                                             text-orange-700 dark:text-orange-300 rounded">
                                {isOrigin ? 'Origin' : 'Destination'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {stop.features?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {stop.features.includes('covered_waiting_area') && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">🏠 Covered</span>
                            )}
                            {stop.features.includes('cctv') && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">📹 CCTV</span>
                            )}
                            {stop.features.includes('lrt_connection') && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">🚊 Rail Connection</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>            {/* Fare Breakdown */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BootstrapIcon name="calculator" className="text-orange-600 dark:text-orange-400" />
                Fare Information
              </h4>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Route:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {route.fromStation.name} → {route.toStation.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Direction:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">
                      {route.direction} ({route.direction === 'southbound' ? 'To PITX' : 'To Monumento'})
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Distance:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{route.distance} km</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Passenger Type:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {passengerTypes.find(p => p.id === route.passengerType)?.name || 'Regular'}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Official EDSA Carousel Fare Structure:
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    • Base fare: ₱15.00 for first 4 kilometers<br/>
                    • Additional: ₱2.65 per kilometer thereafter<br/>
                    {route.passengerType !== 'regular' && (
                      <span>• Special discount: 20% off regular fare</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-gray-300 dark:border-gray-600">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Fare:</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">₱{route.fare}</span>
                    {route.passengerType !== 'regular' && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        (20% discount applied)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {route && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => {
                setFromStop(toStop);
                setToStop(fromStop);
              }}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg 
                       transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <BootstrapIcon name="arrow-repeat" />
              Swap Origin & Destination
            </button>
            
            <button 
              onClick={() => {
                setFromStop('');
                setToStop('');
                setRoute(null);
                setError(null);
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg 
                       transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <BootstrapIcon name="arrow-clockwise" />
              Plan New Route
            </button>
          </div>
        )}

        {/* Information Footer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <BootstrapIcon 
              name="info-circle" 
              className="text-blue-600 dark:text-blue-400 text-xl mt-0.5"
            />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Official EDSA Carousel Information
              </h4>
              <div className="text-blue-700 dark:text-blue-300 text-sm space-y-2">
                <p>
                  Fare calculations are based on the official EDSA Carousel fare matrix. 
                  The BRT system operates from Monumento (Caloocan) to PITX (Pasay) with 21 stops.
                </p>
                <p>
                  <strong>Fare Structure:</strong> ₱15 minimum fare for the first 4 kilometers, 
                  then ₱2.65 for every succeeding kilometer.
                </p>
                <p>
                  <strong>Discounts:</strong> Students, PWDs, and Senior Citizens get 20% discount 
                  with valid identification.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a 
                    href="https://edsacarousel.com/bus-fare/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 
                             text-blue-700 dark:text-blue-300 rounded-lg text-xs hover:bg-blue-200 
                             dark:hover:bg-blue-700 transition-colors"
                  >
                    <BootstrapIcon name="link-45deg" className="text-xs" />
                    Official Fare Matrix
                  </a>
                  <a 
                    href="https://edsacarousel.com/bus-route/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 
                             text-blue-700 dark:text-blue-300 rounded-lg text-xs hover:bg-blue-200 
                             dark:hover:bg-blue-700 transition-colors"
                  >
                    <BootstrapIcon name="map" className="text-xs" />
                    Route Map
                  </a>
                  <a 
                    href="https://edsacarousel.com/bus-schedule/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-800 
                             text-blue-700 dark:text-blue-300 rounded-lg text-xs hover:bg-blue-200 
                             dark:hover:bg-blue-700 transition-colors"
                  >
                    <BootstrapIcon name="clock" className="text-xs" />
                    Schedule
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

EDSACarouselRoutePlanner.propTypes = {
  initialFromStop: PropTypes.object,
  onRouteChange: PropTypes.func,
};