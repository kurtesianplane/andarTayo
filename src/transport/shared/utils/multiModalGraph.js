import { getDataLoader } from './dataLoader';
import { makeNodeId } from '../config/transferConfig';
import { FareCalculator } from './fareCalculator';

const PER_STOP_MINUTES = {
  'lrt-1': 2,
  'lrt-2': 2,
  'mrt-3': 2.5,
  'edsa-carousel': 3,
};

const BASE_TIME_MINUTES = {
  'lrt-1': 3,
  'lrt-2': 3,
  'mrt-3': 4,
  'edsa-carousel': 5,
};

export function getPerStopMinutes(lineId) {
  return PER_STOP_MINUTES[lineId] ?? 2;
}

export function getBaseTimeMinutes(lineId) {
  return BASE_TIME_MINUTES[lineId] ?? 3;
}

export function createGraph() {
  return {
    nodes: new Map(), // nodeId -> node
    edges: new Map(), // nodeId -> Array<edge>
  };
}

export function addNode(graph, node) {
  graph.nodes.set(node.id, node);
  if (!graph.edges.has(node.id)) graph.edges.set(node.id, []);
}

export function addEdge(graph, edge) {
  if (!graph.edges.has(edge.fromId)) graph.edges.set(edge.fromId, []);
  graph.edges.get(edge.fromId).push(edge);
}

export function getNeighbors(graph, nodeId) {
  return graph.edges.get(nodeId) ?? [];
}

export async function buildLineNodesAndEdges(graph, lineId) {
  const loader = getDataLoader(lineId);
  const stations = await loader.loadStations();

  const nodes = stations
    .map((s) => {
      const rawId = s.station_id || s.stop_id;
      const coords = s.coordinates || {};
      const lat = s.lat ?? coords.lat;
      const lng = s.lng ?? coords.lng;
      return {
        id: makeNodeId(lineId, rawId),
        lineId,
        rawId,
        type: s.stop_id ? 'stop' : 'station',
        name: s.name,
        sequence: s.sequence,
        lat,
        lng,
        data: s,
      };
    })
    .filter((n) => n.rawId && typeof n.sequence === 'number');

  nodes.forEach((n) => addNode(graph, n));

  const sorted = [...nodes].sort((a, b) => a.sequence - b.sequence);
  const perStop = getPerStopMinutes(lineId);

  for (let i = 0; i < sorted.length - 1; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    addEdge(graph, {
      fromId: a.id,
      toId: b.id,
      lineId,
      weightMinutes: perStop,
      isTransfer: false,
    });
    addEdge(graph, {
      fromId: b.id,
      toId: a.id,
      lineId,
      weightMinutes: perStop,
      isTransfer: false,
    });
  }

  return nodes;
}

/** Augment ride edges with weightFare for affordable-route search. Uses regular fare. */
export async function augmentGraphWithFares(graph) {
  const { FareCalculator } = await import('./fareCalculator');
  const pmForLine = (lineId) => (lineId === 'edsa-carousel' ? 'regular' : 'sjt');

  for (const [fromId, edgeList] of graph.edges.entries()) {
    for (const e of edgeList) {
      if (e.isTransfer) {
        e.weightFare = 0;
        continue;
      }
      try {
        const fromNode = graph.nodes.get(e.fromId);
        const toNode = graph.nodes.get(e.toId);
        if (!fromNode?.data || !toNode?.data) continue;
        const calc = new FareCalculator(e.lineId);
        const fare = await calc.calculateFare(fromNode.data, toNode.data, pmForLine(e.lineId));
        e.weightFare = typeof fare === 'number' ? fare : 999;
      } catch {
        e.weightFare = 999;
      }
    }
  }
}

