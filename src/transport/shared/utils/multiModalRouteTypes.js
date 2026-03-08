/**
 * @typedef {'station'|'stop'} MultiModalNodeType
 *
 * @typedef {Object} MultiModalNode
 * @property {string} id Namespaced id: `${lineId}:${rawId}`
 * @property {string} lineId Transport type id (e.g. 'mrt-3', 'edsa-carousel')
 * @property {string} rawId Underlying station_id/stop_id
 * @property {MultiModalNodeType} type
 * @property {string} name
 * @property {number} sequence
 * @property {number | undefined} lat
 * @property {number | undefined} lng
 * @property {any} data Original station/stop object
 *
 * @typedef {Object} MultiModalSegment
 * @property {string} lineId
 * @property {MultiModalNode} fromNode
 * @property {MultiModalNode} toNode
 * @property {MultiModalNode[]} stops Nodes included in this segment (includes endpoints)
 * @property {number} durationMinutes
 * @property {number} distanceUnits Number of edges/stops traveled within this segment
 * @property {number | string} fare
 *
 * @typedef {Object} TransferStep
 * @property {MultiModalNode} fromNode
 * @property {MultiModalNode} toNode
 * @property {number} transferTimeMinutes
 * @property {string} description
 *
 * @typedef {Object} MultiModalRoute
 * @property {MultiModalSegment[]} segments
 * @property {TransferStep[]} transfers
 * @property {number} totalTimeMinutes
 * @property {number | string} totalFare
 * @property {string[]} linesUsed
 * @property {string[]} warnings
 */

export {};

