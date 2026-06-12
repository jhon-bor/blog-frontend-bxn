import { Env } from '../env';
import { json, error, generateId } from '../lib/utils';

export default {
  async handle(path: string, request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // GET /api/comments?post_id=xxx
    if (request.method === 'GET') {
      const postId = url.searchParams.get('post_id');
      const approved = url.searchParams.get('approved');

      let query = 'SELECT * FROM comments WHERE 1=1';
      const bindings: any[] = [];

      if (postId) { query += ' AND post_id = ?'; bindings.push(postId); }
      if (approved !== null) { query += ' AND approved = ?'; bindings.push(approved === 'true' ? 1 : 0); }

      query += ' ORDER BY created_at DESC';
      const result = await env.DB.prepare(query).bind(...bindings).all();
      return json({ comments: result.results.map((c: any) => ({ ...c, approved: Boolean(c.approved) })) });
    }

    // POST /api/comments - Create comment
    if (request.method === 'POST') {
      const body = await request.json() as any;
      const { post_id, author_name, author_email, content } = body;

      if (!post_id || !author_name || !content) {
        return error('缺少必填字段', 400);
      }

      const id = generateId();
      await env.DB.prepare(`
        INSERT INTO comments (id, post_id, author_name, author_email, content)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, post_id, author_name, author_email || '', content).run();

      const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
      return json({ comment }, 201);
    }

    // PUT /api/comments - Approve/reject comment
    if (request.method === 'PUT') {
      const body = await request.json() as any;
      const { id, approved } = body;
      if (!id) return error('缺少评论ID', 400);

      await env.DB.prepare('UPDATE comments SET approved = ? WHERE id = ?').bind(approved ? 1 : 0, id).run();
      const comment = await env.DB.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
      return json({ comment });
    }

    // DELETE /api/comments
    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return error('缺少评论ID', 400);
      await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
      return json({ success: true });
    }

    return error('Method not allowed', 405);
  },
};