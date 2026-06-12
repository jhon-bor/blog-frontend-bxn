import { Env } from '../env';
import { json, error } from '../lib/utils';

export default {
  async handle(path: string, request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const params = url.searchParams;

    // GET /api/analytics/overview - Google Analytics overview
    if (params.get('type') === 'overview') {
      const days = parseInt(params.get('days') || '7');
      const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;

      if (gaToken && propertyId) {
        try {
          // Google Analytics Data API v1beta
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${gaToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [
                  { name: 'sessions' },
                  { name: 'totalUsers' },
                  { name: 'newUsers' },
                  { name: 'screenPageViews' },
                  { name: 'bounceRate' },
                  { name: 'averageSessionDuration' },
                ],
                dimensions: [{ name: 'date' }],
                orderBys: [{ dimension: { dimensionName: 'date' } }],
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            return json({ source: 'google', ga: data, days });
          }
        } catch (e) {
          console.error('GA API error:', e);
        }
      }

      // Fallback: use internal page_views table
      const result = await env.DB.prepare(`
        SELECT date(created_at) as date, COUNT(*) as views, COUNT(DISTINCT path) as pages
        FROM page_views
        WHERE created_at >= datetime('now', '-${days} days')
        GROUP BY date(created_at)
        ORDER BY date DESC
      `).all();

      const totalViews = result.results.reduce((sum: number, r: any) => sum + r.views, 0);
      return json({
        source: 'internal',
        daily: result.results,
        total: { views: totalViews, days: result.results.length },
        days,
      });
    }

    // GET /api/analytics/pages - Most visited pages
    if (params.get('type') === 'pages') {
      const days = parseInt(params.get('days') || '30');

      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;

      if (gaToken && propertyId) {
        const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];

        try {
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${gaToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [
                  { name: 'screenPageViews' },
                  { name: 'sessions' },
                  { name: 'averageSessionDuration' },
                ],
                dimensions: [{ name: 'pagePath' }],
                orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
                limit: 20,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            return json({ source: 'google', pages: data });
          }
        } catch (e) {
          console.error('GA API error:', e);
        }
      }

      const result = await env.DB.prepare(`
        SELECT path, COUNT(*) as views
        FROM page_views
        WHERE created_at >= datetime('now', '-${days} days')
        GROUP BY path
        ORDER BY views DESC
        LIMIT 20
      `).all();

      return json({ source: 'internal', pages: result.results, days });
    }

    // GET /api/analytics/traffic - Traffic sources
    if (params.get('type') === 'traffic') {
      const days = parseInt(params.get('days') || '30');
      const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;

      if (gaToken && propertyId) {
        try {
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${gaToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [{ name: 'sessions' }],
                dimensions: [
                  { name: 'sessionSource' },
                  { name: 'sessionMedium' },
                ],
                orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
                limit: 20,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            return json({ source: 'google', traffic: data });
          }
        } catch (e) {
          console.error('GA API error:', e);
        }
      }

      return json({ source: 'unavailable', message: '需要配置 Google Analytics API token' });
    }

    // POST /api/analytics/track - Track a page view
    if (request.method === 'POST') {
      const body = await request.json();
      const { path, referrer, user_agent, country, city } = body;

      await env.DB.prepare(`
        INSERT INTO page_views (path, referrer, user_agent, country, city)
        VALUES (?, ?, ?, ?, ?)
      `).bind(path || '/', referrer || '', user_agent || '', country || '', city || '').run();

      return json({ success: true });
    }

    // GET /api/analytics/stats - Dashboard stats
    if (params.get('type') === 'stats') {
      const days = parseInt(params.get('days') || '30');

      const postsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM posts WHERE published = 1').first();
      const viewsResult = await env.DB.prepare(`
        SELECT SUM(view_count) as total FROM posts WHERE published = 1
      `).first();
      const commentsCount = await env.DB.prepare('SELECT COUNT(*) as count FROM comments WHERE approved = 1').first();

      let gaStats = null;
      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;

      if (gaToken && propertyId) {
        const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];

        try {
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${gaToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [
                  { name: 'totalUsers' },
                  { name: 'sessions' },
                  { name: 'screenPageViews' },
                  { name: 'newUsers' },
                ],
              }),
            }
          );

          if (response.ok) {
            gaStats = await response.json();
          }
        } catch (e) {
          // ignore
        }
      }

      return json({
        posts: postsCount?.count || 0,
        totalViews: viewsResult?.total || 0,
        comments: commentsCount?.count || 0,
        gaStats,
        days,
      });
    }

    return error('Unknown analytics type', 400);
  },
};