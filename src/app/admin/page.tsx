'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Tag, 
  Image, 
  Users, 
  Settings,
  LogOut,
  Plus,
  Search,
  MoreHorizontal,
  BarChart3,
  TrendingUp
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: '仪表盘', href: '/admin' },
  { icon: FileText, label: '文章', href: '/admin/posts' },
  { icon: FolderOpen, label: '分类', href: '/admin/categories' },
  { icon: Tag, label: '标签', href: '/admin/tags' },
  { icon: Image, label: '媒体库', href: '/admin/media' },
  { icon: Users, label: '用户', href: '/admin/users' },
  { icon: Settings, label: '设置', href: '/admin/settings' },
];

const dataMenuItems = [
  { icon: BarChart3, label: '数据分析', href: '/admin/analytics', color: 'text-blue-400' },
  { icon: TrendingUp, label: '关键词研究', href: '/admin/keywords', color: 'text-green-400' },
];

// Mock data
const stats = {
  totalPosts: 42,
  totalViews: 12580,
  totalComments: 328,
  totalUsers: 12
};

const recentPosts = [
  { id: '1', title: 'Next.js 15 完全指南', status: 'published', views: 1234, createdAt: '2024-01-15' },
  { id: '2', title: '打造完美用户体验', status: 'draft', views: 0, createdAt: '2024-01-14' },
  { id: '3', title: 'TypeScript 高级技巧', status: 'published', views: 2345, createdAt: '2024-01-10' },
];

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">管理后台</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
          
          {/* Data Section */}
          {sidebarOpen && (
            <div className="pt-4 pb-2">
              <p className="px-3 text-xs text-gray-500 uppercase tracking-wider">数据分析</p>
            </div>
          )}
          {dataMenuItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors ${item.color || ''}`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors w-full text-red-400">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">仪表盘</h2>
            <p className="text-gray-600">欢迎回来，今天是美好的一天！</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Link href="/admin/posts/new" className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建文章
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">文章总数</p>
                <p className="text-3xl font-bold">{stats.totalPosts}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">总浏览量</p>
                <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">评论总数</p>
                <p className="text-3xl font-bold">{stats.totalComments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">用户总数</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="card">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">最近文章</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">浏览</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日期</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      <Link href={`/posts/${post.id}`} className="text-gray-900 hover:text-primary-600">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{post.views}</td>
                    <td className="px-6 py-4 text-gray-500">{post.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}