import { Env } from '../env';
import { json, error, generateId, slugify, getQueryParams } from '../lib/utils';

export default {
  async handle(path: string, request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const params = getQueryParams(url);

    // GET /api/posts - List posts
    if (request.method === 'GET') {
      const limit = parseInt(params.limit || '50');
      const offset = parseInt(params.offset || '0');
      const category = params.category;
      const tag = params.tag;
      const published = params.published;

      let query = `
        SELECT p.*, c.name as category_name, c.slug as category_slug,
               GROUP_CONCAT(t.name) as tag_names,
               GROUP_CONCAT(t.slug) as tag_slugs
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE 1=1
      `;
      const bindings: any[] = [];

      if (category) {
        query += ` AND c.slug = ?`;
        bindings.push(category);
      }
      if (published !== undefined) {
        query += ` AND p.published = ?`;
        bindings.push(published === 'true' ? 1 : 0);
      }
      if (tag) {
        query += ` AND t.slug = ?`;
        bindings.push(tag);
      }

      query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
      bindings.push(limit, offset);

      const result = await env.DB.prepare(query).bind(...bindings).all();
      
      // Parse tag arrays
      const posts = result.results.map((p: any) => ({
        ...p,
        tags: p.tag_names ? p.tag_names.split(',').map((name: string, i: number) => ({
          name,
          slug: p.tag_slugs.split(',')[i],
        })) : [],
        published: Boolean(p.published),
      }));

      return json({ posts, total: posts.length });
    }

    // POST /api/posts - Create post
    if (request.method === 'POST') {
      const body = await request.json() as any;
      const { title, slug, content, excerpt, coverImage, published, categoryId, tagIds } = body;

      if (!title) return error('标题不能为空', 400);

      const postSlug = slug || slugify(title);
      const id = generateId();

      // Check slug uniqueness
      const existing = await env.DB.prepare('SELECT id FROM posts WHERE slug = ?').bind(postSlug).first();
      if (existing) return error('URL slug 已存在，请修改', 400);

      await env.DB.prepare(`
        INSERT INTO posts (id, title, slug, content, excerpt, cover_image, published, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, title, postSlug, content || '', excerpt || '', coverImage || '', published ? 1 : 0, categoryId || null).run();

      // Add tags
      if (tagIds && Array.isArray(tagIds)) {
        for (const tagId of tagIds) {
          await env.DB.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(id, tagId).run();
        }
      }

      const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      return json({ post }, 201);
    }

    // PUT /api/posts - Update post
    if (request.method === 'PUT') {
      const body = await request.json() as any;
      const { id, title, slug, content, excerpt, coverImage, published, categoryId, tagIds } = body;

      if (!id) return error('缺少文章ID', 400);

      const updates: string[] = [];
      const bindings: any[] = [];

      if (title) { updates.push('title = ?'); bindings.push(title); }
      if (slug) { updates.push('slug = ?'); bindings.push(slug); }
      if (content !== undefined) { updates.push('content = ?'); bindings.push(content); }
      if (excerpt !== undefined) { updates.push('excerpt = ?'); bindings.push(excerpt); }
      if (coverImage !== undefined) { updates.push('cover_image = ?'); bindings.push(coverImage); }
      if (published !== undefined) { updates.push('published = ?'); bindings.push(published ? 1 : 0); }
      if (categoryId !== undefined) { updates.push('category_id = ?'); bindings.push(categoryId || null); }

      updates.push("updated_at = datetime('now')");

      if (updates.length > 0) {
        await env.DB.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings, id).run();
      }

      // Update tags
      if (tagIds !== undefined && Array.isArray(tagIds)) {
        await env.DB.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(id).run();
        for (const tagId of tagIds) {
          await env.DB.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(id, tagId).run();
        }
      }

      const post = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      return json({ post });
    }

    // DELETE /api/posts
    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return error('缺少文章ID', 400);
      await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    return error('Method not allowed', 405);
  },
};