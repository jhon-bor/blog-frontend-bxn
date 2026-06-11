'use client';

import Link from 'next/link';
import { Clock, User } from 'lucide-react';
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

export default function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [gridPosts, setGridPosts] = useState<Post[]>([]);
  const [sidebarPosts, setSidebarPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, catsRes] = await Promise.all([
          fetch(`${API_BASE}/api/posts?limit=12`).then(r => r.json()).catch(() => ({ posts: [] })),
          fetch(`${API_BASE}/api/categories`).then(r => r.json()).catch(() => ({ categories: [] }))
        ]);
        const allPosts = postsRes.posts || [];
        setFeaturedPosts(allPosts.slice(0, 3));
        setGridPosts(allPosts.slice(3, 7));
        setSidebarPosts(allPosts.slice(0, 4));
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

  return (
    <div>
      {/* Banner Section */}
      <section className="magazine-banner section-splitter">
        <div className="section-wrapper">
          <div className="banner-container-wrapper">
            {/* Main Banner */}
            <div className="banner-main-part">
              <div className="title-heading">
                <h3 className="section-title">今日焦点</h3>
                <Link href="/posts" className="view-all">查看全部 →</Link>
              </div>
              <div className="banner-main-wrap">
                {loading ? (
                  <div className="h-96 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-[#D61515] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : featuredPosts.length > 0 ? (
                  featuredPosts.map((post, index) => (
                    <article key={post.id} className={`blog-post-container ${index === 0 ? 'grid-layout' : 'list-layout'}`}>
                      <div className="blog-post-inner">
                        <div className="blog-post-image">
                          {post.coverImage ? (
                            <img src={post.coverImage} alt={post.title} />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#393e46] to-[#1a1a1a] flex items-center justify-center">
                              <span className="text-4xl">📰</span>
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
                          {index === 0 && post.excerpt && (
                            <p className="post-excerpt">{post.excerpt}</p>
                          )}
                          <div className="post-meta">
                            <span className="byline">{post.author?.name || '未知作者'}</span>
                            <span><Clock className="w-4 h-4" />{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="text-[#7f8487] mb-4">暂无文章</p>
                    <Link href="/admin/posts/new" className="btn btn-primary">发布文章</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Editors Choice / Featured Posts */}
            <div className="featured-posts">
              <div className="title-heading">
                <h3 className="section-title">编辑精选</h3>
              </div>
              <div className="featured-posts-wrap">
                {sidebarPosts.slice(0, 3).map((post) => (
                  <article key={post.id} className="blog-post-container list-layout">
                    <div className="blog-post-inner">
                      <div className="blog-post-image">
                        {post.coverImage ? (
                          <img src={post.coverImage} alt={post.title} />
                        ) : (
                          <div className="bg-gradient-to-br from-[#D61515] to-[#8b0a0a] flex items-center justify-center">
                            <span>📝</span>
                          </div>
                        )}
                      </div>
                      <div className="blog-post-detail">
                        <h2 className="entry-title">
                          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                        </h2>
                        <div className="post-meta">
                          <span><Clock className="w-3 h-3" />{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="grid-section">
        <div className="section-wrapper">
          <div className="main-container-wrap">
            <div className="title-heading">
              <h3 className="section-title">最新文章</h3>
              <Link href="/posts" className="view-all">查看全部 →</Link>
            </div>
            <div className="grid-wrap">
              {loading ? (
                <div className="col-span-4 text-center py-12">
                  <div className="w-12 h-12 border-4 border-[#D61515] border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : gridPosts.length > 0 ? (
                gridPosts.map((post) => (
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
                        <div className="post-meta">
                          <span className="byline">{post.author?.name || '未知'}</span>
                          <span><Clock className="w-3 h-3" />{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-4 text-center py-12 bg-white rounded-xl">
                  <p className="text-[#7f8487]">暂无文章</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Widgets Section */}
      <section className="main-widgets-section">
        <div className="section-wrapper">
          <div className="widgets-wrapper">
            {/* Main Widget Area */}
            <div className="main-widget-area">
              <div className="title-heading">
                <h3 className="section-title">热门文章</h3>
              </div>
              <div className="grid-list-posts-wrapper">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-[#D61515] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : sidebarPosts.length > 0 ? (
                  sidebarPosts.map((post) => (
                    <article key={post.id} className="blog-post-container grid-layout">
                      <div className="blog-post-inner">
                        <div className="blog-post-image">
                          {post.coverImage ? (
                            <img src={post.coverImage} alt={post.title} />
                          ) : (
                            <div className="bg-gradient-to-br from-[#393e46] to-[#1a1a1a] flex items-center justify-center">
                              <span className="text-2xl">📰</span>
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
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="text-[#7f8487]">暂无文章</p>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Widget Area */}
            <div className="secondary-widgets-area">
              {/* Categories Widget */}
              <div className="widget">
                <h3 className="widget-title">📁 分类</h3>
                <ul className="space-y-2">
                  {loading ? (
                    <li className="text-[#7f8487]">加载中...</li>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <li key={cat.slug} className="flex items-center justify-between py-2 border-b border-[#e0e0e0] last:border-0">
                        <Link href={`/category/${cat.slug}`} className="flex items-center gap-2 hover:text-[#D61515]">
                          <span>📂</span> {cat.name}
                        </Link>
                        {cat._count && (
                          <span className="text-xs bg-[#efefef] px-2 py-1 rounded">{cat._count.posts}</span>
                        )}
                      </li>
                    ))
                  ) : (
                    <li className="text-[#7f8487]">暂无分类</li>
                  )}
                </ul>
              </div>

              {/* Tags Widget */}
              <div className="widget">
                <h3 className="widget-title">🏷️ 热门标签</h3>
                <div className="tag-cloud">
                  <Link href="/tag/tech">#技术</Link>
                  <Link href="/tag/product">#产品</Link>
                  <Link href="/tag/life">#生活</Link>
                  <Link href="/tag/news">#资讯</Link>
                  <Link href="/tag/tutorial">#教程</Link>
                  <Link href="/tag/ai">#AI</Link>
                  <Link href="/tag/web">#Web</Link>
                  <Link href="/tag/mobile">#移动</Link>
                </div>
              </div>

              {/* Newsletter Widget */}
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
      </section>
    </div>
  );
}