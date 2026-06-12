import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import HeaderContent from '@/components/HeaderContent';
import FooterContent from '@/components/FooterContent';

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
      <body className="min-h-screen flex flex-col bg-gray-50">
        <LanguageProvider>
          <HeaderContent />
          {/* Flash News */}
          <div className="flash-news-outer-wrapper">
            <div className="section-wrapper">
              <div className="flash-news-wrapper">
                <span className="flash-news-label">最新</span>
                <div className="flash-news-content overflow-hidden">
                  <span className="whitespace-nowrap">欢迎访问 News Storm 博客平台 - 这里有最新最热的技术文章和生活分享</span>
                </div>
              </div>
            </div>
          </div>

          <main className="flex-1">
            {children}
          </main>

          <FooterContent />
        </LanguageProvider>
      </body>
    </html>
  );
}