import { describe, expect, it } from 'vitest';
import { TRANSPORT_TYPES } from '../config/transportConfig';
import { findMultiModalRoute } from '../utils/multiModalRouter';

const includeLines = [
  TRANSPORT_TYPES.LRT1,
  TRANSPORT_TYPES.LRT2,
  TRANSPORT_TYPES.MRT3,
  TRANSPORT_TYPES.EDSA_CAROUSEL,
];

describe('multi-modal router', () => {
  it('finds a single-line route without transfers', async () => {
    const result = await findMultiModalRoute({
      includeLines,
      originNodeId: 'mrt-3:mrt3_north_avenue',
      destinationNodeId: 'mrt-3:mrt3_ayala',
      passengerType: 'regular',
    });

    expect(result).toBeTruthy();
    expect(result.segments.length).toBe(1);
    expect(result.segments[0].lineId).toBe('mrt-3');
    expect(result.transfers.length).toBe(0);
    expect(result.totalTimeMinutes).toBeGreaterThan(0);
  });

  it('finds a multi-line route using transfers', async () => {
    const result = await findMultiModalRoute({
      includeLines,
      originNodeId: 'lrt-1:lrt1_gil_puyat',
      destinationNodeId: 'lrt-2:lrt2_araneta_cubao',
      passengerType: 'regular',
    });

    expect(result).toBeTruthy();
    expect(result.segments.length).toBeGreaterThanOrEqual(2);
    expect(result.transfers.length).toBeGreaterThanOrEqual(1);
  });

  it('aggregates fares from segments', async () => {
    const result = await findMultiModalRoute({
      includeLines,
      originNodeId: 'lrt-1:lrt1_gil_puyat',
      destinationNodeId: 'lrt-2:lrt2_araneta_cubao',
      passengerType: 'regular',
    });

    const segmentSum = result.segments.reduce((sum, s) => (typeof s.fare === 'number' ? sum + s.fare : sum), 0);

    if (typeof result.totalFare === 'number') {
      expect(Math.abs(result.totalFare - segmentSum)).toBeLessThan(0.001);
    }
  });
});

