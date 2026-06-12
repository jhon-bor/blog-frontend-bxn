'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function FooterContent() {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="section-wrapper">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">{t('about_us')}</h4>
            <p className="text-gray-400 text-sm mb-4">
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
            <h4 className="text-lg font-bold text-white mb-4">{t('quick_links')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white">{t('home')}</Link></li>
              <li><Link href="/posts" className="text-gray-400 hover:text-white">{t('articles')}</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">{t('about')}</Link></li>
              <li><Link href="/admin" className="text-gray-400 hover:text-white">{t('admin')}</Link></li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">{t('categories')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/tech" className="text-gray-400 hover:text-white">{t('tech_tutorials')}</Link></li>
              <li><Link href="/category/product" className="text-gray-400 hover:text-white">{t('product_thinking')}</Link></li>
              <li><Link href="/category/life" className="text-gray-400 hover:text-white">{t('life_insights')}</Link></li>
              <li><Link href="/category/news" className="text-gray-400 hover:text-white">{t('industry_news')}</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <div className="newsletter-widget">
              <h3>📧 {t('newsletter')}</h3>
              <p>{t('subscribe_desc')}</p>
              <input type="email" placeholder={t('email_placeholder')} />
              <button type="submit">{t('subscribe_now')}</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} News Storm. {t('all_rights')}.</p>
        </div>
      </div>
    </footer>
  );
}