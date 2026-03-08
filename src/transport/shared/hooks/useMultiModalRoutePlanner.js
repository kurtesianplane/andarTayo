import { useCallback, useEffect, useMemo, useState } from 'react';
import { TRANSPORT_TYPES, TRANSPORT_CONFIG } from '../config/transportConfig';
import { getDataLoader } from '../utils/dataLoader';
import { makeNodeId } from '../config/transferConfig';
import { findMultiModalRoute } from '../utils/multiModalRouter';

const DEFAULT_LINES = [
  TRANSPORT_TYPES.LRT1,
  TRANSPORT_TYPES.LRT2,
  TRANSPORT_TYPES.MRT3,
  TRANSPORT_TYPES.EDSA_CAROUSEL,
];

function normalizeNodeName(name = '') {
  return name
    .replace(/\s*\(Formerly[^)]*\)/gi, '')
    .replace(/\s+Station$/i, '')
    .trim();
}

export function useMultiModalStations(includeLines = DEFAULT_LINES) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          includeLines.map(async (lineId) => {
            const loader = getDataLoader(lineId);
            const stations = await loader.loadStations();
            const config = TRANSPORT_CONFIG[lineId];
            return stations.map((s) => {
              const rawId = s.station_id || s.stop_id;
              const coords = s.coordinates || {};
              const lat = s.lat ?? coords.lat;
              const lng = s.lng ?? coords.lng;
              return {
                id: makeNodeId(lineId, rawId),
                lineId,
                rawId,
                name: normalizeNodeName(s.name),
                sequence: s.sequence,
                lat,
                lng,
                type: s.stop_id ? 'stop' : 'station',
                lineName: (config?.name === 'EDSA Carousel' ? 'Carousel' : config?.name) || lineId,
                bgClass:
                  lineId === TRANSPORT_TYPES.LRT1
                    ? 'bg-lrt1'
                    : lineId === TRANSPORT_TYPES.LRT2
                      ? 'bg-lrt2'
                      : lineId === TRANSPORT_TYPES.MRT3
                        ? 'bg-mrt3'
                        : 'bg-carousel',
                data: s,
              };
            });
          }),
        );

        const merged = results.flat().filter((n) => n.rawId);
        merged.sort((a, b) => {
          if (a.lineId !== b.lineId) return a.lineId.localeCompare(b.lineId);
          return (a.sequence ?? 0) - (b.sequence ?? 0);
        });

        if (!cancelled) setNodes(merged);
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load stations');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [includeLines]);

  return { nodes, loading, error };
}

export function useMultiModalRoutePlanner(includeLines = DEFAULT_LINES) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateRoute = useCallback(
    async ({ originNodeId, destinationNodeId, passengerType, routePreference = 'fastest' }) => {
      try {
        setLoading(true);
        setError(null);
        const result = await findMultiModalRoute({
          includeLines,
          originNodeId,
          destinationNodeId,
          passengerType,
          routePreference,
        });
        setRoute(result);
        return result;
      } catch (e) {
        setRoute(null);
        setError(e?.message || 'Route calculation failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [includeLines],
  );

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  const meta = useMemo(() => ({ includeLines }), [includeLines]);

  return { route, loading, error, calculateRoute, clearRoute, meta };
}

