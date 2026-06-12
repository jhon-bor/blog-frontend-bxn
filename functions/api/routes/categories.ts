import { Env } from '../env';
import { json, error, generateId, slugify } from '../lib/utils';

export default {
  async handle(path: string, request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // GET /api/categories
    if (request.method === 'GET') {
      const result = await env.DB.prepare(`
        SELECT c.*, COUNT(p.id) as post_count
        FROM categories c
        LEFT JOIN posts p ON p.category_id = c.id AND p.published = 1
        GROUP BY c.id
        ORDER BY c.name
      `).all();
      return json({ categories: result.results });
    }

    // POST /api/categories - Create
    if (request.method === 'POST') {
      const body = await request.json();
      const { name, slug, description } = body;

      if (!name) return error('分类名称不能为空', 400);

      const categorySlug = slug || slugify(name);
      const id = generateId();

      await env.DB.prepare(`
        INSERT INTO categories (id, name, slug, description)
        VALUES (?, ?, ?, ?)
      `).bind(id, name, categorySlug, description || '').run();

      const category = await env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
      return json({ category }, 201);
    }

    // PUT /api/categories - Update
    if (request.method === 'PUT') {
      const body = await request.json();
      const { id, name, slug, description } = body;

      if (!id) return error('缺少分类ID', 400);

      const updates: string[] = [];
      const bindings: any[] = [];

      if (name) { updates.push('name = ?'); bindings.push(name); }
      if (slug) { updates.push('slug = ?'); bindings.push(slug); }
      if (description !== undefined) { updates.push('description = ?'); bindings.push(description); }
      updates.push("updated_at = datetime('now')");

      if (updates.length > 0) {
        await env.DB.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings, id).run();
      }

      const category = await env.DB.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
      return json({ category });
    }

    // DELETE /api/categories
    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return error('缺少分类ID', 400);
      await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    return error('Method not allowed', 405);
  },
};