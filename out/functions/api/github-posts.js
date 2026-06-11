export async function onRequest({ env }) {
  const GITHUB_TOKEN = env.GITHUB_TOKEN;
  const REPO_OWNER = 'jhon-bor';
  const REPO_NAME = 'obsidian-blog';
  const FOLDER_PATH = 'Blog';

  try {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FOLDER_PATH}`,
      { headers }
    );

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const files = await res.json();
    const mdFiles = Array.isArray(files) 
      ? files.filter((f) => f.name?.endsWith('.md'))
      : [];

    return new Response(JSON.stringify({ files: mdFiles }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}