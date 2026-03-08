import { TRANSFER_LINKS, makeNodeId } from '../config/transferConfig';
import { buildLineNodesAndEdges, createGraph, addEdge, getBaseTimeMinutes } from './multiModalGraph';
import { FareCalculator } from './fareCalculator';

const graphCache = new Map(); // key -> { graph }

function cacheKey(includeLines) {
  return includeLines.slice().sort().join('|');
}

function findEdge(graph, fromId, toId) {
  const edges = graph.edges.get(fromId) ?? [];
  return edges.find((e) => e.toId === toId) ?? null;
}

function addTransferEdges(graph, transferLinks = TRANSFER_LINKS) {
  for (const link of transferLinks) {
    const fromId = makeNodeId(link.from.lineId, link.from.stationId);
    const toId = makeNodeId(link.to.lineId, link.to.stationId);

    if (!graph.nodes.has(fromId) || !graph.nodes.has(toId)) continue;

    addEdge(graph, {
      fromId,
      toId,
      lineId: 'transfer',
      weightMinutes: link.transferTimeMinutes ?? 8,
      weightFare: 0,
      isTransfer: true,
      transferNotes: link.notes || '',
    });
    addEdge(graph, {
      fromId: toId,
      toId: fromId,
      lineId: 'transfer',
      weightMinutes: link.transferTimeMinutes ?? 8,
      weightFare: 0,
      isTransfer: true,
      transferNotes: link.notes || '',
    });
  }
}

async function augmentGraphWithFares(graph) {
  // Accept a passengerType argument for correct fare calculation
  const passengerType = graph.passengerType || 'regular';
  for (const [, edgeList] of graph.edges) {
    for (const e of edgeList) {
      if (e.isTransfer) {
        e.weightFare = 0;
        continue;
      }
      try {
        const fromNode = graph.nodes.get(e.fromId);
        const toNode = graph.nodes.get(e.toId);
        if (!fromNode?.data || !toNode?.data) continue;
        // Use the correct payment method for this passenger type
        const pm = paymentMethodFor(e.lineId, passengerType);
        const calc = new FareCalculator(e.lineId);
        const fare = await calc.calculateFare(fromNode.data, toNode.data, pm);
        e.weightFare = typeof fare === 'number' ? fare : 9999;
      } catch {
        e.weightFare = 9999;
      }
    }
  }
}

export async function buildMultiModalGraph({ includeLines }) {
  // Accept passengerType as an argument
  const key = cacheKey(includeLines);
  if (graphCache.has(key)) return graphCache.get(key);

  const graph = createGraph();
  await Promise.all(includeLines.map((lineId) => buildLineNodesAndEdges(graph, lineId)));
  addTransferEdges(graph);
  // Attach passengerType to graph for fare calculation
  graph.passengerType = arguments[0]?.passengerType || 'regular';
  await augmentGraphWithFares(graph);

  const cached = { graph };
  graphCache.set(key, cached);
  return cached;
}

function dijkstra(graph, startId, goalId) {
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();

  for (const nodeId of graph.nodes.keys()) dist.set(nodeId, Infinity);
  dist.set(startId, 0);

  while (visited.size < graph.nodes.size) {
    let u = null;
    let best = Infinity;

    for (const [nodeId, d] of dist.entries()) {
      if (visited.has(nodeId)) continue;
      if (d < best) {
        best = d;
        u = nodeId;
      }
    }

    if (!u || best === Infinity) break;
    if (u === goalId) break;

    visited.add(u);
    const neighbors = graph.edges.get(u) ?? [];

    for (const e of neighbors) {
      const alt = best + (e.weightMinutes ?? 0);
      if (alt < (dist.get(e.toId) ?? Infinity)) {
        dist.set(e.toId, alt);
        prev.set(e.toId, u);
      }
    }
  }

  if (!prev.has(goalId) && startId !== goalId) return null;

  const path = [];
  let cur = goalId;
  path.push(cur);
  while (cur !== startId) {
    const p = prev.get(cur);
    if (!p) return null;
    cur = p;
    path.push(cur);
  }
  path.reverse();
  return path;
}

function dijkstraByFare(graph, startId, goalId) {
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();

  for (const nodeId of graph.nodes.keys()) dist.set(nodeId, Infinity);
  dist.set(startId, 0);

  while (visited.size < graph.nodes.size) {
    let u = null;
    let best = Infinity;

    for (const [nodeId, d] of dist.entries()) {
      if (visited.has(nodeId)) continue;
      if (d < best) {
        best = d;
        u = nodeId;
      }
    }

    if (!u || best === Infinity) break;
    if (u === goalId) break;

    visited.add(u);
    const neighbors = graph.edges.get(u) ?? [];

    for (const e of neighbors) {
      const transferCost = e.isTransfer ? 22 : 0;
      
      const alt = best + (e.weightFare ?? 9999) + transferCost;
    
      if (alt < (dist.get(e.toId) ?? Infinity)) {
        dist.set(e.toId, alt);
        prev.set(e.toId, u);
      }
    }
  }

  if (!prev.has(goalId) && startId !== goalId) return null;

  const path = [];
  let cur = goalId;
  path.push(cur);
  while (cur !== startId) {
    const p = prev.get(cur);
    if (!p) return null;
    cur = p;
    path.push(cur);
  }
  path.reverse();
  return path;
}

function segmentizePath(graph, nodePath) {
  const segments = [];
  const transfers = [];

  let currentLineId = null;
  let currentNodes = [graph.nodes.get(nodePath[0])];
  let currentRideMinutes = 0;

  const finalizeSegment = () => {
    if (!currentLineId) return;
    if (currentNodes.length < 2) return;

    const distanceUnits = currentNodes.length - 1;
    const durationMinutes = Math.round(getBaseTimeMinutes(currentLineId) + currentRideMinutes);

    segments.push({
      lineId: currentLineId,
      fromNode: currentNodes[0],
      toNode: currentNodes[currentNodes.length - 1],
      stops: currentNodes,
      durationMinutes,
      distanceUnits,
      fare: null,
    });
  };

  for (let i = 0; i < nodePath.length - 1; i += 1) {
    const fromId = nodePath[i];
    const toId = nodePath[i + 1];
    const edge = findEdge(graph, fromId, toId);
    if (!edge) continue;

    if (edge.isTransfer) {
      finalizeSegment();

      const fromNode = graph.nodes.get(fromId);
      const toNode = graph.nodes.get(toId);

      transfers.push({
        fromNode,
        toNode,
        transferTimeMinutes: Math.round(edge.weightMinutes ?? 0),
        description: edge.transferNotes || 'Transfer to the next line.',
      });

      currentLineId = null;
      currentNodes = [toNode];
      currentRideMinutes = 0;
      continue;
    }

    if (!currentLineId) currentLineId = edge.lineId;
    currentRideMinutes += edge.weightMinutes ?? 0;
    currentNodes.push(graph.nodes.get(toId));
  }

  finalizeSegment();

  const totalTimeMinutes = Math.round(
    segments.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0) +
      transfers.reduce((sum, t) => sum + (t.transferTimeMinutes ?? 0), 0),
  );

  return { segments, transfers, totalTimeMinutes };
}

function paymentMethodFor(lineId, passengerType) {
  if (lineId === 'edsa-carousel') {
    if (passengerType === 'student') return 'student';
    if (passengerType === 'discounted') return 'senior';
    return 'regular';
  }

  if (passengerType === 'student') return 'student';
  if (passengerType === 'discounted') return 'discounted';
  return 'sjt';
}

export async function findMultiModalRoute({
  includeLines,
  originNodeId,
  destinationNodeId,
  passengerType = 'regular',
  routePreference = 'fastest', // 'fastest' | 'affordable'
}) {
  const { graph } = await buildMultiModalGraph({ includeLines, passengerType });

  if (!graph.nodes.has(originNodeId) || !graph.nodes.has(destinationNodeId)) {
    throw new Error('Invalid origin or destination selection');
  }

  if (originNodeId === destinationNodeId) {
    throw new Error('Origin and destination cannot be the same');
  }

  const nodePath =
    routePreference === 'affordable'
      ? dijkstraByFare(graph, originNodeId, destinationNodeId)
      : dijkstra(graph, originNodeId, destinationNodeId);
  if (!nodePath) {
    throw new Error('No available route found with current transfer links');
  }

  const { segments, transfers, totalTimeMinutes } = segmentizePath(graph, nodePath);

  let totalFare = 0;
  const warnings = [];

  for (const seg of segments) {
    const calc = new FareCalculator(seg.lineId);
    const pm = paymentMethodFor(seg.lineId, passengerType);

    try {
      // For fare calculators, use original station objects.
      const fare = await calc.calculateFare(seg.fromNode.data, seg.toNode.data, pm);
      seg.fare = fare;
      if (typeof fare === 'number') totalFare += fare;
    } catch (e) {
      seg.fare = 'N/A';
      warnings.push(`Fare unavailable for ${seg.lineId}`);
    }
  }

  const linesUsed = [...new Set(segments.map((s) => s.lineId))];

  return {
    segments,
    transfers,
    totalTimeMinutes,
    totalFare: typeof totalFare === 'number' ? totalFare : 'N/A',
    linesUsed,
    warnings,
    nodePath,
  };
}

