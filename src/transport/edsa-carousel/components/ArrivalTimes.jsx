import React from 'react';
import PropTypes from 'prop-types';
import { ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function ArrivalTimes({ arrivals, stopId }) {
  if (!arrivals || !arrivals[stopId] || arrivals[stopId].length === 0) {
    return (
      <div className="text-gray-500 text-sm">
        No buses expected in the next hour
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {arrivals[stopId].map((arrival) => (
        <div
          key={arrival.busId}
          className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <div className="bg-orange-100 text-orange-600 p-1 rounded">
              {arrival.busId}
            </div>
            <div className="flex items-center text-gray-600">
              <ClockIcon className="h-4 w-4 mr-1" />
              {arrival.minutes} min
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <UserGroupIcon className="h-4 w-4 mr-1" />
            {arrival.capacity}%
          </div>
        </div>
      ))}
    </div>
  );
}

ArrivalTimes.propTypes = {
  arrivals: PropTypes.object.isRequired,
  stopId: PropTypes.string.isRequired,
}; 