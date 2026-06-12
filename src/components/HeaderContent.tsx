'use client';

import Link from 'next/link';
import { Search, Menu } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function HeaderContent() {
  const { t } = useLanguage();

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="section-wrapper">
        <div className="header-wrapper">
          {/* Site Branding */}
          <Link href="/" className="site-title">
            <span className="gradient-text">News</span> Storm
          </Link>
          
          {/* Navigation */}
          <nav className="main-navigation hidden md:block">
            <ul>
              <li><Link href="/">{t('home')}</Link></li>
              <li><Link href="/posts">{t('articles')}</Link></li>
              <li><Link href="/about">{t('about')}</Link></li>
              <li><Link href="/admin">{t('admin')}</Link></li>
            </ul>
          </nav>
          
          {/* Right Part */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button className="p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Subscribe Button */}
            <button className="btn btn-primary hidden sm:inline-flex">
              <Link href="#">{t('subscribe')}</Link>
            </button>
            
            {/* Mobile Menu */}
            <button className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}