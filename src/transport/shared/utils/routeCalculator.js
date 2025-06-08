import { TRANSPORT_CONFIG } from '../config/transportConfig.js';
import { getDataLoader } from './dataLoader.js';

export class RouteCalculator {
  constructor(transportType) {
    this.config = TRANSPORT_CONFIG[transportType];
    this.transportType = transportType;
    this.dataLoader = getDataLoader(transportType);
  }

  async calculateRoute(fromStationId, toStationId) {
    const stations = await this.dataLoader.loadStations();
    
    const fromStation = stations.find(s => s.station_id === fromStationId);
    const toStation = stations.find(s => s.station_id === toStationId);
    
    if (!fromStation || !toStation) {
      throw new Error('Invalid station selection');
    }

    if (fromStationId === toStationId) {
      throw new Error('Origin and destination cannot be the same');
    }

    const direction = this.calculateDirection(fromStation, toStation);
    const route = this.buildRoute(stations, fromStation, toStation);
    const distance = Math.abs(toStation.sequence - fromStation.sequence);
    const estimatedTime = this.calculateEstimatedTime(distance);

    return {
      fromStation,
      toStation,
      route,
      direction,
      distance,
      estimatedTime,
      transportType: this.transportType
    };
  }
  calculateDirection(fromStation, toStation) {
    if (this.transportType === 'edsa-carousel') {
      return fromStation.sequence < toStation.sequence ? 'northbound' : 'southbound';
    }
    
    if (this.transportType === 'lrt-2') {
      return fromStation.sequence < toStation.sequence ? 'eastbound' : 'westbound';
    }
    
    // For LRT-1 and MRT-3 (North-South rail systems)
    return fromStation.sequence < toStation.sequence ? 'southbound' : 'northbound';
  }
  buildRoute(stations, fromStation, toStation) {
    const minSeq = Math.min(fromStation.sequence, toStation.sequence);
    const maxSeq = Math.max(fromStation.sequence, toStation.sequence);
    
    const routeStations = stations
      .filter(station => station.sequence >= minSeq && station.sequence <= maxSeq);
    
    // Sort based on travel direction
    if (fromStation.sequence < toStation.sequence) {
      // Going in ascending sequence order (southbound for rails, northbound for buses)
      return routeStations.sort((a, b) => a.sequence - b.sequence);
    } else {
      // Going in descending sequence order (northbound for rails, southbound for buses)
      return routeStations.sort((a, b) => b.sequence - a.sequence);
    }
  }

  calculateEstimatedTime(distance) {
    // Base time calculations vary by transport type
    const baseTimeConfig = {
      'lrt-1': { perStation: 2, baseTime: 3 },
      'lrt-2': { perStation: 2, baseTime: 3 },
      'mrt-3': { perStation: 2.5, baseTime: 4 },
      'edsa-carousel': { perStation: 3, baseTime: 5 }
    };

    const config = baseTimeConfig[this.transportType] || { perStation: 2, baseTime: 3 };
    return Math.round(distance * config.perStation + config.baseTime);
  }

  async filterStations(searchTerm = '') {
    const stations = await this.dataLoader.loadStations();
    
    if (!searchTerm.trim()) {
      return stations.sort((a, b) => a.sequence - b.sequence);
    }

    const searchLower = searchTerm.toLowerCase();
    return stations
      .filter(station => 
        station.name.toLowerCase().includes(searchLower) ||
        station.station_id.toLowerCase().includes(searchLower) ||
        (station.landmark && station.landmark.some(l => 
          l.toLowerCase().includes(searchLower)
        ))
      )
      .sort((a, b) => a.sequence - b.sequence);
  }

  async getStationById(stationId) {
    const stations = await this.dataLoader.loadStations();
    return stations.find(s => s.station_id === stationId);
  }

  async getStationsBySequenceRange(minSeq, maxSeq) {
    const stations = await this.dataLoader.loadStations();
    return stations
      .filter(station => station.sequence >= minSeq && station.sequence <= maxSeq)
      .sort((a, b) => a.sequence - b.sequence);
  }

  async validateRoute(fromStationId, toStationId) {
    const stations = await this.dataLoader.loadStations();
    
    const fromStation = stations.find(s => s.station_id === fromStationId);
    const toStation = stations.find(s => s.station_id === toStationId);
    
    const errors = [];
    
    if (!fromStation) {
      errors.push('Invalid origin station');
    }
    
    if (!toStation) {
      errors.push('Invalid destination station');
    }
    
    if (fromStationId === toStationId) {
      errors.push('Origin and destination cannot be the same');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      fromStation,
      toStation
    };
  }
}

// Convenience functions
export const createRouteCalculator = (transportType) => {
  return new RouteCalculator(transportType);
};

export const calculateRoute = async (transportType, fromStationId, toStationId) => {
  const calculator = new RouteCalculator(transportType);
  return calculator.calculateRoute(fromStationId, toStationId);
};
