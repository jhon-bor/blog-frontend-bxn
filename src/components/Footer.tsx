import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-wrapper">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-lg font-bold text-white mb-4">关于我们</h4>
            <p className="text-gray-400 text-sm mb-4">
              News Storm 是一个现代化的博客平台，分享技术干货、产品思考和生活感悟。
            </p>
            <div className="social-icons">
              <a href="#"><span>📘</span></a>
              <a href="#"><span>🐦</span></a>
              <a href="#"><span>📧</span></a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">快速链接</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-400 hover:text-white">首页</Link></li>
              <li><Link href="/posts" className="text-gray-400 hover:text-white">全部文章</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">关于我们</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">分类</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/category/tech" className="text-gray-400 hover:text-white">技术教程</Link></li>
              <li><Link href="/category/product" className="text-gray-400 hover:text-white">产品思考</Link></li>
              <li><Link href="/category/life" className="text-gray-400 hover:text-white">生活感悟</Link></li>
            </ul>
          </div>
          <div>
            <div className="newsletter-widget">
              <h3>📧 订阅更新</h3>
              <p>订阅获取最新文章</p>
              <input type="email" placeholder="输入邮箱" />
              <button type="button">订阅</button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} News Storm</p>
        </div>
      </div>
    </footer>
  )
}