'use client';

import Link from 'next/link';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  author: { name: string };
  category: { name: string; slug: string } | null;
  tags: { name: string; slug: string }[];
  createdAt: string;
}

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState<string>('');
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      try {
        const postRes = await fetch(`${API_BASE}/api/posts/${slug}`).then(r => r.json()).catch(() => null);
        if (postRes?.post) {
          setPost(postRes.post);
          if (postRes.post.category) {
            const relatedRes = await fetch(`${API_BASE}/api/posts?category=${postRes.post.category.slug}&limit=3`).then(r => r.json()).catch(() => ({ posts: [] }));
            setRelatedPosts((relatedRes.posts || []).filter((p: Post) => p.slug !== slug).slice(0, 3));
          }
        }
      } catch (e) {
        console.error('Failed to fetch post:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="w-12 h-12 border-4 border-[#D61515] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
          <Link href="/posts" className="btn btn-primary">返回文章列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Article Container */}
      <div className="section-wrapper py-8">
        <div className="news-storm-container-wrapper">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#7f8487] mb-6">
            <Link href="/" className="hover:text-[#D61515]">首页</Link>
            <span>/</span>
            <Link href="/posts" className="hover:text-[#D61515]">文章</Link>
            {post.category && (
              <>
                <span>/</span>
                <Link href={`/category/${post.category.slug}`} className="hover:text-[#D61515]">
                  {post.category.name}
                </Link>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <article className="bg-white rounded-xl overflow-hidden">
                {/* Post Thumbnail */}
                {post.coverImage && (
                  <div className="post-thumbnail">
                    <img src={post.coverImage} alt={post.title} />
                  </div>
                )}

                {/* Entry Header */}
                <div className="p-6 md:p-8">
                  {post.category && (
                    <div className="post-categories mb-4">
                      <Link href={`/category/${post.category.slug}`}>{post.category.name}</Link>
                    </div>
                  )}
                  <h1 className="post-main-title">{post.title}</h1>
                  <div className="post-meta mt-4">
                    <span className="byline flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {post.author?.name || '未知作者'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-6 md:p-8 pt-0">
                  <div className="post-content">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                  </div>
                </div>

                {/* Post Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="px-6 md:px-8 pb-6">
                    <div className="flex items-center gap-3 pt-6 border-t border-[#e0e0e0]">
                      <Tag className="w-4 h-4 text-[#7f8487]" />
                      <div className="tag-cloud">
                        {post.tags.map(tag => (
                          <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                            #{tag.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Share */}
                <div className="px-6 md:px-8 pb-6">
                  <div className="flex items-center justify-between pt-6 border-t border-[#e0e0e0]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#7f8487]">分享:</span>
                      <button className="w-10 h-10 bg-[#3b5999] text-white rounded-full flex items-center justify-center hover:opacity-90">
                        <span>📘</span>
                      </button>
                      <button className="w-10 h-10 bg-[#1da1f2] text-white rounded-full flex items-center justify-center hover:opacity-90">
                        <span>🐦</span>
                      </button>
                      <button className="w-10 h-10 bg-[#0e76a8] text-white rounded-full flex items-center justify-center hover:opacity-90">
                        <span>📧</span>
                      </button>
                    </div>
                    <Link href="/posts" className="flex items-center gap-2 text-[#7f8487] hover:text-[#D61515] transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                      返回列表
                    </Link>
                  </div>
                </div>
              </article>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="related-posts">
                  <div className="title-heading">
                    <h3 className="section-title">📌 相关文章</h3>
                  </div>
                  <div className="grid-wrap">
                    {relatedPosts.map((relPost) => (
                      <article key={relPost.id} className="blog-post-container grid-layout">
                        <div className="blog-post-inner">
                          <div className="blog-post-image">
                            {relPost.coverImage ? (
                              <img src={relPost.coverImage} alt={relPost.title} />
                            ) : (
                              <div className="bg-gradient-to-br from-[#D61515] to-[#8b0a0a] flex items-center justify-center">
                                <span className="text-2xl">📝</span>
                              </div>
                            )}
                          </div>
                          <div className="blog-post-detail">
                            {relPost.category && (
                              <div className="post-categories">
                                <Link href={`/category/${relPost.category.slug}`}>{relPost.category.name}</Link>
                              </div>
                            )}
                            <h2 className="entry-title">
                              <Link href={`/posts/${relPost.slug}`}>{relPost.title}</Link>
                            </h2>
                            <div className="post-meta">
                              <span className="byline">{relPost.author?.name || '未知'}</span>
                              <span><Calendar className="w-3 h-3" />{formatDate(relPost.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Categories */}
              <div className="widget bg-white p-5 rounded-xl">
                <h3 className="widget-title">📁 分类</h3>
                <ul className="space-y-2">
                  {post.category && (
                    <li className="flex items-center justify-between py-2 border-b border-[#e0e0e0]">
                      <Link href={`/category/${post.category.slug}`} className="flex items-center gap-2 hover:text-[#D61515]">
                        <span>📂</span> {post.category.name}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="widget bg-white p-5 rounded-xl">
                  <h3 className="widget-title">🏷️ 标签</h3>
                  <div className="tag-cloud">
                    {post.tags.map(tag => (
                      <Link key={tag.slug} href={`/tag/${tag.slug}`}>
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

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
    </div>
  );
}