'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://aipres.pages.dev';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    published: true,
    authorId: '',
    categoryId: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, tagsRes] = await Promise.all([
          fetch(`${API_BASE}/api/categories`).then(r => r.json()) as Promise<any>,
          fetch(`${API_BASE}/api/tags`).then(r => r.json()) as Promise<any>
        ]);
        setCategories(catsRes.categories || []);
        setTags(tagsRes.tags || []);
      } catch (e) {
        console.error('Failed to fetch data:', e);
      }
    }
    fetchData();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[\u4e00-\u9fa5]/g, (char) => {
          const pinyinMap: Record<string, string> = {
            '我': 'wo', '你': 'ni', '他': 'ta', '是': 'shi', '的': 'de',
            '在': 'zai', '有': 'you', '和': 'he', '了': 'le', '一': 'yi',
            '个': 'ge', '人': 'ren', '们': 'men', '来': 'lai', '到': 'dao',
            '这': 'zhe', '里': 'li', '看': 'kan', '见': 'jian', '好': 'hao',
            '用': 'yong', '会': 'hui', '可': 'ke', '以': 'yi', '学': 'xue',
            '习': 'xi', '开': 'kai', '发': 'fa', '程': 'cheng', '序': 'xu',
            '设': 'she', '计': 'ji', '技': 'ji', '术': 'shu', '网': 'wang',
            '站': 'zhan', '博': 'bo', '客': 'ke', '文': 'wen', '章': 'zhang',
            '日': 'ri', '常': 'chang', '生': 'sheng', '活': 'huo', '爱': 'ai',
            '中': 'zhong', '心': 'xin', '理': 'li', '想': 'xiang', '梦': 'meng',
            '时': 'shi', '间': 'jian', '分': 'fen', '享': 'xiang', '知': 'zhi',
            '识': 'shi', '今': 'jin', '天': 'tian', '美': 'mei', '丽': 'li',
          };
          return pinyinMap[char] || char;
        })
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tagIds: selectedTags
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '文章发布成功！' });
        setTimeout(() => router.push('/posts'), 1500);
      } else {
        const error = await res.json() as any;
        setMessage({ type: 'error', text: `发布失败: ${JSON.stringify(error)}` });
      }
    } catch (e) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${API_BASE}/api/upload?provider=cloudinary`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json() as any;
        setFormData(prev => ({ ...prev, coverImage: data.url }));
        setMessage({ type: 'success', text: '图片上传成功！' });
      } else {
        setMessage({ type: 'error', text: '图片上传失败' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: '上传出错，请重试' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">发布文章</h1>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? '发布中...' : '发布'}
          </button>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input w-full"
                placeholder="输入文章标题"
                required
              />
            </div>

            {/* Slug */}
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="input w-full"
                placeholder="article-url-slug"
                required
              />
              <p className="mt-2 text-sm text-gray-500">URL: /posts/{formData.slug || 'slug'}</p>
            </div>

            {/* Content */}
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">内容 (Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="input w-full font-mono"
                rows={20}
                placeholder="使用 Markdown 编写文章内容..."
                required
              />
            </div>

            {/* Excerpt */}
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="input w-full"
                rows={3}
                placeholder="文章摘要，用于列表页显示..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">发布设置</h3>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>立即发布</span>
              </label>
            </div>

            {/* Cover Image */}
            <div className="card p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                封面图片
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    className="input w-full"
                    placeholder="或者输入图片URL..."
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? '上传中...' : '上传图片'}
                  </button>
                </div>
                {formData.coverImage && (
                  <div className="relative mt-4">
                    <img 
                      src={formData.coverImage} 
                      alt="Cover preview" 
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">分类</h3>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="input w-full"
              >
                <option value="">选择分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="card p-6">
              <h3 className="font-bold mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    #{tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-gray-500">暂无标签</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}