import { Env } from '../env';
import { json, error, generateId } from '../lib/utils';

export default {
  async handle(path: string, request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const apiUrl = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_SECRET_NAME}/image/upload`;

    // GET /api/media - List media
    if (request.method === 'GET') {
      const result = await env.DB.prepare('SELECT * FROM media ORDER BY uploaded_at DESC LIMIT 100').all() as any;
      return json({ files: result.results });
    }

    // POST /api/media - Upload image
    if (request.method === 'POST') {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) return error('没有上传文件', 400);

      const id = generateId();
      const ext = file.name.split('.').pop() || 'bin';
      const publicId = `blog/${id}.${ext}`;

      // Read file as base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const b64 = buffer.toString('base64');
      const dataUri = `data:${file.type};base64,${b64}`;

      // Upload to Cloudinary via direct API
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = 'blog';

      // Build params for signature
      const params = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;

      const uploadResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: dataUri,
          folder: folder,
          public_id: publicId,
          timestamp: timestamp,
          api_key: env.CLOUDINARY_SECRET_KEY,
        }),
      });

      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        return error(`Cloudinary上传失败: ${errText}`, 500);
      }

      const result = await uploadResponse.json() as any;
      const fileUrl = result.secure_url;

      // Save to database
      await env.DB.prepare(`
        INSERT INTO media (id, filename, url, mime_type, size)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, file.name, fileUrl, file.type, file.size).run();

      const media = await env.DB.prepare('SELECT * FROM media WHERE id = ?').bind(id).first();
      return json({ url: fileUrl, media }, 201);
    }

    // DELETE /api/media?id=xxx
    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return error('缺少文件ID', 400);

      const media = await env.DB.prepare('SELECT * FROM media WHERE id = ?').bind(id).first();
      if (media) {
        // Extract public_id from Cloudinary URL
        const urlParts = (media as any).url.split('/');
        const uploadIndex = urlParts.findIndex((p: string) => p === 'upload');
        const publicId = urlParts.slice(uploadIndex + 2).join('/').replace(/\.[^.]+$/, '');

        // Delete from Cloudinary
        await fetch(apiUrl.replace('/upload', '/destroy'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_id: publicId,
            api_key: env.CLOUDINARY_SECRET_KEY,
          }),
        });

        await env.DB.prepare('DELETE FROM media WHERE id = ?').bind(id).run();
      }
      return json({ success: true });
    }

    return error('Method not allowed', 405);
  },
};