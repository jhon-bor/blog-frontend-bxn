import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Search, Menu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'News Storm - 分享知识，记录成长',
  description: '一个现代化的博客平台，涵盖技术教程、产品思考和生活感悟',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="news-storm-header">
          <div className="section-wrapper">
            <div className="news-storm-header-wrapper">
              {/* Site Branding */}
              <div className="site-branding">
                <Link href="/" className="site-title">
                  <span style={{ color: '#D61515' }}>News</span> Storm
                </Link>
              </div>
              
              {/* Navigation */}
              <nav className="main-navigation">
                <ul>
                  <li><Link href="/">首页</Link></li>
                  <li>
                    <Link href="/posts">文章</Link>
                    <ul className="sub-menu">
                      <li><Link href="/category/tech">技术</Link></li>
                      <li><Link href="/category/product">产品</Link></li>
                      <li><Link href="/category/life">生活</Link></li>
                    </ul>
                  </li>
                  <li><Link href="/about">关于</Link></li>
                  <li><Link href="/admin">管理</Link></li>
                </ul>
              </nav>
              
              {/* Right Part */}
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="header-search-wrap">
                  <span className="search-icon">
                    <Search className="w-5 h-5" />
                  </span>
                  <div className="header-search-form">
                    <input type="search" placeholder="搜索文章..." />
                  </div>
                </div>
                
                {/* Subscribe Button */}
                <button className="header-custom-button">
                  <Link href="#">订阅</Link>
                </button>
                
                {/* Mobile Menu */}
                <button className="md:hidden p-2">
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Flash News */}
        <div className="flash-news-outer-wrapper">
          <div className="section-wrapper">
            <div className="flash-news-wrapper">
              <span className="flash-news-label">最新</span>
              <div className="flash-news-content">
                <span>🔥 欢迎访问 News Storm 博客平台 - 这里有最新最热的技术文章和生活分享</span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="site-footer">
          <div className="section-wrapper">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* About */}
              <div>
                <h4 className="widget-title">About Us</h4>
                <p className="text-white/80 text-sm mb-4">
                  News Storm 是一个现代化的博客平台，分享技术干货、产品思考和生活感悟。
                </p>
                <div className="social-icons">
                  <a href="#"><span>📘</span></a>
                  <a href="#"><span>🐦</span></a>
                  <a href="#"><span>📧</span></a>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="widget-title">快速链接</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/">首页</Link></li>
                  <li><Link href="/posts">全部文章</Link></li>
                  <li><Link href="/about">关于我们</Link></li>
                  <li><Link href="/admin">管理后台</Link></li>
                </ul>
              </div>
              
              {/* Categories */}
              <div>
                <h4 className="widget-title">分类</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/category/tech">技术教程</Link></li>
                  <li><Link href="/category/product">产品思考</Link></li>
                  <li><Link href="/category/life">生活感悟</Link></li>
                  <li><Link href="/category/news">行业资讯</Link></li>
                </ul>
              </div>
              
              {/* Newsletter */}
              <div>
                <div className="newsletter-widget">
                  <h3>📧 订阅更新</h3>
                  <p>订阅我们的 newsletter，获取最新文章推送</p>
                  <input type="email" placeholder="输入你的邮箱" />
                  <button type="submit">立即订阅</button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/20 pt-8 text-center text-sm text-white/60">
              <p>© {new Date().getFullYear()} News Storm. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}