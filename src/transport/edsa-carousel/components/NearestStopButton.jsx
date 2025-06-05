import React, { useState } from 'react';
import stops from '../data/stops.json';

export default function NearestStopButton({ onStopFound }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Haversine formula to calculate distance between two points
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in meters
  }

  const findNearestStop = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Find nearest stop
        let nearestStop = null;
        let shortestDistance = Infinity;

        stops.stops.forEach(stop => {
          const distance = getDistance(latitude, longitude, stop.lat, stop.lng);
          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestStop = stop;
          }
        });

        if (nearestStop) {
          const distanceInKm = (shortestDistance / 1000).toFixed(2);
          onStopFound(nearestStop, distanceInKm);
        }

        setIsLoading(false);
      },
      (error) => {
        setError('Could not get your location. Please make sure location services are enabled.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div>
      <button
        onClick={findNearestStop}
        disabled={isLoading}
        className={`w-full px-4 py-2 text-white font-medium rounded-lg 
          ${isLoading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600'}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Finding nearest stop...
          </span>
        ) : (
          'Find Nearest Stop'
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 