// Basic auto alerts fetcher (Phase 1 placeholder)
// Attempts to fetch external auto-generated alerts from a configurable endpoint.
// Falls back to returning an empty array if unavailable.
// Future phases: serverless cron to aggregate RSS / HTML sources and expose consolidated JSON.

const AUTO_ALERTS_URL = import.meta.env.VITE_AUTO_ALERTS_URL || '/api/auto-alerts';

// Normalize incoming raw items into internal alert shape.
// Expected raw format (flexible): { id,title,description,severity,type,affected_lines,affected_stops,start_date,end_date,source }
export function normalizeAutoAlert(raw) {
  if (!raw || !raw.id || !raw.title) return null;
  const nowIso = new Date().toISOString();
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    severity: raw.severity || 'low',
    type: raw.type || 'advisory',
    affected_lines: raw.affected_lines || [],
    affected_stops: raw.affected_stops || [],
    start_date: raw.start_date || nowIso,
    end_date: raw.end_date || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // default 6h TTL
    disable_stops: !!raw.disable_stops,
    source: raw.source || { name: 'Auto', url: '', fetched_at: nowIso },
    auto: true
  };
}

export async function fetchAutoAlerts({ signal } = {}) {
  try {
    const res = await fetch(AUTO_ALERTS_URL, { signal, headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('Auto alerts fetch failed');
    const data = await res.json();
    const list = Array.isArray(data) ? data : (Array.isArray(data.alerts) ? data.alerts : []);
    return list.map(normalizeAutoAlert).filter(Boolean);
  } catch (e) {
    // Silent fail; return empty for now
    return [];
  }
}

// Utility for merging manual + auto alerts (dedupe by id, prefer manual if conflict)
export function mergeAlerts(manualAlerts, autoAlerts) {
  const map = new Map();
  manualAlerts.forEach(a => map.set(a.id, a));
  autoAlerts.forEach(a => { if (!map.has(a.id)) map.set(a.id, a); });
  return Array.from(map.values());
}
