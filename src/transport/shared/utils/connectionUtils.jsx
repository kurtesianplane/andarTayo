import React from 'react';
import BootstrapIcon from '../../../components/shared/BootstrapIcon';
import { CONNECTION_TYPES } from '../config/transportConfig.js';

export const getConnectionIcon = (connectionType) => {
  const iconMap = {
    [CONNECTION_TYPES.RAIL]: 'train-front-fill',
    [CONNECTION_TYPES.BUS_RAPID_TRANSIT]: 'bus-front-fill',
    [CONNECTION_TYPES.BUS_TERMINALS]: 'bus-front-fill',
    [CONNECTION_TYPES.JEEPNEY_ROUTES]: 'truck-front-fill',
    [CONNECTION_TYPES.UV_EXPRESS]: 'truck-front-fill'
  };

  const iconName = iconMap[connectionType] || 'train-front-fill';
  return <BootstrapIcon name={iconName} className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
};

export const formatConnectionName = (connectionType) => {
  const formatMap = {
    [CONNECTION_TYPES.RAIL]: 'Rail Transit',
    [CONNECTION_TYPES.BUS_RAPID_TRANSIT]: 'Bus Rapid Transit',
    [CONNECTION_TYPES.BUS_TERMINALS]: 'Bus Terminal',
    [CONNECTION_TYPES.JEEPNEY_ROUTES]: 'Jeepney Route',
    [CONNECTION_TYPES.UV_EXPRESS]: 'UV Express'
  };

  return formatMap[connectionType] || 'Transit Connection';
};
