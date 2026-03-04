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
    let discountRate = 0;
    
    switch (paymentMethod) {
      case 'sjt':
        fareKey = 'single_journey';
        break;
      case 'beep':
        fareKey = 'beep_card';
        break;
      case 'student':
        // Students get 50% discount on SJT (per RA 11314)
        fareKey = 'single_journey';
        discountRate = 0.5;
        break;
      case 'discounted':
        // PWD/Senior get 50% discount (per RA 9994 for seniors, RA 7277 for PWD)
        fareKey = 'single_journey';
        discountRate = 0.5;
        break;
      default:
        fareKey = 'single_journey';
    }

    // Check if fare matrix has the fare key
    if (!fareMatrix[fareKey]) {
      throw new Error(`Fare data not found for payment method: ${paymentMethod}`);
    }

    // Get station names for lookup - normalize by removing parenthetical suffixes
    const normalizeStationName = (name) => {
      // Remove " (Formerly ...)" or " Station" suffixes
      return name
        .replace(/\s*\(Formerly[^)]*\)/gi, '')
        .replace(/\s*\(formerly[^)]*\)/gi, '')
        .replace(/\s+Station$/i, '')
        .trim();
    };

    const fromStationName = normalizeStationName(fromStation.name);
    const toStationName = normalizeStationName(toStation.name);

    // Get the station order from fareMatrix
    const stationOrder = fareMatrix.stations || Object.keys(fareMatrix[fareKey]);
    
    // Find matching station names (case-insensitive, with normalization)
    const findStationInMatrix = (targetName) => {
      // Try exact match first
      if (fareMatrix[fareKey][targetName]) return targetName;
      
      // Try normalized match
      const normalizedTarget = normalizeStationName(targetName).toLowerCase();
      for (const matrixStation of Object.keys(fareMatrix[fareKey])) {
        if (normalizeStationName(matrixStation).toLowerCase() === normalizedTarget) {
          return matrixStation;
        }
      }
      
      // Try partial match (station name contains or is contained by target)
      for (const matrixStation of Object.keys(fareMatrix[fareKey])) {
        const normalizedMatrix = normalizeStationName(matrixStation).toLowerCase();
        if (normalizedTarget.includes(normalizedMatrix) || normalizedMatrix.includes(normalizedTarget)) {
          return matrixStation;
        }
      }
      
      return null;
    };

    const fromMatrixKey = findStationInMatrix(fromStationName);
    const toMatrixKey = findStationInMatrix(toStationName);

    if (!fromMatrixKey) {
      throw new Error(`Fare data not found for station: ${fromStationName}`);
    }

    // Find the index of the destination station in the station order
    const findStationIndex = (targetName) => {
      const normalizedTarget = normalizeStationName(targetName).toLowerCase();
      return stationOrder.findIndex(s => 
        normalizeStationName(s).toLowerCase() === normalizedTarget ||
        normalizedTarget.includes(normalizeStationName(s).toLowerCase()) ||
        normalizeStationName(s).toLowerCase().includes(normalizedTarget)
      );
    };

    const toIndex = findStationIndex(toStationName);
    
    if (toIndex === -1) {
      throw new Error(`Station ${toStationName} not found in fare matrix`);
    }    const fare = fareMatrix[fareKey][fromMatrixKey][toIndex];
    if (fare === undefined || fare === null) {
      throw new Error(`No fare data available for route from ${fromStationName} to ${toStationName}`);
    }

    // Apply discount if needed
    if (discountRate > 0) {
      return Math.round(fare * (1 - discountRate));
    }

    return fare;
  }
  async calculateDistanceBasedFare(fromStation, toStation, paymentMethod) {
    const fareMatrix = await this.loadFareMatrix();
    this.fareMatrix = fareMatrix;
    
    // Check if fareMatrix has a MATRIX calculation type (new format)
    if (fareMatrix.calculation?.type === 'MATRIX' && fareMatrix.regular) {
      return this.calculateBRTMatrixFare(fromStation, toStation, paymentMethod, fareMatrix);
    }

    // Legacy distance-based calculation
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

  calculateBRTMatrixFare(fromStation, toStation, paymentMethod, fareMatrix) {
    // Normalize stop names to match fareMatrix keys
    const normalizeStopName = (name) => {
      return name
        .toLowerCase()
        .replace(/\s*\(formerly[^)]*\)/gi, '')
        .replace(/\s+station$/i, '')
        .replace(/\s*-\s*annapolis/i, '')  // Santolan-Annapolis -> santolan
        .replace(/\s*\/\s*one ayala/i, '')  // Ayala / One Ayala -> Ayala
        .replace(/\s*\/\s*fernando poe jr\.?/i, '')  // Roosevelt / Fernando Poe Jr. -> Roosevelt
        .replace(/\s*\/\s*ormoc/i, '')  // Philam / Ormoc -> Philam
        .replace(/\s+road$/i, '')  // Kaingin Road -> Kaingin
        .replace(/sm\s+mall\s+of\s+asia/i, 'sm_moa')
        .replace(/mall\s+of\s+asia/i, 'sm_moa')
        .replace(/sm\s+north\s+edsa/i, 'sm_north_edsa')
        .replace(/city\s+of\s+dreams/i, 'city_of_dreams')
        .replace(/ayala\s+malls\s+manila\s+bay/i, 'ayala_malls_manila_bay')
        .replace(/roxas\s+boulevard/i, 'roxas_blvd')
        .replace(/taft\s+avenue/i, 'taft_avenue')
        .replace(/north\s+avenue/i, 'north_avenue')
        .replace(/quezon\s+avenue/i, 'quezon_avenue')
        .replace(/main\s+avenue/i, 'main_avenue')
        .replace(/bagong\s+barrio/i, 'bagong_barrio')
        .replace(/nepa\s+q-?mart/i, 'nepa_q_mart')
        .replace(/one\s+ayala/i, 'one_ayala')
        .replace(/philam\s+qc/i, 'philam_qc')
        .replace(/dfa\s*-?\s*aseana/i, 'dfa')
        .replace(/\s+/g, '_')
        .replace(/-/g, '_')
        .trim();
    };

    const fromKey = normalizeStopName(fromStation.name);
    const toKey = normalizeStopName(toStation.name);

    // Try to find fare in matrix (check both directions)
    let fare = fareMatrix.regular[fromKey]?.[toKey];
    if (fare === undefined) {
      fare = fareMatrix.regular[toKey]?.[fromKey];
    }

    if (fare === undefined) {
      // Fallback to distance-based calculation
      const distance = this.calculateDistance(fromStation, toStation);
      const { base_fare, per_km, base_km } = fareMatrix.calculation;
      if (distance <= base_km) {
        fare = base_fare;
      } else {
        fare = base_fare + ((distance - base_km) * per_km);
      }
      // Round to nearest 0.25
      fare = Math.round(fare * 4) / 4;
    }

    // Apply discount for student/pwd/senior (50% off per RA 11314, RA 9994, RA 7277)
    if (paymentMethod === 'student' || paymentMethod === 'pwd' || paymentMethod === 'senior') {
      const discountRate = fareMatrix.calculation?.discount_rate || 0.50;
      fare = fare * (1 - discountRate);
      // Round to nearest 0.25
      fare = Math.round(fare * 4) / 4;
    }

    return fare;
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

    // For BRT systems (EDSA Carousel), use distance_km field
    if (fromStation.distance_km !== undefined && toStation.distance_km !== undefined) {
      return Math.abs(toStation.distance_km - fromStation.distance_km);
    }

    // Legacy: check for 'distance' field
    if (fromStation.distance !== undefined && toStation.distance !== undefined) {
      return Math.abs(toStation.distance - fromStation.distance);
    }

    // Calculate using coordinates if available
    if (fromStation.lat && fromStation.lng && toStation.lat && toStation.lng) {
      return this.calculateHaversineDistance(fromStation, toStation);
    }

    // Fallback to sequence-based calculation (rough estimate)
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
