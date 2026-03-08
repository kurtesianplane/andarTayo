// Vercel-style serverless function for aggregating PH transport news.
// NOTE: This runs on server (Node). Do not import from client directly.
// Uses rss-parser and simple HTML fetch for basic sources.

import Parser from 'rss-parser';
import cheerio from 'cheerio';

const parser = new Parser();

// Source definitions
const RSS_SOURCES = [
  {
    id: 'dotr-rss',
    type: 'rss',
    url: 'https://dotr.gov.ph/index.php/component/content/?format=feed&type=rss',
    category: 'transit',
    author: 'DOTr'
  },
  {
    id: 'inquirer',
    type: 'rss',
    url: 'https://www.inquirer.net/fullfeed',
    category: 'news',
    author: 'Inquirer'
  },
  {
    id: 'interaksyon',
    type: 'rss',
    url: 'https://interaksyon.philstar.com/feed/',
    category: 'news',
    author: 'Interaksyon'
  },
  {
    id: 'philstar',
    type: 'rss',
    url: 'https://www.philstar.com/rss/headlines',
    category: 'news',
    author: 'Philstar'
  },
  {
    id: 'rappler',
    type: 'rss',
    url: 'https://www.rappler.com/feed/',
    category: 'news',
    author: 'Rappler'
  },
  {
    id: 'manila-bulletin',
    type: 'rss',
    url: 'https://mb.com.ph/feed/',
    category: 'news',
    author: 'Manila Bulletin'
  },
  {
    id: 'gma-news',
    type: 'rss',
    url: 'https://www.gmanetwork.com/news/rss/',
    category: 'news',
    author: 'GMA News'
  },
  {
    id: 'abs-cbn',
    type: 'rss',
    url: 'https://news.abs-cbn.com/rss/latest.xml',
    category: 'news',
    author: 'ABS-CBN'
  }
];

const HTML_SOURCES = [
  {
    id: 'lrt1-fb-announcements',
    type: 'html',
    url: 'https://www.lrta.gov.ph/news-and-announcements',
    category: 'announcements',
    author: 'LRT-1'
  }
];

function normalizeItem(raw) {
  return {
    id: raw.id,
    category: raw.category,
    title: raw.title?.trim() || 'Untitled',
    summary: raw.summary?.slice(0, 180) || '',
    content: raw.content || raw.summary || '',
    date: raw.date || new Date().toISOString(),
    author: raw.author || 'Unknown',
    tags: raw.tags || [],
    featured: false,
    source: raw.source,
    auto: true
  };
}

async function fetchRssSource(src) {
  try {
    const feed = await parser.parseURL(src.url);
    // Transport-related keywords
    const keywords = [
      'mrt', 'lrt', 'bus', 'commute', 'traffic', 'dotr', 'train', 'jeepney',
      'public transport', 'fare', 'station', 'route', 'terminal', 'transit', 'rail', 'carousel', 'beep', 'stop', 'metro', 'edsa', 'pwds', 'senior', 'student', 'passenger', 'congestion', 'transportation', 'mass transit', 'brt', 'lrt-1', 'lrt-2', 'mrt-3', 'ltfrb', 'mmda', 'uv express', 'tricycle', 'p2p', 'beep card', 'beep', 'fare hike', 'fare matrix', 'fares', 'service disruption', 'maintenance', 'schedule', 'arrival', 'departure', 'terminal', 'route', 'line', 'station', 'stop', 'commuter', 'volume', 'crowd', 'density', 'alert', 'announcement', 'update', 'car', 'busway', 'footbridge', 'carousel', 'brt', 'rapid transit', 'railway', 'railroad', 'public', 'transport', 'transit', 'metro', 'manila', 'philippines'
    ];
    // Filter for transport-related articles
    const filtered = feed.items.filter(item => {
      const text = [item.title, item.contentSnippet, item.content, item['content:encoded']].join(' ').toLowerCase();
      return keywords.some(k => text.includes(k));
    });
    return filtered.slice(0, 10).map(item => normalizeItem({
      id: `${src.id}-${item.guid || item.link || item.pubDate}`,
      category: src.category,
      title: item.title,
      summary: item.contentSnippet || item.content || '',
      content: item.content || item['content:encoded'] || item.contentSnippet || '',
      date: item.isoDate || item.pubDate,
      author: src.author,
      tags: [],
      source: { name: src.author, url: src.url, fetched_at: new Date().toISOString() }
    }));
  } catch (e) {
    return [];
  }
}

async function fetchHtmlSource(src) {
  try {
    const res = await fetch(src.url, { headers: { 'User-Agent': 'andarTayoBot/1.0' } });
    if (!res.ok) throw new Error('bad status');
    const html = await res.text();
    const $ = cheerio.load(html);
    // naive extraction: titles in h2/h3 elements
    const items = [];
    $('h2, h3').slice(0, 5).each((i, el) => {
      const title = $(el).text().trim();
      if (title.length < 6) return; // skip tiny
      items.push(normalizeItem({
        id: `${src.id}-${i}-${title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,40)}`,
        category: src.category,
        title,
        summary: title,
        content: title,
        date: new Date().toISOString(),
        author: src.author,
        tags: [],
        source: { name: src.author, url: src.url, fetched_at: new Date().toISOString() }
      }));
    });
    return items;
  } catch (e) {
    return [];
  }
}

export default async function handler(req, res) {
  // CORS basic
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rssPromises = RSS_SOURCES.map(fetchRssSource);
  const htmlPromises = HTML_SOURCES.map(fetchHtmlSource);
  const results = await Promise.allSettled([...rssPromises, ...htmlPromises]);
  const items = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  // Deduplicate by title hash
  const map = new Map();
  items.forEach(it => {
    const key = it.title.toLowerCase();
    if (!map.has(key)) map.set(key, it);
  });
  const merged = Array.from(map.values()).sort((a,b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({ news: merged, generated_at: new Date().toISOString(), count: merged.length });
}
