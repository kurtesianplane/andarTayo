import { 
  TicketIcon, 
  CreditCardIcon, 
  UserIcon,
  AcademicCapIcon,
  HeartIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

export const TRANSPORT_TYPES = {
  LRT1: 'lrt-1',
  LRT2: 'lrt-2',
  MRT3: 'mrt-3',
  EDSA_CAROUSEL: 'edsa-carousel'
};

export const PAYMENT_METHODS = {
  RAIL: [
    { 
      id: 'sjt', 
      name: 'Single Journey Ticket',
      description: 'One-time paper ticket',
      icon: TicketIcon
    },
    { 
      id: 'beep', 
      name: 'Beep Card',
      description: 'Contactless stored value card',
      icon: CreditCardIcon
    },
    { 
      id: 'discounted', 
      name: 'PWD/Senior',
      description: '20% discount for qualified passengers',
      icon: HeartIcon
    }
  ],
  BRT: [
    { 
      id: 'regular', 
      name: 'Regular',
      description: 'Standard fare',
      icon: BanknotesIcon
    },
    { 
      id: 'student', 
      name: 'Student',
      description: 'Discounted student fare',
      icon: AcademicCapIcon
    },
    { 
      id: 'pwd', 
      name: 'PWD',
      description: 'Person with Disability discount',
      icon: HeartIcon
    },
    { 
      id: 'senior', 
      name: 'Senior Citizen',
      description: 'Senior citizen discount',
      icon: UserIcon
    }
  ]
};

export const FARE_CALCULATION_TYPES = {
  MATRIX: 'matrix',
  DISTANCE_BASED: 'distance_based',
  DISTANCE_TIERS: 'distance_tiers'
};

export const TRANSPORT_CONFIG = {
  [TRANSPORT_TYPES.LRT1]: {
    name: 'LRT-1',
    type: 'rail',
    paymentMethods: PAYMENT_METHODS.RAIL,
    fareCalculationType: FARE_CALCULATION_TYPES.MATRIX,
    dataPath: 'lrt-1',
    stationKey: 'stations',
    sequenceKey: 'sequence'
  },
  [TRANSPORT_TYPES.LRT2]: {
    name: 'LRT-2',
    type: 'rail',
    paymentMethods: PAYMENT_METHODS.RAIL,
    fareCalculationType: FARE_CALCULATION_TYPES.MATRIX,
    dataPath: 'lrt-2',
    stationKey: 'stations',
    sequenceKey: 'sequence'
  },
  [TRANSPORT_TYPES.MRT3]: {
    name: 'MRT-3',
    type: 'rail',
    paymentMethods: PAYMENT_METHODS.RAIL,
    fareCalculationType: FARE_CALCULATION_TYPES.DISTANCE_TIERS,
    dataPath: 'mrt-3',
    stationKey: 'stations',
    sequenceKey: 'sequence'
  },
  [TRANSPORT_TYPES.EDSA_CAROUSEL]: {
    name: 'EDSA Carousel',
    type: 'brt',
    paymentMethods: PAYMENT_METHODS.BRT,
    fareCalculationType: FARE_CALCULATION_TYPES.DISTANCE_BASED,
    dataPath: 'edsa-carousel',
    stationKey: 'stops',
    sequenceKey: 'sequence'
  }
};

export const CONNECTION_TYPES = {
  RAIL: 'rail',
  BUS_RAPID_TRANSIT: 'bus_rapid_transit',
  BUS_TERMINALS: 'bus_terminals',
  JEEPNEY_ROUTES: 'jeepney_routes',
  UV_EXPRESS: 'uv_express'
};

export const MRT3_FARE_TIERS = [
  { minDistance: 1, maxDistance: 2, fare: 13 },
  { minDistance: 3, maxDistance: 4, fare: 15 },
  { minDistance: 5, maxDistance: 6, fare: 20 },
  { minDistance: 7, maxDistance: 8, fare: 25 },
  { minDistance: 9, maxDistance: 10, fare: 28 }
];

/**
 * Get payment methods for a specific transport type
 * @param {string} transportType - The transport type (lrt-1, lrt-2, mrt-3, edsa-carousel)
 * @returns {Array} Array of payment method objects
 */
export function getPaymentMethods(transportType) {
  const config = TRANSPORT_CONFIG[transportType];
  if (!config) {
    throw new Error(`Unknown transport type: ${transportType}`);
  }
  return config.paymentMethods;
}

/**
 * Get transport configuration for a specific transport type
 * @param {string} transportType - The transport type
 * @returns {Object} Transport configuration
 */
export function getTransportConfig(transportType) {
  const config = TRANSPORT_CONFIG[transportType];
  if (!config) {
    throw new Error(`Unknown transport type: ${transportType}`);
  }
  return config;
}
