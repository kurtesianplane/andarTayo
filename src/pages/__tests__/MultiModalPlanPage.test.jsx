import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MultiModalPlanPage from '../MultiModalPlanPage';

vi.mock('../../transport/shared/hooks/useMultiModalRoutePlanner', async () => {
  const React = await import('react');

  const nodes = [
    {
      id: 'lrt-1:lrt1_monumento',
      lineId: 'lrt-1',
      rawId: 'lrt1_monumento',
      name: 'Monumento',
      sequence: 1,
      lat: 14.6544,
      lng: 120.9841,
      type: 'station',
      lineName: 'LRT-1',
      bgClass: 'bg-lrt1',
      data: { station_id: 'lrt1_monumento', name: 'Monumento', sequence: 1 },
    },
    {
      id: 'edsa-carousel:PITX',
      lineId: 'edsa-carousel',
      rawId: 'PITX',
      name: 'PITX',
      sequence: 24,
      lat: 14.5089,
      lng: 120.9918,
      type: 'stop',
      lineName: 'EDSA Carousel',
      bgClass: 'bg-carousel',
      data: { stop_id: 'PITX', name: 'PITX', sequence: 24, distance_km: 13.6 },
    },
  ];

  const fakeRoute = {
    segments: [
      {
        lineId: 'edsa-carousel',
        fromNode: { name: 'Monumento', data: { stop_id: 'MONUMENTO', name: 'Monumento', sequence: 1 } },
        toNode: { name: 'PITX', data: { stop_id: 'PITX', name: 'PITX', sequence: 24 } },
        stops: [],
        durationMinutes: 60,
        distanceUnits: 23,
        fare: 45,
      },
    ],
    transfers: [
      {
        transferTimeMinutes: 7,
        description: 'Walk to Monumento Carousel stop.',
      },
    ],
    totalTimeMinutes: 67,
    totalFare: 45,
    linesUsed: ['edsa-carousel'],
    warnings: [],
  };

  return {
    useMultiModalStations: () => ({ nodes, loading: false, error: null }),
    useMultiModalRoutePlanner: () => {
      const [route, setRoute] = React.useState(null);
      const calculateRoute = React.useCallback(async () => {
        setRoute(fakeRoute);
        return fakeRoute;
      }, []);
      return {
        route,
        loading: false,
        error: null,
        calculateRoute,
        clearRoute: () => setRoute(null),
        meta: { includeLines: [] },
      };
    },
  };
});

describe('MultiModalPlanPage', () => {
  it('renders an itinerary after selecting origin and destination', async () => {
    render(
      <MemoryRouter>
        <MultiModalPlanPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Select origin station/stop'));
    fireEvent.click(screen.getByText('Monumento'));

    fireEvent.click(screen.getByText('PITX'));

    await waitFor(() => {
      expect(screen.getByText('Total fare')).toBeInTheDocument();
      expect(screen.getByText(/Transfer\s+•/i)).toBeInTheDocument();
      expect(screen.getByText(/Minutes/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000);
});

