import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAutoNews, mergeNews, TRANSPORT_SOURCES } from '../services/autoNews';

const categories = [
  { id: 'all', label: 'All', icon: '📰' },
  { id: 'updates', label: 'Updates', icon: '⚙️' },
  { id: 'transit', label: 'Transit', icon: '🚆' },
  { id: 'announcements', label: 'Announcements', icon: '📢' }
];

const sourceLinks = [
  { name: 'DOTr', url: 'https://x.com/DOTrPH', icon: '🏛️' },
  { name: 'MRT-3', url: 'https://x.com/dotrmrt3', icon: '🚇' },
];

const RefreshIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ChevronIcon = ({ className, expanded }) => (
  <svg className={`${className} transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const NewsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [error, setError] = useState(null);

  const refreshNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const autoList = await fetchAutoNews({ signal: controller.signal });
      const merged = mergeNews([], autoList);
      setNews(merged);
      setLastFetch(new Date().toISOString());
    } catch (e) {
      setError(e.message || 'Failed to fetch news');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNews();
    const id = setInterval(refreshNews, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshNews]);

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(article => article.category === selectedCategory);

  const featuredNews = news.filter(article => article.featured).slice(0, 2);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryStyle = (category) => {
    const styles = {
      updates: 'bg-mrt3/10 text-mrt3',
      transit: 'bg-lrt1/10 text-lrt1',
      announcements: 'bg-carousel/10 text-carousel'
    };
    return styles[category] || 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-8">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 lg:pt-8 lg:pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white">
                Transit News
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
                Updates & announcements
              </p>
            </div>
            <button
              onClick={refreshNews}
              disabled={loading}
              className="btn-secondary p-2.5"
            >
              <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="px-5">
        <div className="max-w-2xl mx-auto space-y-5">
          
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-5 px-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-mrt3 text-white shadow-lg shadow-mrt3/20'
                    : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
            <span>{lastFetch ? `Updated ${formatDate(lastFetch)}` : 'Fetching...'}</span>
            <span>{filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''}</span>
          </div>

          {error && (
            <div className="alert-banner alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Featured */}
          {selectedCategory === 'all' && featuredNews.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <span>⭐</span> Featured
              </h2>
              {featuredNews.map((article) => (
                <motion.div
                  key={article.id}
                  className="transit-card relative overflow-hidden"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-mrt3-accent" />
                  <div className="pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryStyle(article.category)}`}>
                        {categories.find(c => c.id === article.category)?.label}
                      </span>
                      {article.auto && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-lrt2/10 text-lrt2">
                          AUTO
                        </span>
                      )}
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                        {formatDate(article.date)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                </motion.div>
              ))}
            </section>
          )}

          {/* Articles */}
          <AnimatePresence mode="popLayout">
            {filteredNews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="transit-card text-center py-12"
              >
                <div className="text-5xl mb-4">📡</div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  No news yet
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Waiting for updates from transit sources
                </p>
              </motion.div>
            ) : (
              filteredNews.filter(a => !a.featured || selectedCategory !== 'all').map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03 }}
                  layout
                  className="transit-card"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryStyle(article.category)}`}>
                      {categories.find(c => c.id === article.category)?.label}
                    </span>
                    {article.auto && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-lrt2/10 text-lrt2">
                        AUTO
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                      {formatDate(article.date)}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {article.summary}
                  </p>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedArticle === article.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-3 overflow-hidden"
                      >
                        <div className="transit-card-flat">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                            {article.content}
                          </p>
                          {article.source && (
                            <a 
                              href={article.source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-3 text-xs text-mrt3 hover:underline"
                            >
                              Source: {article.source.name} →
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      By {article.author}
                    </span>
                    <button
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                      className="flex items-center gap-1 text-sm font-medium text-mrt3 hover:text-mrt3-dark"
                    >
                      {expandedArticle === article.id ? 'Less' : 'Read more'}
                      <ChevronIcon className="w-4 h-4" expanded={expandedArticle === article.id} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Footer with source links */}
          <div className="pt-4 space-y-3">
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
              Auto-refreshes every 5 minutes
            </p>
            
            {/* Official Sources */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-zinc-400">Sources:</span>
              {sourceLinks.map((source) => (
                <a
                  key={source.name}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-xs text-zinc-600 dark:text-zinc-400 transition-colors"
                >
                  <span>{source.icon}</span>
                  <span>{source.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
