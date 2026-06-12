'use client';

import Link from 'next/link';
import { Search, Grid, List, Clock, User, GitFork, Database } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://aipres.pages.dev';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage?: string | null;
  author?: { name: string };
  category?: { name: string; slug: string } | null;
  tags?: { name: string; slug: string }[];
  createdAt: string;
  content?: string;
  source?: 'api' | 'github';
  date?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dataSource, setDataSource] = useState<'all' | 'api' | 'github'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        // 获取本地 API 文章
        const localRes = fetch(`${API_BASE}/api/posts?limit=50`)
          .then(r => r.json())
          .catch(() => ({ posts: [] }));
        
        // 获取 GitHub Obsidian 文章（通过代理 API）
        const githubRes = fetch('/api/github-posts')
          .then(r => r.json())
          .catch(() => ({ files: [] }));

        const [localData, githubData] = await Promise.all([localRes, githubRes]) as [{ posts: any[] }, { files: any[] }];
        const githubFiles = githubData.files || [];

        // 合并文章
        const localPosts = (localData.posts || []).map((p: any) => ({
          ...p,
          source: 'api' as const,
          createdAt: p.createdAt || p.created_at || p.date,
          category: p.category_name ? { name: p.category_name, slug: p.category_slug || '' } : null,
          author: p.author || { name: 'Admin' }
        }));
        
        // 处理 GitHub 文件列表
        const githubPosts = Array.isArray(githubFiles) 
          ? githubFiles
              .filter((f: any) => f.name?.endsWith('.md'))
              .map((f: any) => ({
                id: f.sha,
                title: f.name.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, ''),
                slug: f.name.replace('.md', ''),
                excerpt: '点击阅读更多...',
                createdAt: f.name.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] || new Date().toISOString(),
                source: 'github' as const,
                author: { name: 'Obsidian' },
                filename: f.name,
                downloadUrl: f.download_url
              }))
          : [];

        // 优先显示 GitHub 文章（因为是本地编辑的）
        setPosts([...githubPosts, ...localPosts]);

        // 获取分类
        try {
          const catsRes = await fetch(`${API_BASE}/api/categories`);
          const catsData = await catsRes.json() as any;
          setCategories(catsData.categories || []);
        } catch {
          setCategories([]);
        }
      } catch (e) {
        console.error('Failed to fetch data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const filteredPosts = posts.filter(p => {
    if (selectedCategory && p.category?.slug !== selectedCategory) return false;
    if (dataSource !== 'all' && p.source !== dataSource) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">📑 文章列表</h1>
          <p className="text-white/80">探索我们的所有文章</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters & View Toggle */}
            <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100">
              <div className="flex items-center justify-between w-full flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500 text-sm">筛选:</span>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">全部分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 border-l pl-4">
                    <button
                      onClick={() => setDataSource('all')}
                      className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${dataSource === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                    >
                      <Database className="w-3 h-3" /> 全部
                    </button>
                    <button
                      onClick={() => setDataSource('github')}
                      className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${dataSource === 'github' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                    >
                      <GitFork className="w-3 h-3" /> Obsidian
                    </button>
                    <button
                      onClick={() => setDataSource('api')}
                      className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${dataSource === 'api' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                    >
                      <Database className="w-3 h-3" /> 后台
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                {filteredPosts.map((post) => (
                  <article key={post.id} className={`bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 ${viewMode === 'grid' ? '' : 'flex'}`}>
                    <div className={`${viewMode === 'grid' ? '' : 'w-40 h-32 flex-shrink-0'} overflow-hidden bg-gray-100`}>
                      {post.coverImage ? (
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                          <span className="text-2xl text-white">{post.source === 'github' ? '📝' : '📄'}</span>
                        </div>
                      )}
                    </div>
                    <div className={`p-4 ${viewMode === 'grid' ? '' : 'flex-1'}`}>
                      {post.category && (
                        <div className="post-categories mb-2">
                          <Link href={`/category/${post.category.slug}`} className="text-xs">{post.category.name}</Link>
                          {post.source === 'github' && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">📝 Obsidian</span>
                          )}
                        </div>
                      )}
                      <h2 className="text-lg font-bold mb-2">
                        <Link href={`/posts/${post.slug}?source=${post.source || 'api'}`} className="hover:text-indigo-600">{post.title}</Link>
                      </h2>
                      <p className="text-sm text-gray-500 mb-3">{post.excerpt || '暂无摘要'}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author?.name || '未知'}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(post.createdAt)}</span>
                        </div>
                        <Link href={`/posts/${post.slug}?source=${post.source || 'api'}`} className="text-indigo-600 hover:underline">阅读 →</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <p className="text-gray-500 mb-4">暂无文章</p>
                <Link href="/admin/posts/new" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">撰写文章</Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            <div className="widget">
              <h3 className="widget-title">🔍 搜索</h3>
              <div className="relative">
                <input type="text" placeholder="搜索文章..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="widget">
              <h3 className="widget-title">📁 分类</h3>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${selectedCategory === cat.slug ? 'bg-indigo-600 text-white' : 'hover:bg-gray-50'}`}
                    >
                      <span>📂 {cat.name}</span>
                      {cat._count && <span className="text-xs">{cat._count.posts}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="widget">
              <h3 className="widget-title">🏷️ 标签</h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/tag/tech" className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">#技术</Link>
                <Link href="/tag/product" className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">#产品</Link>
                <Link href="/tag/life" className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">#生活</Link>
                <Link href="/tag/news" className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">#资讯</Link>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
              <h3 className="font-bold mb-2">📝 Obsidian 同步</h3>
              <p className="text-sm text-white/80 mb-4">在 Obsidian 的 Blog 文件夹中编辑 Markdown，自动同步到博客！</p>
              <a href="https://github.com/jhon-bor/obsidian-blog" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-gray-100">
                <GitFork className="w-4 h-4" /> 查看 GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}