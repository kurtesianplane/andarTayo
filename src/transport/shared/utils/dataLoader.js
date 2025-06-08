import { TRANSPORT_CONFIG } from '../config/transportConfig.js';

export class DataLoader {
  constructor(transportType) {
    this.config = TRANSPORT_CONFIG[transportType];
    this.transportType = transportType;
    this.cache = {};
  }
  async loadStations() {
    const cacheKey = `${this.transportType}_stations`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const stationsModule = await import(`../../${this.config.dataPath}/data/${this.config.stationKey}.json`);
      const rawData = stationsModule.default;
      
      // For rail systems (LRT-1, LRT-2, MRT-3), extract stations array from nested structure
      // For EDSA Carousel, the data is already an array
      let stationsData;
      if (Array.isArray(rawData)) {
        stationsData = rawData;
      } else if (rawData && rawData.stations && Array.isArray(rawData.stations)) {
        stationsData = rawData.stations;
      } else {
        console.error(`Invalid station data structure for ${this.config.name}:`, rawData);
        throw new Error(`Invalid station data structure for ${this.config.name}`);
      }
      
      this.cache[cacheKey] = stationsData;
      return this.cache[cacheKey];
    } catch (error) {
      console.error(`Failed to load stations for ${this.config.name}:`, error);
      throw new Error(`Station data unavailable for ${this.config.name}`);
    }
  }

  async loadFareMatrix() {
    const cacheKey = `${this.transportType}_fareMatrix`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const fareMatrixModule = await import(`../../${this.config.dataPath}/data/fareMatrix.json`);
      this.cache[cacheKey] = fareMatrixModule.default;
      return this.cache[cacheKey];
    } catch (error) {
      console.error(`Failed to load fare matrix for ${this.config.name}:`, error);
      throw new Error(`Fare data unavailable for ${this.config.name}`);
    }
  }

  async loadSocials() {
    const cacheKey = `${this.transportType}_socials`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const socialsModule = await import(`../../${this.config.dataPath}/data/socials.json`);
      this.cache[cacheKey] = socialsModule.default;
      return this.cache[cacheKey];
    } catch (error) {
      console.warn(`Social media data not available for ${this.config.name}`);
      return [];
    }
  }

  async loadStopDetails() {
    // Only available for EDSA Carousel
    if (this.transportType !== 'edsa-carousel') {
      return null;
    }

    const cacheKey = `${this.transportType}_stopDetails`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const stopDetailsModule = await import(`../../${this.config.dataPath}/data/stopDetails.json`);
      this.cache[cacheKey] = stopDetailsModule.default;
      return this.cache[cacheKey];
    } catch (error) {
      console.warn(`Stop details not available for ${this.config.name}`);
      return null;
    }
  }

  async loadAllData() {
    try {
      const [stations, fareMatrix, socials, stopDetails] = await Promise.allSettled([
        this.loadStations(),
        this.loadFareMatrix(),
        this.loadSocials(),
        this.loadStopDetails()
      ]);

      return {
        stations: stations.status === 'fulfilled' ? stations.value : [],
        fareMatrix: fareMatrix.status === 'fulfilled' ? fareMatrix.value : null,
        socials: socials.status === 'fulfilled' ? socials.value : [],
        stopDetails: stopDetails.status === 'fulfilled' ? stopDetails.value : null,
        config: this.config
      };
    } catch (error) {
      console.error(`Failed to load data for ${this.config.name}:`, error);
      throw error;
    }
  }

  clearCache() {
    this.cache = {};
  }

  getCacheStatus() {
    return Object.keys(this.cache).reduce((status, key) => {
      status[key] = !!this.cache[key];
      return status;
    }, {});
  }
}

// Global data loader instances for each transport type
const dataLoaders = {};

export const getDataLoader = (transportType) => {
  if (!dataLoaders[transportType]) {
    dataLoaders[transportType] = new DataLoader(transportType);
  }
  return dataLoaders[transportType];
};

// Convenience functions
export const loadTransportData = async (transportType) => {
  const loader = getDataLoader(transportType);
  return loader.loadAllData();
};

export const loadStations = async (transportType) => {
  const loader = getDataLoader(transportType);
  return loader.loadStations();
};

export const loadFareMatrix = async (transportType) => {
  const loader = getDataLoader(transportType);
  return loader.loadFareMatrix();
};
