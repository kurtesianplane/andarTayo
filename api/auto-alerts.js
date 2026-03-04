// Placeholder serverless function for future real-time alert aggregation.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }
  // For now proxy static file
  const sample = [
    {
      id: 'auto-demo-1',
      title: 'System Operating Normally',
      description: 'No major disruptions reported.',
      severity: 'low',
      type: 'status',
      affected_lines: [],
      affected_stops: [],
      start_date: new Date(Date.now() - 3600*1000).toISOString(),
      end_date: new Date(Date.now() + 5*3600*1000).toISOString(),
      disable_stops: false,
      source: { name: 'Auto', url: '', fetched_at: new Date().toISOString() },
      auto: true
    }
  ];
  res.status(200).json({ alerts: sample, generated_at: new Date().toISOString() });
}
