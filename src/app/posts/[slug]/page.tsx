import Link from 'next/link';
import { Calendar, User, Tag, ArrowLeft, GitFork } from 'lucide-react';
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
  source?: 'api' | 'github';
  date?: string;
}

async function getPost(slug: string, source?: string): Promise<Post | null> {
  // 首先尝试本地 API
  try {
    const res = await fetch(`${API_BASE}/api/posts/${slug}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.post) {
      return { ...data.post, source: 'api' as const };
    }
  } catch {
    // 继续尝试 GitHub
  }

  // 如果本地没有，尝试从 GitHub 获取（通过代理 API）
  try {
    const listRes = await fetch('/api/github-posts', { cache: 'no-store' });
    const data = await listRes.json();
    const files = data.files || [];
    
    const file = Array.isArray(files) ? files.find((f: any) => f.name === `${slug}.md`) : null;
    if (file) {
      const contentRes = await fetch(file.download_url, { cache: 'no-store' });
      const content = await contentRes.text();
      
      // 解析 frontmatter
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
      const metadata: any = {};
      
      if (fmMatch) {
        fmMatch[1].split('\n').forEach(line => {
          const [key, ...vals] = line.split(':');
          if (key && vals.length) {
            const val = vals.join(':').trim();
            metadata[key.trim()] = val.startsWith('[') 
              ? val.replace(/[\[\]]/g, '').split(',').map((s: string) => s.trim())
              : val;
          }
        });
      }

      return {
        id: file.sha,
        title: metadata.title || slug,
        slug,
        content: body,
        excerpt: metadata.excerpt || body.substring(0, 200) + '...',
        coverImage: null,
        author: { name: metadata.author || 'Obsidian' },
        category: metadata.category ? { name: metadata.category, slug: metadata.category } : null,
        tags: (metadata.tags || []).map((t: string) => ({ name: t, slug: t })),
        createdAt: metadata.date || new Date().toISOString(),
        source: 'github' as const
      };
    }
  } catch {
    // 都没找到
  }

  return null;
}

async function getRelatedPosts(categorySlug: string, excludeSlug: string): Promise<Post[]> {
  try {
    const res = await fetch(`${API_BASE}/api/posts?category=${categorySlug}&limit=4`, { cache: 'no-store' });
    const data = await res.json();
    return (data.posts || []).filter((p: Post) => p.slug !== excludeSlug).slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/posts?limit=100`, { cache: 'no-store' });
    const data = await res.json();
    return (data.posts || []).map((post: { slug: string }) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // 从 slug 参数中检测来源（格式：github_slug 或 api_slug）
  // 或者默认从 API 获取，找不到再尝试 GitHub
  let post = await getPost(slug, 'api');
  if (!post) {
    post = await getPost(slug, 'github');
  }
  const relatedPosts = post?.category ? await getRelatedPosts(post.category.slug, slug) : [];

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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">文章未找到</h1>
          <Link href="/posts" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">返回文章列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-indigo-600">首页</Link>
          <span>/</span>
          <Link href="/posts" className="hover:text-indigo-600">文章</Link>
          {post.category && (
            <>
              <span>/</span>
              <Link href={`/category/${post.category.slug}`} className="hover:text-indigo-600">
                {post.category.name}
              </Link>
            </>
          )}
        </div>

        <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
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
            <div className="flex items-center gap-3 mb-4">
              <h1 className="post-main-title flex-1">{post.title}</h1>
              {post.source === 'github' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  <GitFork className="w-4 h-4" /> Obsidian
                </span>
              )}
            </div>
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
              <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                <Tag className="w-4 h-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(post.tags) ? post.tags : []).map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      #{typeof tag === 'string' ? tag : tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Share */}
          <div className="px-6 md:px-8 pb-6">
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">分享:</span>
                <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:opacity-90">📘</button>
                <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:opacity-90">🐦</button>
                <button className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:opacity-90">📧</button>
              </div>
              <Link href="/posts" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                返回列表
              </Link>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <div className="mb-4">
              <h3 className="text-lg font-bold">📌 相关文章</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relPost) => (
                <article key={relPost.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="h-36 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl text-white">📄</span>
                  </div>
                  <div className="p-4">
                    <h2 className="text-base font-bold mb-2">
                      <Link href={`/posts/${relPost.slug}`} className="hover:text-indigo-600">{relPost.title}</Link>
                    </h2>
                    <div className="text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(relPost.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}