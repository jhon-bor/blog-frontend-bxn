var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/github-posts.js
async function onRequest({ env }) {
  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  const headers = {
    "Accept": "application/json",
    "User-Agent": "blog-frontend/1.0"
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `token ${GITHUB_TOKEN}`;
  }
  try {
    const res = await fetch(
      "https://api.github.com/repos/jhon-bor/obsidian-blog/contents/Blog",
      { headers }
    );
    const text = await res.text();
    if (!res.ok) {
      return new Response(JSON.stringify({
        error: "GitHub API error",
        status: res.status,
        data: text.substring(0, 500)
      }), {
        status: res.status,
        headers: { "Content-Type": "application/json" }
      });
    }
    const data = JSON.parse(text);
    const mdFiles = Array.isArray(data) ? data.filter((f) => f.name?.endsWith(".md")) : [];
    return new Response(JSON.stringify({ files: mdFiles }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error2) {
    return new Response(JSON.stringify({
      error: "Server error",
      message: error2.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest, "onRequest");

// api/lib/utils.ts
function generateId() {
  return crypto.randomUUID();
}
__name(generateId, "generateId");
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(json, "json");
function error(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
__name(error, "error");
function slugify(text) {
  return text.toLowerCase().replace(/[\u4e00-\u9fa5]/g, (char) => {
    const pinyinMap = {
      "\u6211": "wo",
      "\u4F60": "ni",
      "\u4ED6": "ta",
      "\u662F": "shi",
      "\u7684": "de",
      "\u5728": "zai",
      "\u6709": "you",
      "\u548C": "he",
      "\u4E86": "le",
      "\u4E00": "yi",
      "\u4E2A": "ge",
      "\u4EBA": "ren",
      "\u4EEC": "men",
      "\u6765": "lai",
      "\u5230": "dao",
      "\u8FD9": "zhe",
      "\u91CC": "li",
      "\u770B": "kan",
      "\u89C1": "jian",
      "\u597D": "hao",
      "\u7528": "yong",
      "\u4F1A": "hui",
      "\u53EF": "ke",
      "\u4EE5": "yi",
      "\u5B66": "xue",
      "\u4E60": "xi",
      "\u5F00": "kai",
      "\u53D1": "fa",
      "\u7A0B": "cheng",
      "\u5E8F": "xu",
      "\u8BBE": "she",
      "\u8BA1": "ji",
      "\u6280": "ji",
      "\u672F": "shu",
      "\u7F51": "wang",
      "\u7AD9": "zhan",
      "\u535A": "bo",
      "\u5BA2": "ke",
      "\u6587": "wen",
      "\u7AE0": "zhang",
      "\u65E5": "ri",
      "\u5E38": "chang",
      "\u751F": "sheng",
      "\u6D3B": "huo",
      "\u7231": "ai",
      "\u4E2D": "zhong",
      "\u5FC3": "xin",
      "\u7406": "li",
      "\u60F3": "xiang",
      "\u68A6": "meng",
      "\u65F6": "shi",
      "\u95F4": "jian",
      "\u5206": "fen",
      "\u4EAB": "xiang",
      "\u77E5": "zhi",
      "\u8BC6": "shi",
      "\u4ECA": "jin",
      "\u5929": "tian",
      "\u7F8E": "mei",
      "\u4E3D": "li",
      "\u5927": "da",
      "\u5C0F": "xiao",
      "\u65B0": "xin",
      "\u65E7": "jiu",
      "\u5FEB": "kuai",
      "\u6162": "man",
      "\u9AD8": "gao",
      "\u4F4E": "di",
      "\u957F": "chang",
      "\u77ED": "duan",
      "\u51FA": "chu",
      "\u5165": "ru",
      "\u524D": "qian",
      "\u540E": "hou",
      "\u5DE6": "zuo",
      "\u53F3": "you",
      "\u4E0A": "shang",
      "\u4E0B": "xia",
      "\u767D": "bai",
      "\u9ED1": "hei",
      "\u7EA2": "hong",
      "\u7EFF": "lv",
      "\u84DD": "lan",
      "\u9EC4": "huang",
      "\u7D2B": "zi",
      "\u5E74": "nian",
      "\u6708": "yue",
      "\u5468": "zhou"
    };
    return pinyinMap[char] || char;
  }).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
__name(slugify, "slugify");
function getQueryParams(url) {
  const params = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}
__name(getQueryParams, "getQueryParams");

// api/routes/posts.ts
var posts_default = {
  async handle(path, request, env) {
    const url = new URL(request.url);
    const params = getQueryParams(url);
    if (request.method === "GET") {
      const limit = parseInt(params.limit || "50");
      const offset = parseInt(params.offset || "0");
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
      const bindings = [];
      if (category) {
        query += ` AND c.slug = ?`;
        bindings.push(category);
      }
      if (published !== void 0) {
        query += ` AND p.published = ?`;
        bindings.push(published === "true" ? 1 : 0);
      }
      if (tag) {
        query += ` AND t.slug = ?`;
        bindings.push(tag);
      }
      query += ` GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
      bindings.push(limit, offset);
      const result = await env.DB.prepare(query).bind(...bindings).all();
      const posts = result.results.map((p) => ({
        ...p,
        tags: p.tag_names ? p.tag_names.split(",").map((name, i) => ({
          name,
          slug: p.tag_slugs.split(",")[i]
        })) : [],
        published: Boolean(p.published)
      }));
      return json({ posts, total: posts.length });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const { title, slug, content, excerpt, coverImage, published, categoryId, tagIds } = body;
      if (!title) return error("\u6807\u9898\u4E0D\u80FD\u4E3A\u7A7A", 400);
      const postSlug = slug || slugify(title);
      const id = generateId();
      const existing = await env.DB.prepare("SELECT id FROM posts WHERE slug = ?").bind(postSlug).first();
      if (existing) return error("URL slug \u5DF2\u5B58\u5728\uFF0C\u8BF7\u4FEE\u6539", 400);
      await env.DB.prepare(`
        INSERT INTO posts (id, title, slug, content, excerpt, cover_image, published, category_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(id, title, postSlug, content || "", excerpt || "", coverImage || "", published ? 1 : 0, categoryId || null).run();
      if (tagIds && Array.isArray(tagIds)) {
        for (const tagId of tagIds) {
          await env.DB.prepare("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)").bind(id, tagId).run();
        }
      }
      const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
      return json({ post }, 201);
    }
    if (request.method === "PUT") {
      const body = await request.json();
      const { id, title, slug, content, excerpt, coverImage, published, categoryId, tagIds } = body;
      if (!id) return error("\u7F3A\u5C11\u6587\u7AE0ID", 400);
      const updates = [];
      const bindings = [];
      if (title) {
        updates.push("title = ?");
        bindings.push(title);
      }
      if (slug) {
        updates.push("slug = ?");
        bindings.push(slug);
      }
      if (content !== void 0) {
        updates.push("content = ?");
        bindings.push(content);
      }
      if (excerpt !== void 0) {
        updates.push("excerpt = ?");
        bindings.push(excerpt);
      }
      if (coverImage !== void 0) {
        updates.push("cover_image = ?");
        bindings.push(coverImage);
      }
      if (published !== void 0) {
        updates.push("published = ?");
        bindings.push(published ? 1 : 0);
      }
      if (categoryId !== void 0) {
        updates.push("category_id = ?");
        bindings.push(categoryId || null);
      }
      updates.push("updated_at = datetime('now')");
      if (updates.length > 0) {
        await env.DB.prepare(`UPDATE posts SET ${updates.join(", ")} WHERE id = ?`).bind(...bindings, id).run();
      }
      if (tagIds !== void 0 && Array.isArray(tagIds)) {
        await env.DB.prepare("DELETE FROM post_tags WHERE post_id = ?").bind(id).run();
        for (const tagId of tagIds) {
          await env.DB.prepare("INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)").bind(id, tagId).run();
        }
      }
      const post = await env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
      return json({ post });
    }
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return error("\u7F3A\u5C11\u6587\u7AE0ID", 400);
      await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
      return json({ success: true });
    }
    return error("Method not allowed", 405);
  }
};

// api/routes/categories.ts
var categories_default = {
  async handle(path, request, env) {
    const url = new URL(request.url);
    if (request.method === "GET") {
      const result = await env.DB.prepare(`
        SELECT c.*, COUNT(p.id) as post_count
        FROM categories c
        LEFT JOIN posts p ON p.category_id = c.id AND p.published = 1
        GROUP BY c.id
        ORDER BY c.name
      `).all();
      return json({ categories: result.results });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const { name, slug, description } = body;
      if (!name) return error("\u5206\u7C7B\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A", 400);
      const categorySlug = slug || slugify(name);
      const id = generateId();
      await env.DB.prepare(`
        INSERT INTO categories (id, name, slug, description)
        VALUES (?, ?, ?, ?)
      `).bind(id, name, categorySlug, description || "").run();
      const category = await env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first();
      return json({ category }, 201);
    }
    if (request.method === "PUT") {
      const body = await request.json();
      const { id, name, slug, description } = body;
      if (!id) return error("\u7F3A\u5C11\u5206\u7C7BID", 400);
      const updates = [];
      const bindings = [];
      if (name) {
        updates.push("name = ?");
        bindings.push(name);
      }
      if (slug) {
        updates.push("slug = ?");
        bindings.push(slug);
      }
      if (description !== void 0) {
        updates.push("description = ?");
        bindings.push(description);
      }
      updates.push("updated_at = datetime('now')");
      if (updates.length > 0) {
        await env.DB.prepare(`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`).bind(...bindings, id).run();
      }
      const category = await env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first();
      return json({ category });
    }
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return error("\u7F3A\u5C11\u5206\u7C7BID", 400);
      await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
      return json({ success: true });
    }
    return error("Method not allowed", 405);
  }
};

// api/routes/tags.ts
var tags_default = {
  async handle(path, request, env) {
    const url = new URL(request.url);
    if (request.method === "GET") {
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
    if (request.method === "POST") {
      const body = await request.json();
      const { name, slug } = body;
      if (!name) return error("\u6807\u7B7E\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A", 400);
      const tagSlug = slug || slugify(name);
      const id = generateId();
      await env.DB.prepare("INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)").bind(id, name, tagSlug).run();
      const tag = await env.DB.prepare("SELECT * FROM tags WHERE id = ?").bind(id).first();
      return json({ tag }, 201);
    }
    if (request.method === "PUT") {
      const body = await request.json();
      const { id, name, slug } = body;
      if (!id) return error("\u7F3A\u5C11\u6807\u7B7EID", 400);
      const updates = [];
      const bindings = [];
      if (name) {
        updates.push("name = ?");
        bindings.push(name);
      }
      if (slug) {
        updates.push("slug = ?");
        bindings.push(slug);
      }
      if (updates.length > 0) {
        await env.DB.prepare(`UPDATE tags SET ${updates.join(", ")} WHERE id = ?`).bind(...bindings, id).run();
      }
      const tag = await env.DB.prepare("SELECT * FROM tags WHERE id = ?").bind(id).first();
      return json({ tag });
    }
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return error("\u7F3A\u5C11\u6807\u7B7EID", 400);
      await env.DB.prepare("DELETE FROM tags WHERE id = ?").bind(id).run();
      return json({ success: true });
    }
    return error("Method not allowed", 405);
  }
};

// api/routes/comments.ts
var comments_default = {
  async handle(path, request, env) {
    const url = new URL(request.url);
    if (request.method === "GET") {
      const postId = url.searchParams.get("post_id");
      const approved = url.searchParams.get("approved");
      let query = "SELECT * FROM comments WHERE 1=1";
      const bindings = [];
      if (postId) {
        query += " AND post_id = ?";
        bindings.push(postId);
      }
      if (approved !== null) {
        query += " AND approved = ?";
        bindings.push(approved === "true" ? 1 : 0);
      }
      query += " ORDER BY created_at DESC";
      const result = await env.DB.prepare(query).bind(...bindings).all();
      return json({ comments: result.results.map((c) => ({ ...c, approved: Boolean(c.approved) })) });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const { post_id, author_name, author_email, content } = body;
      if (!post_id || !author_name || !content) {
        return error("\u7F3A\u5C11\u5FC5\u586B\u5B57\u6BB5", 400);
      }
      const id = generateId();
      await env.DB.prepare(`
        INSERT INTO comments (id, post_id, author_name, author_email, content)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, post_id, author_name, author_email || "", content).run();
      const comment = await env.DB.prepare("SELECT * FROM comments WHERE id = ?").bind(id).first();
      return json({ comment }, 201);
    }
    if (request.method === "PUT") {
      const body = await request.json();
      const { id, approved } = body;
      if (!id) return error("\u7F3A\u5C11\u8BC4\u8BBAID", 400);
      await env.DB.prepare("UPDATE comments SET approved = ? WHERE id = ?").bind(approved ? 1 : 0, id).run();
      const comment = await env.DB.prepare("SELECT * FROM comments WHERE id = ?").bind(id).first();
      return json({ comment });
    }
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return error("\u7F3A\u5C11\u8BC4\u8BBAID", 400);
      await env.DB.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
      return json({ success: true });
    }
    return error("Method not allowed", 405);
  }
};

// api/routes/media.ts
var media_default = {
  async handle(path, request, env) {
    const url = new URL(request.url);
    const apiUrl = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_SECRET_NAME}/image/upload`;
    if (request.method === "GET") {
      const result = await env.DB.prepare("SELECT * FROM media ORDER BY uploaded_at DESC LIMIT 100").all();
      return json({ files: result.results });
    }
    if (request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      if (!file) return error("\u6CA1\u6709\u4E0A\u4F20\u6587\u4EF6", 400);
      const id = generateId();
      const ext = file.name.split(".").pop() || "bin";
      const publicId = `blog/${id}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const b64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${b64}`;
      const timestamp = Math.floor(Date.now() / 1e3);
      const folder = "blog";
      const params = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
      const uploadResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: dataUri,
          folder,
          public_id: publicId,
          timestamp,
          api_key: env.CLOUDINARY_SECRET_KEY
        })
      });
      if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        return error(`Cloudinary\u4E0A\u4F20\u5931\u8D25: ${errText}`, 500);
      }
      const result = await uploadResponse.json();
      const fileUrl = result.secure_url;
      await env.DB.prepare(`
        INSERT INTO media (id, filename, url, mime_type, size)
        VALUES (?, ?, ?, ?, ?)
      `).bind(id, file.name, fileUrl, file.type, file.size).run();
      const media = await env.DB.prepare("SELECT * FROM media WHERE id = ?").bind(id).first();
      return json({ url: fileUrl, media }, 201);
    }
    if (request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return error("\u7F3A\u5C11\u6587\u4EF6ID", 400);
      const media = await env.DB.prepare("SELECT * FROM media WHERE id = ?").bind(id).first();
      if (media) {
        const urlParts = media.url.split("/");
        const uploadIndex = urlParts.findIndex((p) => p === "upload");
        const publicId = urlParts.slice(uploadIndex + 2).join("/").replace(/\.[^.]+$/, "");
        await fetch(apiUrl.replace("/upload", "/destroy"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_id: publicId,
            api_key: env.CLOUDINARY_SECRET_KEY
          })
        });
        await env.DB.prepare("DELETE FROM media WHERE id = ?").bind(id).run();
      }
      return json({ success: true });
    }
    return error("Method not allowed", 405);
  }
};

// api/routes/analytics.ts
var analytics_default = {
  async handle(path, request, env) {
    const url = new URL(request.url);
    const params = url.searchParams;
    if (params.get("type") === "overview") {
      const days = parseInt(params.get("days") || "7");
      const startDate = new Date(Date.now() - days * 864e5).toISOString().split("T")[0];
      const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;
      if (gaToken && propertyId) {
        try {
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${gaToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [
                  { name: "sessions" },
                  { name: "totalUsers" },
                  { name: "newUsers" },
                  { name: "screenPageViews" },
                  { name: "bounceRate" },
                  { name: "averageSessionDuration" }
                ],
                dimensions: [{ name: "date" }],
                orderBys: [{ dimension: { dimensionName: "date" } }]
              })
            }
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: "google", ga: data, days });
          }
        } catch (e) {
          console.error("GA API error:", e);
        }
      }
      const result = await env.DB.prepare(`
        SELECT date(created_at) as date, COUNT(*) as views, COUNT(DISTINCT path) as pages
        FROM page_views
        WHERE created_at >= datetime('now', '-${days} days')
        GROUP BY date(created_at)
        ORDER BY date DESC
      `).all();
      const totalViews = result.results.reduce((sum, r) => sum + r.views, 0);
      return json({
        source: "internal",
        daily: result.results,
        total: { views: totalViews, days: result.results.length },
        days
      });
    }
    if (params.get("type") === "pages") {
      const days = parseInt(params.get("days") || "30");
      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;
      if (gaToken && propertyId) {
        const startDate = new Date(Date.now() - days * 864e5).toISOString().split("T")[0];
        const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        try {
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${gaToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [
                  { name: "screenPageViews" },
                  { name: "sessions" },
                  { name: "averageSessionDuration" }
                ],
                dimensions: [{ name: "pagePath" }],
                orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
                limit: 20
              })
            }
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: "google", pages: data });
          }
        } catch (e) {
          console.error("GA API error:", e);
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
      return json({ source: "internal", pages: result.results, days });
    }
    if (params.get("type") === "traffic") {
      const days = parseInt(params.get("days") || "30");
      const startDate = new Date(Date.now() - days * 864e5).toISOString().split("T")[0];
      const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;
      if (gaToken && propertyId) {
        try {
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${gaToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [{ name: "sessions" }],
                dimensions: [
                  { name: "sessionSource" },
                  { name: "sessionMedium" }
                ],
                orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
                limit: 20
              })
            }
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: "google", traffic: data });
          }
        } catch (e) {
          console.error("GA API error:", e);
        }
      }
      return json({ source: "unavailable", message: "\u9700\u8981\u914D\u7F6E Google Analytics API token" });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const { path: path2, referrer, user_agent, country, city } = body;
      await env.DB.prepare(`
        INSERT INTO page_views (path, referrer, user_agent, country, city)
        VALUES (?, ?, ?, ?, ?)
      `).bind(path2 || "/", referrer || "", user_agent || "", country || "", city || "").run();
      return json({ success: true });
    }
    if (params.get("type") === "stats") {
      const days = parseInt(params.get("days") || "30");
      const postsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM posts WHERE published = 1").first();
      const viewsResult = await env.DB.prepare(`
        SELECT SUM(view_count) as total FROM posts WHERE published = 1
      `).first();
      const commentsCount = await env.DB.prepare("SELECT COUNT(*) as count FROM comments WHERE approved = 1").first();
      let gaStats = null;
      const gaToken = env.GOOGLE_ANALYTICS_TOKEN;
      const propertyId = env.GA_PROPERTY_ID;
      if (gaToken && propertyId) {
        const startDate = new Date(Date.now() - days * 864e5).toISOString().split("T")[0];
        const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        try {
          const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${gaToken}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                metrics: [
                  { name: "totalUsers" },
                  { name: "sessions" },
                  { name: "screenPageViews" },
                  { name: "newUsers" }
                ]
              })
            }
          );
          if (response.ok) {
            gaStats = await response.json();
          }
        } catch (e) {
        }
      }
      return json({
        posts: postsCount?.count || 0,
        totalViews: viewsResult?.total || 0,
        comments: commentsCount?.count || 0,
        gaStats,
        days
      });
    }
    return error("Unknown analytics type", 400);
  }
};

// api/routes/trends.ts
var trends_default = {
  async handle(path, request, env) {
    const url = new URL(request.url);
    const params = url.searchParams;
    if (request.method === "GET") {
      const keyword = params.get("q");
      const days = parseInt(params.get("days") || "30");
      const geo = params.get("geo") || "GLOBAL";
      if (!keyword) {
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
      const trendsToken = env.GOOGLE_TRENDS_TOKEN;
      const serpToken = env.SERPAPI_TOKEN;
      if (serpToken) {
        try {
          const response = await fetch(
            `https://serpapi.com/trends?q=${encodeURIComponent(keyword)}&geo=${geo}&date=today-${days}-d&api_key=${serpToken}`
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: "serpapi", keyword, data });
          }
        } catch (e) {
          console.error("SerpAPI error:", e);
        }
      }
      if (trendsToken) {
        try {
          const response = await fetch(
            `https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=-480&geo=${geo}&ns=15`
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: "google_trends", keyword, data });
          }
        } catch (e) {
        }
      }
      const mockData = this.generateMockTrends(keyword, days);
      return json({
        source: "mock",
        keyword,
        days,
        data: mockData,
        note: "\u914D\u7F6E SERPAPI_TOKEN \u6216 GOOGLE_TRENDS_TOKEN \u83B7\u53D6\u771F\u5B9E\u6570\u636E"
      });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const { keyword, result_count } = body;
      if (!keyword) return error("\u5173\u952E\u8BCD\u4E0D\u80FD\u4E3A\u7A7A", 400);
      await env.DB.prepare(`
        INSERT INTO search_keywords (keyword, result_count)
        VALUES (?, ?)
      `).bind(keyword, result_count || 0).run();
      return json({ success: true });
    }
    if (params.get("type") === "related") {
      const keyword = params.get("q") || "";
      const days = parseInt(params.get("days") || "30");
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
    if (params.get("type") === "compare") {
      const keywords = (params.get("q") || "").split(",").filter(Boolean);
      if (keywords.length < 2) return error("\u81F3\u5C11\u9700\u89812\u4E2A\u5173\u952E\u8BCD\u8FDB\u884C\u5BF9\u6BD4", 400);
      const serpToken = env.SERPAPI_TOKEN;
      if (serpToken) {
        try {
          const response = await fetch(
            `https://serpapi.com/compare?q=${keywords.map((k) => encodeURIComponent(k)).join(",")}&api_key=${serpToken}`
          );
          if (response.ok) {
            const data = await response.json();
            return json({ source: "serpapi", keywords, data });
          }
        } catch (e) {
          console.error("SerpAPI compare error:", e);
        }
      }
      const comparison = keywords.map((k) => ({
        keyword: k,
        popularity: Math.floor(Math.random() * 100),
        trend: Math.random() > 0.5 ? "rising" : "falling"
      }));
      return json({ source: "mock", keywords, comparison });
    }
    if (params.get("type") === "suggestions") {
      const topic = params.get("topic") || "";
      const suggestions = this.getContentSuggestions(topic);
      return json({ suggestions });
    }
    return error("Unknown trends type", 400);
  },
  generateMockTrends(keyword, days) {
    const data = [];
    const baseValue = 50 + Math.random() * 50;
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(Date.now() - i * 864e5);
      data.push({
        date: date.toISOString().split("T")[0],
        value: Math.floor(baseValue + Math.random() * 30 - 15)
      });
    }
    return data.reverse();
  },
  getContentSuggestions(topic) {
    const allTopics = [
      { topic: "AI", keywords: ["ChatGPT", "Claude", "Midjourney", "AI\u5DE5\u5177", "LLM\u5927\u6A21\u578B", "AI\u5199\u4F5C", "AI\u7F16\u7A0B"], angle: "\u6559\u7A0B\u3001\u6D4B\u8BC4\u3001\u8D8B\u52BF\u5206\u6790" },
      { topic: "\u6280\u672F", keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Python", "Rust"], angle: "\u5B9E\u6218\u6559\u7A0B\u3001\u6E90\u7801\u89E3\u6790\u3001\u6700\u4F73\u5B9E\u8DF5" },
      { topic: "\u4EA7\u54C1", keywords: ["\u4EA7\u54C1\u8BBE\u8BA1", "\u7528\u6237\u4F53\u9A8C", "\u589E\u957F\u9ED1\u5BA2", "\u6570\u636E\u5206\u6790", "\u7528\u6237\u7814\u7A76"], angle: "\u6848\u4F8B\u5206\u6790\u3001\u65B9\u6CD5\u8BBA\u3001\u5DE5\u5177\u63A8\u8350" },
      { topic: "\u6548\u7387", keywords: ["Notion", "Obsidian", "AI\u52A9\u624B", "\u81EA\u52A8\u5316", "\u5DE5\u4F5C\u6D41"], angle: "\u4F7F\u7528\u6280\u5DE7\u3001\u6A21\u677F\u5206\u4EAB\u3001\u751F\u4EA7\u529B\u63D0\u5347" },
      { topic: "\u521B\u4E1A", keywords: ["\u72EC\u7ACB\u5F00\u53D1", "SaaS", "\u53D8\u73B0", "\u8425\u9500", "\u589E\u957F"], angle: "\u7ECF\u9A8C\u5206\u4EAB\u3001\u5DE5\u5177\u63A8\u8350\u3001\u6848\u4F8B\u62C6\u89E3" }
    ];
    if (topic) {
      const matched = allTopics.find((t) => t.topic.toLowerCase().includes(topic.toLowerCase()));
      return matched || allTopics;
    }
    return allTopics;
  }
};

// api/[[path]].ts
var ROUTES = {
  "/api/posts": posts_default,
  "/api/categories": categories_default,
  "/api/tags": tags_default,
  "/api/comments": comments_default,
  "/api/media": media_default,
  "/api/analytics": analytics_default,
  "/api/trends": trends_default
};
async function onRequest2(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  for (const [prefix, router] of Object.entries(ROUTES)) {
    if (path.startsWith(prefix)) {
      const response = await router.handle(path, request, env);
      const headers = new Headers(response.headers);
      headers.set("Access-Control-Allow-Origin", "*");
      return new Response(response.body, {
        status: response.status,
        headers
      });
    }
  }
  if (path === "/api/health") {
    return new Response(JSON.stringify({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
__name(onRequest2, "onRequest");

// ../.wrangler/tmp/pages-XO7JoK/functionsRoutes-0.5614401199357408.mjs
var routes = [
  {
    routePath: "/api/github-posts",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/:path*",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  }
];

// ../../../../../opt/homebrew/lib/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error2) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error2;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error2 = reduceError(e);
    return Response.json(error2, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-v6c58W/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-v6c58W/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.3338122564801944.mjs.map
