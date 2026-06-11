import Link from 'next/link'
import { Search, Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="site-header">
      <div className="section-wrapper">
        <div className="header-wrapper">
          <Link href="/" className="site-title">
            <span className="gradient-text">News</span> Storm
          </Link>
          
          <nav className="main-navigation hidden md:block">
            <ul>
              <li><Link href="/">首页</Link></li>
              <li><Link href="/posts">文章</Link></li>
              <li><Link href="/about">关于</Link></li>
              <li><Link href="/admin">管理</Link></li>
            </ul>
          </nav>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="btn btn-primary hidden sm:inline-flex">
              <Link href="#">订阅</Link>
            </button>
            <button className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}