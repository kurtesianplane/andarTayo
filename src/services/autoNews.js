// Auto News Fetcher
// Aggregates transport news from PH government transport department social media and feeds.
// Sources: DOTr, LRTA, MRTC official accounts

const AUTO_NEWS_URL = import.meta.env.VITE_AUTO_NEWS_URL || '/api/auto-news';

// Official social media / news sources
const TRANSPORT_SOURCES = {
  dotr: {
    name: 'DOTr Philippines',
    handle: '@DOTrPH',
    url: 'https://x.com/DOTrPH',
    color: 'mrt3',
    category: 'announcements'
  },
  mrt3: {
    name: 'MRT-3',
    handle: '@dotrmrt3',
    url: 'https://x.com/dotrmrt3',
    color: 'mrt3',
    category: 'transit'
  },
  edsaCarousel: {
    name: 'EDSA Carousel',
    handle: '@DOTrPH',
    color: 'carousel',
    category: 'transit'
  }
};

// Nitter/RSS proxy endpoints (privacy-friendly Twitter mirrors)
// These are public instances that provide RSS feeds for Twitter accounts
const RSS_PROXIES = [
  'https://nitter.net',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org'
];

export function normalizeAutoNews(raw) {
  if (!raw || !raw.id || !raw.title) return null;
  return {
    id: raw.id,
    category: raw.category || 'announcements',
    title: raw.title,
    summary: raw.summary || '',
    content: raw.content || '',
    date: raw.date || new Date().toISOString(),
    author: raw.author || 'Unknown',
    tags: raw.tags || [],
    featured: !!raw.featured,
    source: raw.source || { name: 'Auto', url: '', fetched_at: new Date().toISOString() },
    auto: true
  };
}

// Parse RSS XML to extract items
function parseRSS(xmlText) {
  const items = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  
  const entries = doc.querySelectorAll('item, entry');
  entries.forEach((entry, i) => {
    const title = entry.querySelector('title')?.textContent || '';
    const description = entry.querySelector('description, summary, content')?.textContent || '';
    const link = entry.querySelector('link')?.textContent || entry.querySelector('link')?.getAttribute('href') || '';
    const pubDate = entry.querySelector('pubDate, published, updated')?.textContent || '';
    const author = entry.querySelector('author, dc\\:creator')?.textContent || '';
    
    if (title) {
      items.push({
        id: `rss-${Date.now()}-${i}`,
        title: title.replace(/<[^>]*>/g, '').trim(),
        summary: description.replace(/<[^>]*>/g, '').substring(0, 280).trim(),
        content: description.replace(/<[^>]*>/g, '').trim(),
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        author: author || 'Official',
        link
      });
    }
  });
  
  return items;
}

// Attempt to fetch from RSS proxy
async function fetchFromRSSProxy(handle, signal) {
  const username = handle.replace('@', '');
  
  for (const proxy of RSS_PROXIES) {
    try {
      const url = `${proxy}/${username}/rss`;
      const res = await fetch(url, { 
        signal, 
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
        mode: 'cors'
      });
      
      if (res.ok) {
        const text = await res.text();
        return parseRSS(text);
      }
    } catch (e) {
      // Try next proxy
      continue;
    }
  }
  
  return [];
}

// Fetch from all transport sources
async function fetchFromSocialSources(signal) {
  const allNews = [];
  
  // Try to fetch from each source
  for (const [key, source] of Object.entries(TRANSPORT_SOURCES)) {
    try {
      const items = await fetchFromRSSProxy(source.handle, signal);
      
      items.forEach(item => {
        allNews.push({
          ...item,
          id: `${key}-${item.id}`,
          category: source.category,
          author: source.name,
          source: {
            name: source.name,
            url: item.link || `https://twitter.com/${source.handle.replace('@', '')}`,
            fetched_at: new Date().toISOString()
          }
        });
      });
    } catch (e) {
      console.warn(`Failed to fetch from ${source.name}:`, e);
    }
  }
  
  return allNews;
}

export async function fetchAutoNews({ signal } = {}) {
  const results = [];
  
  // Try primary API endpoint first
  try {
    const res = await fetch(AUTO_NEWS_URL, { 
      signal, 
      headers: { 'Accept': 'application/json' }, 
      cache: 'no-store' 
    });
    
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data.news) ? data.news : []);
      results.push(...list.map(normalizeAutoNews).filter(Boolean));
    }
  } catch (e) {
    // API not available, continue with social fetching
  }
  
  // Try social media sources (RSS proxies)
  try {
    const socialNews = await fetchFromSocialSources(signal);
    results.push(...socialNews.map(normalizeAutoNews).filter(Boolean));
  } catch (e) {
    console.warn('Social news fetch failed:', e);
  }
  
  // If no news fetched, provide helpful placeholder
  if (results.length === 0) {
    results.push({
      id: 'placeholder-dotr',
      category: 'announcements',
      title: 'Stay updated with DOTr announcements',
      summary: 'Follow @DOTrPH on X/Twitter and DOTrPH on Facebook for official transport updates.',
      content: 'For the latest announcements from the Department of Transportation, follow their official social media accounts:\n\n• X/Twitter: @DOTrPH\n• Facebook: facebook.com/DOTrPH\n\nFor MRT-3 updates: @dotrmrt3',
      date: new Date().toISOString(),
      author: 'andarTayo!',
      tags: ['info'],
      featured: false,
      source: { name: 'andarTayo!', url: '', fetched_at: new Date().toISOString() },
      auto: true
    });
  }
  
  // Sort by date, newest first
  results.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Limit to most recent 20 items
  return results.slice(0, 20);
}

export function mergeNews(manual, auto) {
  const map = new Map();
  manual.forEach(n => map.set(n.id, n));
  auto.forEach(n => { if (!map.has(n.id)) map.set(n.id, n); });
  return Array.from(map.values())
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Export sources for reference in UI
export { TRANSPORT_SOURCES };
