import { Env } from './env';
import postsRouter from './routes/posts';
import categoriesRouter from './routes/categories';
import tagsRouter from './routes/tags';
import commentsRouter from './routes/comments';
import mediaRouter from './routes/media';
import analyticsRouter from './routes/analytics';
import trendsRouter from './routes/trends';

const ROUTES = {
  '/api/posts': postsRouter,
  '/api/categories': categoriesRouter,
  '/api/tags': tagsRouter,
  '/api/comments': commentsRouter,
  '/api/media': mediaRouter,
  '/api/analytics': analyticsRouter,
  '/api/trends': trendsRouter,
};

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Route matching
  for (const [prefix, router] of Object.entries(ROUTES)) {
    if (path.startsWith(prefix)) {
      const response = await router.handle(path, request, env);
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(response.body, {
        status: response.status,
        headers,
      });
    }
  }

  // Health check
  if (path === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}