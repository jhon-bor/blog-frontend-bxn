import { Env } from '../env';
import { json, error, generateId, slugify } from '../lib/utils';

export default {
  async handle(path: string, request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET') {
      const result = await env.DB.prepare(`
        SELECT t.*, COUNT(pt.post_id) as post_count
        FROM tags t
        LEFT JOIN post_tags pt ON t.id = pt.post_id
        LEFT JOIN posts p ON pt.post_id = p.id AND p.published = 1
        GROUP BY t.id
        ORDER BY t.name
      `).all();
      return json({ tags: result.results });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const { name, slug } = body;
      if (!name) return error('标签名称不能为空', 400);

      const tagSlug = slug || slugify(name);
      const id = generateId();
      await env.DB.prepare('INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)').bind(id, name, tagSlug).run();

      const tag = await env.DB.prepare('SELECT * FROM tags WHERE id = ?').bind(id).first();
      return json({ tag }, 201);
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const { id, name, slug } = body;
      if (!id) return error('缺少标签ID', 400);

      const updates: string[] = [];
      const bindings: any[] = [];
      if (name) { updates.push('name = ?'); bindings.push(name); }
      if (slug) { updates.push('slug = ?'); bindings.push(slug); }
      if (updates.length > 0) {
        await env.DB.prepare(`UPDATE tags SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings, id).run();
      }
      const tag = await env.DB.prepare('SELECT * FROM tags WHERE id = ?').bind(id).first();
      return json({ tag });
    }

    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return error('缺少标签ID', 400);
      await env.DB.prepare('DELETE FROM tags WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    return error('Method not allowed', 405);
  },
};