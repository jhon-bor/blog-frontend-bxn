'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ExternalLink, Plus, Trash2, Search } from 'lucide-react';

interface StarLink {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  createdAt: string;
}

// Mock data - in production this would be synced with Obsidian vault
const mockStarLinks: StarLink[] = [
  {
    id: '1',
    title: 'Next.js 官方文档',
    url: 'https://nextjs.org/docs',
    description: 'Next.js 15 完全指南',
    tags: ['nextjs', 'react', 'docs'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'TailwindCSS 文档',
    url: 'https://tailwindcss.com/docs',
    description: 'TailwindCSS 快速入门',
    tags: ['tailwindcss', 'css', 'docs'],
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    title: 'TypeScript  handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/',
    description: 'TypeScript 官方教程',
    tags: ['typescript', 'docs'],
    createdAt: '2024-01-05'
  }
];

export default function StarLinkPage() {
  const [links, setLinks] = useState<StarLink[]>(mockStarLinks);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedByTag = filteredLinks.reduce((acc, link) => {
    link.tags.forEach(tag => {
      if (!acc[tag]) acc[tag] = [];
      acc[tag].push(link);
    });
    return acc;
  }, {} as Record<string, StarLink[]>);

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            星链收藏
          </h1>
          <p className="text-gray-600">Obsidian 星链笔记同步 · 收藏有价值的内容</p>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="搜索收藏..." 
              className="input pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/starlink/sync"
              className="btn btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              同步 Obsidian
            </Link>
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4" />
              添加链接
            </button>
          </div>
        </div>

        {/* Tags Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.keys(groupedByTag).map(tag => (
            <span 
              key={tag}
              className="px-3 py-1 bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-700 rounded-full text-sm cursor-pointer transition-colors"
            >
              #{tag} ({groupedByTag[tag].length})
            </span>
          ))}
        </div>

        {/* Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLinks.map(link => (
            <div key={link.id} className="card p-6 hover-lift group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-bold text-lg">{link.title}</h3>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              {link.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{link.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {link.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
                <a 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                >
                  访问
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLinks.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-500 mb-2">暂无收藏</h3>
            <p className="text-gray-400 mb-4">开始添加你的第一个星链链接</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              添加链接
            </button>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
            <h2 className="text-xl font-bold mb-4">添加星链链接</h2>
            <form className="space-y-4">
              <div>
                <label className="label">标题</label>
                <input type="text" className="input" placeholder="链接标题" />
              </div>
              <div>
                <label className="label">URL</label>
                <input type="url" className="input" placeholder="https://..." />
              </div>
              <div>
                <label className="label">描述</label>
                <textarea className="input" rows={3} placeholder="链接描述（可选）" />
              </div>
              <div>
                <label className="label">标签（用逗号分隔）</label>
                <input type="text" className="input" placeholder="tag1, tag2, tag3" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  取消
                </button>
                <button type="submit" className="btn btn-primary">
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}