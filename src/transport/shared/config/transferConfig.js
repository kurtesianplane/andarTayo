import { TRANSPORT_TYPES } from './transportConfig';

/**
 * Curated interchange links between systems.
 *
 * Note: station/stop IDs here are the raw IDs from each system dataset
 * (e.g. `mrt3_taft_avenue`, `lrt1_edsa`, `TAFT`).
 */
export const TRANSFER_LINKS = [
  // LRT-1 <-> LRT-2
  {
    from: { lineId: TRANSPORT_TYPES.LRT1, stationId: 'lrt1_doroteo_jose' },
    to: { lineId: TRANSPORT_TYPES.LRT2, stationId: 'lrt2_recto' },
    transferTimeMinutes: 8,
    notes: 'Walk via connecting footbridge (D. Jose ↔ Recto).',
  },

  // LRT-1 <-> MRT-3 (Pasay)
  {
    from: { lineId: TRANSPORT_TYPES.LRT1, stationId: 'lrt1_edsa' },
    to: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_taft_avenue' },
    transferTimeMinutes: 8,
    notes: 'Walk via Taft/EDSA interchange walkway.',
  },

  // MRT-3 <-> LRT-2 (Cubao)
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_cubao' },
    to: { lineId: TRANSPORT_TYPES.LRT2, stationId: 'lrt2_araneta_cubao' },
    transferTimeMinutes: 10,
    notes: 'Walk through Araneta Center interconnection.',
  },

  // MRT-3 <-> EDSA Carousel (north to south)
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_north_avenue' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'NORTH_AVE' },
    transferTimeMinutes: 7,
    notes: 'Walk to North Avenue Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_quezon_avenue' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'QUEZON_AVE' },
    transferTimeMinutes: 7,
    notes: 'Walk to Quezon Avenue Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_kamuning' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'KAMUNING' },
    transferTimeMinutes: 7,
    notes: 'Walk to Kamuning Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_santolan_annapolis' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'SANTOLAN' },
    transferTimeMinutes: 7,
    notes: 'Walk to Santolan Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_ortigas' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'ORTIGAS' },
    transferTimeMinutes: 7,
    notes: 'Walk to Ortigas Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_guadalupe' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'GUADALUPE' },
    transferTimeMinutes: 7,
    notes: 'Walk to Guadalupe Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_buendia' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'BUENDIA' },
    transferTimeMinutes: 7,
    notes: 'Walk to Buendia Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_ayala' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'AYALA' },
    transferTimeMinutes: 7,
    notes: 'Walk to One Ayala / Ayala Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.MRT3, stationId: 'mrt3_taft_avenue' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'TAFT' },
    transferTimeMinutes: 7,
    notes: 'Walk to Taft Avenue Carousel stop.',
  },

  // LRT-1 <-> EDSA Carousel (north)
  {
    from: { lineId: TRANSPORT_TYPES.LRT1, stationId: 'lrt1_monumento' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'MONUMENTO' },
    transferTimeMinutes: 7,
    notes: 'Walk to Monumento Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.LRT1, stationId: 'lrt1_balintawak' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'BALINTAWAK' },
    transferTimeMinutes: 7,
    notes: 'Walk to Balintawak Carousel stop.',
  },
  {
    from: { lineId: TRANSPORT_TYPES.LRT1, stationId: 'lrt1_fernando_poe_jr' },
    to: { lineId: TRANSPORT_TYPES.EDSA_CAROUSEL, stationId: 'ROOSEVELT' },
    transferTimeMinutes: 7,
    notes: 'Walk to Roosevelt/Fernando Poe Jr. Carousel stop.',
  },
];

export function makeNodeId(lineId, rawStationOrStopId) {
  return `${lineId}:${rawStationOrStopId}`;
}

