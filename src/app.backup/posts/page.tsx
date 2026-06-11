'use client';

import Link from 'next/link';
import { Search, Grid, List, Clock, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: { name: string };
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  createdAt: string;
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

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch(`${API_BASE}/api/posts?limit=20`).then(r => r.json()).catch(() => ({ posts: [] })),
          fetch(`${API_BASE}/api/categories`).then(r => r.json()).catch(() => ({ categories: [] }))
        ]);
        setPosts(postsRes.posts || []);
        setCategories(catsRes.categories || []);
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

  const filteredPosts = selectedCategory 
    ? posts.filter(p => p.category?.slug === selectedCategory)
    : posts;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Page Header */}
      <div className="bg-[#393e46] text-white py-8">
        <div className="section-wrapper">
          <h1 className="text-3xl font-bold mb-2">📑 文章列表</h1>
          <p className="text-white/70">探索我们的所有文章</p>
        </div>
      </div>

      {/* Content */}
      <div className="section-wrapper py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters & View Toggle */}
            <div className="title-heading mb-6 p-4 bg-white rounded-xl">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <span className="text-[#7f8487] text-sm">筛选:</span>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-[#e0e0e0] rounded-lg text-sm focus:outline-none focus:border-[#D61515]"
                  >
                    <option value="">全部分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#D61515] text-white' : 'bg-gray-100 text-[#7f8487]'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#D61515] text-white' : 'bg-gray-100 text-[#7f8487]'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Posts */}
            {loading ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-4 border-[#D61515] border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="main-container-wrap">
                {viewMode === 'grid' ? (
                  <div className="grid-wrap">
                    {filteredPosts.map((post) => (
                      <article key={post.id} className="blog-post-container grid-layout">
                        <div className="blog-post-inner">
                          <div className="blog-post-image">
                            {post.coverImage ? (
                              <img src={post.coverImage} alt={post.title} />
                            ) : (
                              <div className="bg-gradient-to-br from-[#D61515] to-[#8b0a0a] flex items-center justify-center">
                                <span className="text-3xl">📝</span>
                              </div>
                            )}
                          </div>
                          <div className="blog-post-detail">
                            {post.category && (
                              <div className="post-categories">
                                <Link href={`/category/${post.category.slug}`}>{post.category.name}</Link>
                              </div>
                            )}
                            <h2 className="entry-title">
                              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                            </h2>
                            <p className="post-excerpt">{post.excerpt || '暂无摘要'}</p>
                            <div className="post-meta">
                              <span className="byline">{post.author?.name || '未知'}</span>
                              <span><Clock className="w-3 h-3" />{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="grid-list-posts-wrapper">
                    {filteredPosts.map((post) => (
                      <article key={post.id} className="blog-post-container grid-layout">
                        <div className="blog-post-inner">
                          <div className="blog-post-image">
                            {post.coverImage ? (
                              <img src={post.coverImage} alt={post.title} />
                            ) : (
                              <div className="bg-gradient-to-br from-[#D61515] to-[#8b0a0a] flex items-center justify-center">
                                <span className="text-2xl">📝</span>
                              </div>
                            )}
                          </div>
                          <div className="blog-post-detail">
                            {post.category && (
                              <div className="post-categories">
                                <Link href={`/category/${post.category.slug}`}>{post.category.name}</Link>
                              </div>
                            )}
                            <h2 className="entry-title">
                              <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                            </h2>
                            <p className="post-excerpt">{post.excerpt || '暂无摘要'}</p>
                            <div className="post-meta">
                              <span className="byline">{post.author?.name || '未知'}</span>
                              <span><Clock className="w-3 h-3" />{formatDate(post.createdAt)}</span>
                            </div>
                            <Link href={`/posts/${post.slug}`} className="read-more-btn">阅读更多 →</Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <p className="text-[#7f8487] mb-4">暂无文章</p>
                <Link href="/admin/posts/new" className="btn btn-primary">撰写文章</Link>
              </div>
            )}

            {/* Pagination */}
            <div className="pagination">
              <span className="current">1</span>
              <a href="#">2</a>
              <a href="#">3</a>
              <a href="#">→</a>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Search */}
            <div className="widget bg-white p-5 rounded-xl">
              <h3 className="widget-title">🔍 搜索</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索文章..."
                  className="input pr-10"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f8487] hover:text-[#D61515]">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="widget bg-white p-5 rounded-xl">
              <h3 className="widget-title">📁 分类</h3>
              <ul className="space-y-2">
                {categories.map(cat => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded transition-colors flex items-center justify-between ${selectedCategory === cat.slug ? 'bg-[#D61515] text-white' : 'hover:bg-[#efefef]'}`}
                    >
                      <span>📂 {cat.name}</span>
                      {cat._count && <span className="text-xs">{cat._count.posts}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            <div className="widget bg-white p-5 rounded-xl">
              <h3 className="widget-title">🏷️ 标签</h3>
              <div className="tag-cloud">
                <Link href="/tag/tech">#技术</Link>
                <Link href="/tag/product">#产品</Link>
                <Link href="/tag/life">#生活</Link>
                <Link href="/tag/news">#资讯</Link>
                <Link href="/tag/tutorial">#教程</Link>
                <Link href="/tag/ai">#AI</Link>
              </div>
            </div>

            {/* Newsletter */}
            <div className="widget">
              <div className="newsletter-widget">
                <h3>📧 订阅更新</h3>
                <p>订阅我们的 newsletter，获取最新文章推送</p>
                <input type="email" placeholder="输入你的邮箱" />
                <button type="button">立即订阅</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}