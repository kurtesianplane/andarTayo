import stopsData from './stops.json';

// Optimize simulation parameters
const AVERAGE_SPEED_KMH = 20; // Average bus speed in km/h
const UPDATE_INTERVAL = 15000; // Update every 15 seconds
const MAX_BUSES = 6; // Reduce number of simulated buses

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Generate initial bus positions
const generateBuses = () => {
  const buses = [];
  const numBuses = MAX_BUSES;

  for (let i = 0; i < numBuses; i++) {
    const startStopIndex = Math.floor(Math.random() * (stopsData.length - 1));
    const nextStopIndex = startStopIndex + 1;
    const progress = Math.random();

    buses.push({
      id: `bus-${i + 1}`,
      position: {
        lat: stopsData[startStopIndex].lat + 
          (stopsData[nextStopIndex].lat - stopsData[startStopIndex].lat) * progress,
        lng: stopsData[startStopIndex].lng + 
          (stopsData[nextStopIndex].lng - stopsData[startStopIndex].lng) * progress
      },
      nextStop: stopsData[nextStopIndex].stop_id,
      currentStop: stopsData[startStopIndex].stop_id,
      progress,
      direction: "southbound",
      capacity: Math.floor(Math.random() * 40) + 10,
      speed: AVERAGE_SPEED_KMH + (Math.random() * 6 - 3), // Reduce speed variation
    });
  }
  return buses;
};

// Optimize arrival time calculations
const calculateEstimatedArrivals = (buses) => {
  const arrivals = {};
  const stopsMap = new Map(stopsData.map(stop => [stop.stop_id, stop]));
  
  stopsData.forEach(stop => {
    arrivals[stop.stop_id] = [];
    
    buses.forEach(bus => {
      const busStop = stopsMap.get(bus.currentStop);
      const nextStop = stopsMap.get(bus.nextStop);
      
      if (busStop && nextStop) {
        const distanceToStop = calculateDistance(
          bus.position.lat, bus.position.lng,
          stop.lat, stop.lng
        );
        
        const estimatedMinutes = Math.round((distanceToStop / bus.speed) * 60);
        
        if (estimatedMinutes >= 0 && estimatedMinutes <= 45) { // Reduce max arrival time window
          arrivals[stop.stop_id].push({
            busId: bus.id,
            minutes: estimatedMinutes,
            capacity: bus.capacity
          });
        }
      }
    });
    
    arrivals[stop.stop_id].sort((a, b) => a.minutes - b.minutes);
  });
  
  return arrivals;
};

// Update bus positions
const updateBusPositions = (buses) => {
  return buses.map(bus => {
    const currentStop = stopsData.find(stop => stop.stop_id === bus.currentStop);
    const nextStop = stopsData.find(stop => stop.stop_id === bus.nextStop);
    
    if (!currentStop || !nextStop) return bus;

    // Update progress
    const timeStep = UPDATE_INTERVAL / 1000 / 3600; // Convert to hours
    const distance = calculateDistance(
      currentStop.lat, currentStop.lng,
      nextStop.lat, nextStop.lng
    );
    const progressStep = (bus.speed * timeStep) / distance;
    let newProgress = bus.progress + progressStep;

    // If bus reached next stop
    if (newProgress >= 1) {
      const currentStopIndex = stopsData.findIndex(stop => stop.stop_id === bus.nextStop);
      const nextStopIndex = (currentStopIndex + 1) % stopsData.length;
      
      return {
        ...bus,
        currentStop: bus.nextStop,
        nextStop: stopsData[nextStopIndex].stop_id,
        progress: 0,
        position: {
          lat: stopsData[currentStopIndex].lat,
          lng: stopsData[currentStopIndex].lng
        },
        capacity: Math.floor(Math.random() * 40) + 10, // Simulate passengers getting on/off
      };
    }

    // Update position based on progress
    return {
      ...bus,
      progress: newProgress,
      position: {
        lat: currentStop.lat + (nextStop.lat - currentStop.lat) * newProgress,
        lng: currentStop.lng + (nextStop.lng - currentStop.lng) * newProgress
      }
    };
  });
};

export {
  generateBuses,
  updateBusPositions,
  calculateEstimatedArrivals,
  UPDATE_INTERVAL
}; 