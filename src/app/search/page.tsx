'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Filter, Clock } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  highlight?: {
    title?: string[];
    content?: string[];
  };
  score: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [engine, setEngine] = useState<'elasticsearch' | 'solr'>('elasticsearch');
  const [total, setTotal] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const performSearch = async () => {
    setIsSearching(true);
    const startTime = Date.now();

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&engine=${engine}`
      );
      const data = await res.json() as any;
      
      setResults(data.hits || []);
      setTotal(data.total || 0);
      setSearchTime(Date.now() - startTime);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const highlightText = (text: string, highlights: string[] | undefined) => {
    if (!highlights || highlights.length === 0) return text;
    
    let result = text;
    highlights.forEach(h => {
      result = result.replace(new RegExp(h, 'gi'), `<mark>$&</mark>`);
    });
    return result;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">站内搜索</h1>
          <p className="text-gray-600">使用 ElasticSearch / Solr 全文搜索</p>
        </div>

        {/* Search Box */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入关键词搜索文章..."
            className="w-full pl-12 pr-12 py-4 text-lg rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-colors"
          />
          {query && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setQuery('')}
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Engine Selection */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-500">搜索引擎：</span>
            <div className="flex rounded-lg border overflow-hidden">
              <button
                className={`px-4 py-2 ${engine === 'elasticsearch' ? 'bg-primary-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setEngine('elasticsearch')}
              >
                ElasticSearch
              </button>
              <button
                className={`px-4 py-2 ${engine === 'solr' ? 'bg-primary-600 text-white' : 'bg-white hover:bg-gray-50'}`}
                onClick={() => setEngine('solr')}
              >
                Solr
              </button>
            </div>
          </div>
          
          {results.length > 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              约 {total} 条结果，耗时 {searchTime}ms
            </div>
          )}
        </div>

        {/* Loading */}
        {isSearching && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">搜索中...</p>
          </div>
        )}

        {/* Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-6">
            {results.map((result) => (
              <article key={result.id} className="card p-6 hover:border-primary-200 transition-colors">
                <Link href={`/posts/${result.slug}`}>
                  <h2 
                    className="text-xl font-bold mb-2 hover:text-primary-600"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(result.title, result.highlight?.title) 
                    }}
                  />
                </Link>
                <p 
                  className="text-gray-600 mb-4 line-clamp-2"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightText(result.excerpt, result.highlight?.content) 
                  }}
                />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    匹配度: {Math.round(result.score * 100)}%
                  </span>
                  <Link 
                    href={`/posts/${result.slug}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    阅读全文 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">未找到相关文章</h3>
            <p className="text-gray-400">换个关键词试试吧</p>
          </div>
        )}

        {/* Initial State */}
        {!isSearching && query.length < 2 && (
          <div className="text-center py-12">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">开始搜索</h3>
            <p className="text-gray-400">输入至少 2 个字符开始搜索</p>
          </div>
        )}
      </div>
    </div>
  );
}