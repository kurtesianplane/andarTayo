import { 
  TRANSPORT_CONFIG, 
  FARE_CALCULATION_TYPES, 
  MRT3_FARE_TIERS 
} from '../config/transportConfig.js';

export class FareCalculator {
  constructor(transportType) {
    this.config = TRANSPORT_CONFIG[transportType];
    this.transportType = transportType;
  }

  async loadFareMatrix() {
    if (this.fareMatrix) return this.fareMatrix;
    
    try {
      const fareMatrixModule = await import(`../../${this.config.dataPath}/data/fareMatrix.json`);
      this.fareMatrix = fareMatrixModule.default;
      return this.fareMatrix;
    } catch (error) {
      console.error(`Failed to load fare matrix for ${this.config.name}:`, error);
      throw new Error(`Fare data unavailable for ${this.config.name}`);
    }
  }

  async calculateFare(fromStation, toStation, paymentMethod) {
    const calculationType = this.config.fareCalculationType;

    switch (calculationType) {
      case FARE_CALCULATION_TYPES.MATRIX:
        return this.calculateMatrixFare(fromStation, toStation, paymentMethod);
      
      case FARE_CALCULATION_TYPES.DISTANCE_BASED:
        return this.calculateDistanceBasedFare(fromStation, toStation, paymentMethod);
      
      case FARE_CALCULATION_TYPES.DISTANCE_TIERS:
        return this.calculateDistanceTierFare(fromStation, toStation, paymentMethod);
      
      default:
        throw new Error(`Unknown fare calculation type: ${calculationType}`);
    }
  }  async calculateMatrixFare(fromStation, toStation, paymentMethod) {
    const fareMatrix = await this.loadFareMatrix();

    let fareKey;
    let applyDiscount = false;
    
    switch (paymentMethod) {
      case 'sjt':
        fareKey = 'single_journey';
        break;
      case 'beep':
        fareKey = 'beep_card';
        break;
      case 'discounted':
        // First try to find dedicated discounted_beep fare matrix
        if (fareMatrix['discounted_beep']) {
          fareKey = 'discounted_beep';
        } else {
          // Fall back to single journey with 20% discount
          fareKey = 'single_journey';
          applyDiscount = true;
        }
        break;
      default:
        fareKey = 'single_journey';
    }

    // Check if fare matrix has the fare key
    if (!fareMatrix[fareKey]) {
      throw new Error(`Fare data not found for payment method: ${paymentMethod}`);
    }

    // Get station names for lookup
    const fromStationName = fromStation.name;
    const toStationName = toStation.name;

    // Check if stations exist in fare matrix
    if (!fareMatrix[fareKey][fromStationName]) {
      throw new Error(`Fare data not found for station: ${fromStationName}`);
    }

    // Get fare by station names - fareMatrix uses station names as keys, and values are arrays indexed by station order
    const stationOrder = fareMatrix.stations || Object.keys(fareMatrix[fareKey]);
    const toIndex = stationOrder.indexOf(toStationName);
    
    if (toIndex === -1) {
      throw new Error(`Station ${toStationName} not found in fare matrix`);
    }    const fare = fareMatrix[fareKey][fromStationName][toIndex];
    if (fare === undefined || fare === null) {
      throw new Error(`No fare data available for route from ${fromStationName} to ${toStationName}`);
    }

    // Apply 20% discount if needed
    if (applyDiscount) {
      return Math.round(fare * 0.8);
    }

    return fare;
  }
  async calculateDistanceBasedFare(fromStation, toStation, paymentMethod) {
    const fareMatrix = await this.loadFareMatrix();
    this.fareMatrix = fareMatrix; // Store for distance calculation
    
    const distance = this.calculateDistance(fromStation, toStation);

    const paymentConfig = fareMatrix[paymentMethod];
    if (!paymentConfig) {
      throw new Error(`Payment method ${paymentMethod} not supported`);
    }

    const { base_fare, min_km, per_km } = paymentConfig;

    if (distance <= min_km) {
      return base_fare;
    }

    return base_fare + ((distance - min_km) * per_km);
  }
  calculateDistanceTierFare(fromStation, toStation, paymentMethod) {
    const distance = this.calculateDistance(fromStation, toStation);
    
    // For MRT-3, distance is the number of stations traveled
    // If traveling from station 1 to station 3, that's 2 stations traveled (3-1=2)
    const stationsTraversed = distance;
    
    // Find the appropriate fare tier
    const tier = MRT3_FARE_TIERS.find(tier => 
      stationsTraversed >= tier.minDistance && stationsTraversed <= tier.maxDistance
    );

    if (!tier) {
      // If distance exceeds max tier, use the highest tier fare
      const maxTier = MRT3_FARE_TIERS[MRT3_FARE_TIERS.length - 1];
      return maxTier.fare;
    }

    // Apply discounts for PWD/Senior
    if (paymentMethod === 'discounted') {
      return Math.round(tier.fare * 0.8); // 20% discount
    }

    return tier.fare;
  }
  calculateDistance(fromStation, toStation) {
    // For rail systems, distance is based on station sequence difference
    if (this.config.type === 'rail') {
      return Math.abs(toStation.sequence - fromStation.sequence);
    }

    // For BRT systems, use actual distance if available
    if (fromStation.distance !== undefined && toStation.distance !== undefined) {
      return Math.abs(toStation.distance - fromStation.distance);
    }

    // For EDSA Carousel, try to get distance from fare matrix
    if (this.transportType === 'edsa-carousel' && this.fareMatrix) {
      const fromStationName = fromStation.name || fromStation.stop_id;
      const toStationName = toStation.name || toStation.stop_id;
      
      // Try to get distance from northbound or southbound data
      const northbound = this.fareMatrix.northbound;
      const southbound = this.fareMatrix.southbound;
      
      if (northbound && northbound[fromStationName] && northbound[fromStationName][toStationName]) {
        return northbound[fromStationName][toStationName];
      }
      
      if (southbound && southbound[fromStationName] && southbound[fromStationName][toStationName]) {
        return southbound[fromStationName][toStationName];
      }
      
      // If not found in matrix, calculate based on coordinates
      if (fromStation.lat && fromStation.lng && toStation.lat && toStation.lng) {
        return this.calculateHaversineDistance(fromStation, toStation);
      }
    }

    // Fallback to sequence-based calculation
    return Math.abs(toStation.sequence - fromStation.sequence);
  }

  calculateHaversineDistance(station1, station2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (station2.lat - station1.lat) * Math.PI / 180;
    const dLng = (station2.lng - station1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(station1.lat * Math.PI / 180) * Math.cos(station2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  getPaymentMethods() {
    return this.config.paymentMethods;
  }
}

// Convenience functions for backward compatibility
export const createFareCalculator = (transportType) => {
  return new FareCalculator(transportType);
};

export const calculateFare = async (transportType, fromStation, toStation, paymentMethod) => {
  const calculator = new FareCalculator(transportType);
  return calculator.calculateFare(fromStation, toStation, paymentMethod);
};
