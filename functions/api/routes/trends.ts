import { Env } from '../env';
import { json, error } from '../lib/utils';

export default {
  async handle(path: string, request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const params = url.searchParams;

    // GET /api/trends?q=keyword&days=30 - Google Trends data
    if (request.method === 'GET') {
      const keyword = params.get('q');
      const days = parseInt(params.get('days') || '30');
      const geo = params.get('geo') || 'GLOBAL';

      if (!keyword) {
        // Return popular keywords from search log
        const result = await env.DB.prepare(`
          SELECT keyword, COUNT(*) as count, MAX(created_at) as last_searched
          FROM search_keywords
          WHERE created_at >= datetime('now', '-30 days')
          GROUP BY keyword
          ORDER BY count DESC
          LIMIT 20
        `).all();
        return json({ keywords: result.results });
      }

      // Use Google Trends API via serpsapi or direct
      const trendsToken = env.GOOGLE_TRENDS_TOKEN;
      const serpToken = env.SERPAPI_TOKEN;

      if (serpToken) {
        // Use SerpAPI Google Trends
        try {
          const response = await fetch(
            `https://serpapi.com/trends?q=${encodeURIComponent(keyword)}&geo=${geo}&date=today-${days}-d&api_key=${serpToken}`
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: 'serpapi', keyword, data });
          }
        } catch (e) {
          console.error('SerpAPI error:', e);
        }
      }

      // Fallback: Use pytrends (needs server-side) or Google Trends publicly
      // For Workers, we can use the unofficial Google Trends API
      if (trendsToken) {
        try {
          const response = await fetch(
            `https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-480&geo=${geo}&ns=15`,
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: 'google_trends', keyword, data });
          }
        } catch (e) {
          // ignore
        }
      }

      // Mock data for demo - shows keyword popularity over time
      const mockData = this.generateMockTrends(keyword, days);
      return json({
        source: 'mock',
        keyword,
        days,
        data: mockData,
        note: '配置 SERPAPI_TOKEN 或 GOOGLE_TRENDS_TOKEN 获取真实数据',
      });
    }

    // POST /api/trends - Log a search keyword
    if (request.method === 'POST') {
      const body = await request.json();
      const { keyword, result_count } = body;

      if (!keyword) return error('关键词不能为空', 400);

      await env.DB.prepare(`
        INSERT INTO search_keywords (keyword, result_count)
        VALUES (?, ?)
      `).bind(keyword, result_count || 0).run();

      return json({ success: true });
    }

    // GET /api/trends/related - Related queries
    if (params.get('type') === 'related') {
      const keyword = params.get('q') || '';
      const days = parseInt(params.get('days') || '30');

      // Return related searches from our logs
      const result = await env.DB.prepare(`
        SELECT keyword, COUNT(*) as count
        FROM search_keywords
        WHERE keyword LIKE ? AND created_at >= datetime('now', '-${days} days')
        GROUP BY keyword
        ORDER BY count DESC
        LIMIT 20
      `).bind(`%${keyword}%`).all();

      return json({ related: result.results });
    }

    // GET /api/trends/compare?q=keyword1,keyword2 - Compare keywords
    if (params.get('type') === 'compare') {
      const keywords = (params.get('q') || '').split(',').filter(Boolean);
      if (keywords.length < 2) return error('至少需要2个关键词进行对比', 400);

      const serpToken = env.SERPAPI_TOKEN;
      if (serpToken) {
        try {
          const response = await fetch(
            `https://serpapi.com/compare?q=${keywords.map(k => encodeURIComponent(k)).join(',')}&api_key=${serpToken}`
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: 'serpapi', keywords, data });
          }
        } catch (e) {
          console.error('SerpAPI compare error:', e);
        }
      }

      // Mock comparison
      const comparison = keywords.map(k => ({
        keyword: k,
        popularity: Math.floor(Math.random() * 100),
        trend: Math.random() > 0.5 ? 'rising' : 'falling',
      }));
      return json({ source: 'mock', keywords, comparison });
    }

    // GET /api/trends/suggestions - Keyword suggestions for blog
    if (params.get('type') === 'suggestions') {
      const topic = params.get('topic') || '';

      // Provide AI-powered content suggestions based on popular topics
      const suggestions = this.getContentSuggestions(topic);
      return json({ suggestions });
    }

    return error('Unknown trends type', 400);
  },

  generateMockTrends(keyword: string, days: number) {
    const data = [];
    const baseValue = 50 + Math.random() * 50;
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(Date.now() - i * 86400000);
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(baseValue + Math.random() * 30 - 15),
      });
    }
    return data.reverse();
  },

  getContentSuggestions(topic: string) {
    const allTopics = [
      { topic: 'AI', keywords: ['ChatGPT', 'Claude', 'Midjourney', 'AI工具', 'LLM大模型', 'AI写作', 'AI编程'], angle: '教程、测评、趋势分析' },
      { topic: '技术', keywords: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Python', 'Rust'], angle: '实战教程、源码解析、最佳实践' },
      { topic: '产品', keywords: ['产品设计', '用户体验', '增长黑客', '数据分析', '用户研究'], angle: '案例分析、方法论、工具推荐' },
      { topic: '效率', keywords: ['Notion', 'Obsidian', 'AI助手', '自动化', '工作流'], angle: '使用技巧、模板分享、生产力提升' },
      { topic: '创业', keywords: ['独立开发', 'SaaS', '变现', '营销', '增长'], angle: '经验分享、工具推荐、案例拆解' },
    ];

    if (topic) {
      const matched = allTopics.find(t => t.topic.toLowerCase().includes(topic.toLowerCase()));
      return matched || allTopics;
    }
    return allTopics;
  },
};