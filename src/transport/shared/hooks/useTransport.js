import { useState, useEffect, useCallback } from 'react';
import { FareCalculator } from '../utils/fareCalculator.js';
import { RouteCalculator } from '../utils/routeCalculator.js';
import { getDataLoader } from '../utils/dataLoader.js';
import { TRANSPORT_CONFIG } from '../config/transportConfig.js';

export const useTransportData = (transportType) => {
  const [data, setData] = useState({
    stations: [],
    fareMatrix: null,
    socials: [],
    stopDetails: null,
    config: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loader = getDataLoader(transportType);
        const transportData = await loader.loadAllData();
        
        setData(transportData);
      } catch (err) {
        console.error(`Failed to load data for ${transportType}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (transportType) {
      loadData();
    }
  }, [transportType]);

  return { data, loading, error };
};

export const useRoutePlanner = (transportType) => {
  const [routeCalculator, setRouteCalculator] = useState(null);
  const [fareCalculator, setFareCalculator] = useState(null);
  const [route, setRoute] = useState(null);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transportType) {
      setRouteCalculator(new RouteCalculator(transportType));
      setFareCalculator(new FareCalculator(transportType));
    }
  }, [transportType]);  const calculateRoute = useCallback(async (fromStationId, toStationId, paymentMethod = 'sjt') => {
    if (!routeCalculator || !fareCalculator) return;

    try {
      setLoading(true);
      setError(null);

      const routeResult = await routeCalculator.calculateRoute(fromStationId, toStationId);
      const fareResult = await fareCalculator.calculateFare(
        routeResult.fromStation, 
        routeResult.toStation, 
        paymentMethod
      );

      // Calculate SJT fare for comparison purposes (needed for savings display)
      const sjtFareResult = paymentMethod !== 'sjt' 
        ? await fareCalculator.calculateFare(routeResult.fromStation, routeResult.toStation, 'sjt')
        : fareResult;

      // Add SJT fare to route object for savings comparison
      const enrichedRoute = {
        ...routeResult,
        sjtFare: sjtFareResult
      };

      setRoute(enrichedRoute);
      setFare(fareResult);

      return { route: enrichedRoute, fare: fareResult };
    } catch (err) {
      console.error('Route calculation failed:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [routeCalculator, fareCalculator]);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setFare(null);
    setError(null);
  }, []);

  const getPaymentMethods = useCallback(() => {
    return fareCalculator ? fareCalculator.getPaymentMethods() : [];
  }, [fareCalculator]);

  return {
    route,
    fare,
    loading,
    error,
    calculateRoute,
    clearRoute,
    getPaymentMethods,
    routeCalculator,
    fareCalculator
  };
};

export const useStationFilter = (transportType, searchTerm = '') => {
  const [filteredStations, setFilteredStations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const filterStations = async () => {
      try {
        setLoading(true);
        const calculator = new RouteCalculator(transportType);
        const stations = await calculator.filterStations(searchTerm);
        setFilteredStations(stations);
      } catch (err) {
        console.error('Station filtering failed:', err);
        setFilteredStations([]);
      } finally {
        setLoading(false);
      }
    };

    if (transportType) {
      filterStations();
    }
  }, [transportType, searchTerm]);

  return { filteredStations, loading };
};

export const useTransportConfig = (transportType) => {
  return TRANSPORT_CONFIG[transportType] || null;
};
