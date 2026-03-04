// Enhanced train car recommendation logic for station-specific exit positioning
// This is a heuristic system using publicly known station layouts & common commuter patterns.
// It is intentionally data-driven and easily extensible for future refinement.
// Credit: Inspired by research from Matthew Gan (@mattgan_)

import { TRANSPORT_TYPES } from '../config/transportConfig';

// Position descriptors mapped to human-readable guidance
const POSITION_TEXT = {
  front: 'Board the front car for faster access to forward exits / concourse',
  front_mid: 'Board cars 1–2 (front section) for balanced exit speed and space',
  middle: 'Board middle cars for best distribution and easier platform alignment',
  mid_rear: 'Board cars 3–4 (rear section) for moderate crowding and quicker rear exits',
  rear: 'Board the rear car for faster access to rear exits / transfers',
  any: 'Board any available car – minimal difference for this trip',
};

// Line-specific metadata & station directional exit bias
// For each station, specify which platform exit cluster is closer for each cardinal service direction.
// Direction keys use canonical logical line directions (northbound, southbound, eastbound, westbound)
const LINE_CONFIG = {
  [TRANSPORT_TYPES.MRT3]: {
    carCount: 4,
    logical: { ascending: 'southbound', descending: 'northbound' },
    stations: {
      // High interchange & multiple balanced exits → middle
      mrt3_north_avenue: { southbound: 'front_mid', northbound: 'any' }, // Terminus origin often – front helps alighting later
      mrt3_quezon_avenue: { southbound: 'front_mid', northbound: 'mid_rear' },
      mrt3_kamuning: { southbound: 'front', northbound: 'rear' },
      mrt3_cubao: { southbound: 'middle', northbound: 'middle' }, // Major interchange (LRT-2 pathway / malls)
      mrt3_santolan_annapolis: { southbound: 'front_mid', northbound: 'mid_rear' },
      mrt3_ortigas: { southbound: 'rear', northbound: 'front' }, // Megamall side vs Robinsons side
      mrt3_shaw_boulevard: { southbound: 'rear', northbound: 'front' },
      mrt3_boni: { southbound: 'rear', northbound: 'front' },
      mrt3_guadalupe: { southbound: 'rear', northbound: 'front' },
      mrt3_buendia: { southbound: 'rear', northbound: 'front' },
      mrt3_ayala: { southbound: 'middle', northbound: 'middle' }, // Distributed exits & walkway systems
      mrt3_magallanes: { southbound: 'front_mid', northbound: 'mid_rear' },
      mrt3_taft_avenue: { southbound: 'any', northbound: 'front_mid' }, // Terminus / transfer to LRT-1 walkway mid/front
    },
  },
  // Placeholders for future detailed configs
  [TRANSPORT_TYPES.LRT1]: {
    carCount: 4,
    logical: { ascending: 'southbound', descending: 'northbound' },
    stations: {},
  },
  [TRANSPORT_TYPES.LRT2]: {
    carCount: 4,
    logical: { ascending: 'eastbound', descending: 'westbound' },
    stations: {},
  },
  [TRANSPORT_TYPES.EDSA_CAROUSEL]: {
    carCount: 3,
    logical: { ascending: 'southbound', descending: 'northbound' },
    stations: {},
  },
};

function normalizeDirection(direction) {
  return direction?.toLowerCase();
}

function resolveLogicalDirection(lineConfig, originSeq, destSeq) {
  if (originSeq == null || destSeq == null) return null;
  if (originSeq === destSeq) return null;
  return destSeq > originSeq ? lineConfig.logical.ascending : lineConfig.logical.descending;
}

function choosePosition(lineCfg, stationId, logicalDir) {
  if (!logicalDir) return null;
  const entry = lineCfg?.stations?.[stationId];
  if (!entry) return null;
  return entry[logicalDir] || null;
}

function buildSentence(positionKey, destinationName) {
  const base = POSITION_TEXT[positionKey] || POSITION_TEXT.any;
  // Enhance with destination context if helpful
  if (destinationName && base.includes('Board')) {
    return `${base} when alighting at ${destinationName}.`;
  }
  return base;
}

function heuristicFallback(direction) {
  const d = normalizeDirection(direction);
  if (d?.includes('north')) return 'Board cars closer to the front (Car 1–2) for quicker exit.';
  if (d?.includes('south')) return 'Board cars closer to the rear (Car 3–4) to align with typical exits.';
  if (d?.includes('east')) return 'Board middle cars (Cars 2–3) for balanced exit positioning.';
  if (d?.includes('west')) return 'Board middle cars (Cars 2–3) for balanced exit positioning.';
  return POSITION_TEXT.any;
}

export function getTrainCarSuggestion(transportType, originStation, destinationStation, direction, stationsList) {
  const lineCfg = LINE_CONFIG[transportType];
  if (!lineCfg) return heuristicFallback(direction);

  const origin = stationsList?.find(s => s.station_id === originStation);
  const dest = stationsList?.find(s => s.station_id === destinationStation);
  if (!origin || !dest) return heuristicFallback(direction);

  // Prefer explicit direction from route, else infer from sequence numbers
  let logicalDir = normalizeDirection(direction);
  if (!logicalDir || !['northbound','southbound','eastbound','westbound'].includes(logicalDir)) {
    logicalDir = resolveLogicalDirection(lineCfg, origin.sequence, dest.sequence);
  }

  const positionKey = choosePosition(lineCfg, destinationStation, logicalDir) || choosePosition(lineCfg, originStation, logicalDir);

  if (positionKey) {
    return buildSentence(positionKey, dest.name);
  }

  return heuristicFallback(logicalDir || direction);
}

export function getTrainCarSuggestionDebug(transportType) {
  return LINE_CONFIG[transportType];
}
