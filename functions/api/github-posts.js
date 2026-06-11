export async function onRequest({ env }) {
  const GITHUB_TOKEN = env.GITHUB_TOKEN;

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'blog-frontend/1.0'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      'https://api.github.com/repos/jhon-bor/obsidian-blog/contents/Blog',
      { headers }
    );

    const text = await res.text();
    
    if (!res.ok) {
      return new Response(JSON.stringify({ 
        error: 'GitHub API error',
        status: res.status,
        data: text.substring(0, 500)
      }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = JSON.parse(text);
    const mdFiles = Array.isArray(data) 
      ? data.filter((f) => f.name?.endsWith('.md'))
      : [];

    return new Response(JSON.stringify({ files: mdFiles }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}