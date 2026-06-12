'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  BarChart3, 
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  FileText
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://aipres.pages.dev';

interface KeywordTrend {
  keyword: string;
  popularity?: number;
  trend?: string;
  related?: string[];
}

interface ContentSuggestion {
  topic: string;
  keywords: string[];
  angle: string;
}

export default function KeywordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [compareKeywords, setCompareKeywords] = useState('');
  const [compareResult, setCompareResult] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trends?q=${encodeURIComponent(searchQuery)}&days=30`);
      const data = await res.json() as any;
      setSearchResult(data);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCompare() {
    const keywords = compareKeywords.split(',').map(k => k.trim()).filter(Boolean);
    if (keywords.length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/trends?type=compare&q=${keywords.join(',')}`);
      const data = await res.json() as any;
      setCompareResult(data);
    } catch (e) {
      console.error('Compare failed:', e);
    } finally {
      setLoading(false);
    }
  }

  async function loadSuggestions() {
    try {
      const res = await fetch(`${API_BASE}/api/trends?type=suggestions`);
      const data = await res.json() as any;
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error('Failed to load suggestions:', e);
    }
  }

  useEffect(() => {
    loadSuggestions();
  }, []);

  const topicSuggestions = [
    { topic: 'AI / LLM', color: 'from-purple-500 to-pink-500', angle: '工具测评、教程、趋势分析', keywords: ['ChatGPT', 'Claude', 'Midjourney', 'AI编程', 'LLM应用'] },
    { topic: '前端技术', color: 'from-blue-500 to-cyan-500', angle: '实战教程、源码解析、最佳实践', keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'] },
    { topic: '效率工具', color: 'from-green-500 to-emerald-500', angle: '使用技巧、模板分享、生产力', keywords: ['Notion', 'Obsidian', 'AI助手', '自动化'] },
    { topic: '独立开发', color: 'from-orange-500 to-red-500', angle: '经验分享、变现策略、工具推荐', keywords: ['SaaS', '变现', '营销', '增长', 'IndieHacker'] },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">🔍 关键词研究</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="card p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            搜索关键词趋势
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="输入关键词，例如: AI写作, Next.js教程, Python"
              className="input flex-1"
            />
            <button onClick={handleSearch} disabled={loading} className="btn btn-primary flex items-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              搜索
            </button>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold">「{searchResult.keyword}」搜索趋势</h4>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{searchResult.source === 'google' ? 'Google Trends' : searchResult.source === 'serpapi' ? 'SerpAPI' : '模拟数据'}</span>
              </div>
              
              {/* Simple bar chart */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-end gap-1 h-40">
                  {(searchResult.data || []).slice(-14).map((d: any, i: number) => {
                    const maxVal = Math.max(...(searchResult.data || []).map((x: any) => x.value || 0));
                    const height = maxVal > 0 ? ((d.value || 0) / maxVal) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t transition-all hover:opacity-80"
                          style={{ height: `${Math.max(height, 5)}%` }}
                          title={`${d.date}: ${d.value}`}
                        />
                        <span className="text-xs text-gray-400 transform -rotate-45 origin-center">{d.date?.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {searchResult.note && (
                <p className="text-xs text-gray-500 mt-2">{searchResult.note}</p>
              )}

              {/* Related keywords */}
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">相关搜索词：</p>
                <div className="flex flex-wrap gap-2">
                  {(searchResult.related || ['AI工具', 'AI写作', 'AI助手', '机器学习', '深度学习']).map((kw: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => { setSearchQuery(kw); }}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compare Keywords */}
        <div className="card p-6 mb-8">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            关键词对比
          </h3>
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={compareKeywords}
              onChange={(e) => setCompareKeywords(e.target.value)}
              placeholder="输入多个关键词，用逗号分隔，例如: AI, Python, JavaScript"
              className="input flex-1"
            />
            <button onClick={handleCompare} disabled={loading} className="btn btn-primary flex items-center gap-2">
              对比
            </button>
          </div>

          {compareResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {(compareResult.comparison || []).map((item: any, i: number) => (
                <div key={i} className={`p-4 rounded-xl border-2 ${
                  item.trend === 'rising' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{item.keyword}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.trend === 'rising' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {item.trend === 'rising' ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
                      {item.trend}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-gray-700">{item.popularity}</div>
                    <div className="text-xs text-gray-500">热度指数</div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.trend === 'rising' ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${item.popularity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Suggestions */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              内容选题建议
            </h3>
            <button onClick={loadSuggestions} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> 刷新建议
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">基于热门话题的内容创作方向建议</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topicSuggestions.map((topic, i) => (
              <div key={i} className={`p-5 rounded-xl bg-gradient-to-br ${topic.color} text-white`}>
                <h4 className="font-bold text-lg mb-2">{topic.topic}</h4>
                <p className="text-sm opacity-90 mb-3">{topic.angle}</p>
                <div className="flex flex-wrap gap-2">
                  {topic.keywords.map(kw => (
                    <span key={kw} className="px-2 py-1 bg-white/20 rounded-full text-xs">{kw}</span>
                  ))}
                </div>
                <button 
                  onClick={() => setSearchQuery(topic.topic.split(' ')[0])}
                  className="mt-4 px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" /> 研究这个话题
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/posts/new" className="p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="font-bold">撰写文章</p>
                <p className="text-sm text-gray-500">基于关键词研究写一篇</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
            <Link href="/admin/analytics" className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-bold">查看数据分析</p>
                <p className="text-sm text-gray-500">访客数据和内容表现</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </Link>
            <button className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div>
                <p className="font-bold">导出关键词报告</p>
                <p className="text-sm text-gray-500">生成 CSV 格式报告</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}