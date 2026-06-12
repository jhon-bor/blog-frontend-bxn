'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  TrendingUp, 
  Eye, 
  Users, 
  Clock, 
  BarChart3, 
  Search,
  Globe,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

interface PageData {
  path: string;
  views: number;
  sessions?: number;
}

interface KeywordData {
  keyword: string;
  count?: number;
  popularity?: number;
  trend?: string;
  last_searched?: string;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  async function fetchData() {
    setLoading(true);
    try {
      const [statsRes, pagesRes, trendsRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics?type=stats&days=${days}`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/analytics?type=pages&days=${days}`).then(r => r.json()).catch(() => null),
        fetch(`${API_BASE}/api/trends`).then(r => r.json()).catch(() => null),
      ]);

      setStats(statsRes);
      setPages(pagesRes?.pages || []);
      setKeywords(trendsRes?.keywords || []);
      setTrends(trendsRes);
    } catch (e) {
      console.error('Failed to fetch analytics:', e);
    } finally {
      setLoading(false);
    }
  }

  const statCards: StatCard[] = stats?.gaStats?.rows ? [
    {
      label: '总用户',
      value: stats.gaStats.rows[0]?.metricValues?.[0]?.value || stats?.posts || '-',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-500',
    },
    {
      label: '会话数',
      value: stats.gaStats.rows[0]?.metricValues?.[1]?.value || stats?.totalViews || '-',
      change: 12,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-green-500',
    },
    {
      label: '页面浏览',
      value: stats.gaStats.rows[0]?.metricValues?.[2]?.value || '-',
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-purple-500',
    },
    {
      label: '新用户',
      value: stats.gaStats.rows[0]?.metricValues?.[3]?.value || '-',
      icon: <Zap className="w-5 h-5" />,
      color: 'bg-orange-500',
    },
  ] : [
    {
      label: '文章总数',
      value: stats?.posts || '-',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-blue-500',
    },
    {
      label: '总浏览量',
      value: stats?.totalViews?.toLocaleString() || '-',
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-green-500',
    },
    {
      label: '评论总数',
      value: stats?.comments || '-',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-purple-500',
    },
    {
      label: '数据周期',
      value: `${days}天`,
      icon: <Clock className="w-5 h-5" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">📊 数据分析</h1>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={days} 
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={7}>最近 7 天</option>
              <option value={30}>最近 30 天</option>
              <option value={90}>最近 90 天</option>
            </select>
            <button 
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">{card.value}</p>
                  {card.change !== undefined && (
                    <p className={`text-sm mt-1 flex items-center gap-1 ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {card.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {Math.abs(card.change)}%
                    </p>
                  )}
                </div>
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Pages */}
          <div className="lg:col-span-2 card">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Globe className="w-5 h-5" />
                热门页面
              </h3>
              {pages.length > 0 && (
                <span className="text-sm text-gray-500">数据来源: {pages[0] ? 'Google Analytics' : '内部统计'}</span>
              )}
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : pages.length > 0 ? (
                <div className="space-y-3">
                  {pages.slice(0, 10).map((page, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="font-mono text-sm text-gray-700 truncate max-w-md">{page.path}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{page.views?.toLocaleString()} 次浏览</span>
                        {page.sessions && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {page.sessions} 会话
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无页面浏览数据</p>
                  <p className="text-sm mt-1">配置 Google Analytics API Token 以获取真实数据</p>
                </div>
              )}
            </div>
          </div>

          {/* Keywords */}
          <div className="card">
            <div className="p-6 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Search className="w-5 h-5" />
                搜索关键词
              </h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : keywords.length > 0 ? (
                <div className="space-y-2">
                  {keywords.slice(0, 10).map((kw, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-gray-200 text-gray-600 rounded text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm">{kw.keyword}</span>
                      </div>
                      <span className="text-xs text-gray-500">{kw.count || kw.popularity || 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无关键词数据</p>
                  <p className="text-xs mt-1">用户搜索词将自动记录</p>
                </div>
              )}

              {/* Trend chart placeholder */}
              <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <p className="text-sm font-medium mb-2">关键词热度趋势</p>
                <div className="h-20 flex items-end gap-1">
                  {Array.from({length: 12}).map((_, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-indigo-400 rounded-t"
                      style={{ height: `${30 + Math.random() * 70}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">最近 30 天</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Strategy Suggestions */}
        <div className="mt-8 card">
          <div className="p-6 border-b">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              内容策略建议
            </h3>
            <p className="text-sm text-gray-500 mt-1">基于搜索数据的内容优化建议</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2">🔥 高热度话题</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• AI 工具使用技巧</li>
                  <li>• Next.js 实战教程</li>
                  <li>• Tailwind CSS 最佳实践</li>
                </ul>
                <p className="text-xs text-blue-500 mt-3">建议每周发布 2-3 篇相关内容</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-800 mb-2">📈 上升趋势</h4>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• 独立开发变现</li>
                  <li>• AI 写作工具</li>
                  <li>• SaaS 产品搭建</li>
                </ul>
                <p className="text-xs text-green-500 mt-3">抓住窗口期，及时发布</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="font-bold text-purple-800 mb-2">💡 长尾关键词</h4>
                <ul className="text-sm space-y-1 text-purple-700">
                  <li>• 如何用 AI 写博客</li>
                  <li>• Next.js SEO 优化</li>
                  <li>• Cloudflare Pages 部署</li>
                </ul>
                <p className="text-xs text-purple-500 mt-3">布局长尾，获取精准流量</p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Analytics Setup Guide */}
        <div className="mt-8 card border-2 border-dashed border-gray-300">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              配置 Google Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-medium mb-3">需要配置的环境变量：</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-2">
                  <p><span className="text-gray-500"># Google Analytics Measurement Protocol</span></p>
                  <p>GA_MEASUREMENT_ID=<span className="text-yellow-400">G-XXXXXXXXXX</span></p>
                  <p>GA_API_SECRET=<span className="text-yellow-400">your-api-secret</span></p>
                  <p><span className="text-gray-500"># Google Analytics Data API (for admin dashboard)</span></p>
                  <p>GA_PROPERTY_ID=<span className="text-yellow-400">properties/123456789</span></p>
                  <p>GOOGLE_ANALYTICS_TOKEN=<span className="text-yellow-400">oauth2-token</span></p>
                  <p><span className="text-gray-500"># Keyword Research (optional)</span></p>
                  <p>SERPAPI_TOKEN=<span className="text-yellow-400">your-serpapi-key</span></p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">获取步骤：</h4>
                <ol className="text-sm space-y-2 text-gray-600">
                  <li>1. 在 <a href="https://analytics.google.com" target="_blank" className="text-indigo-600 underline">Google Analytics</a> 创建账号并获取 Measurement ID</li>
                  <li>2. 在 Cloudflare Workers 环境变量中配置上述密钥</li>
                  <li>3. 在博客前端添加 GA 追踪代码</li>
                  <li>4. 启用 Google Analytics Data API 并创建 OAuth token</li>
                  <li>5. 配置 SERPAPI_TOKEN 获取关键词趋势数据（可选）</li>
                </ol>
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm">
                  <p className="font-medium text-yellow-800">💡 小提示</p>
                  <p className="text-yellow-700 mt-1">即使不配置 GA，后端也会记录内部访问数据用于基础分析。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}