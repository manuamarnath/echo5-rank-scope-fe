import config from '../../lib/config';

export async function listBlogIdeas(clientId: string) {
  const res = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/blog-ideas?clientId=${clientId}`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '' }
  });
  return res.json();
}

export async function generateBlogIdeas(clientId: string) {
  const res = await fetch(`${config.apiBaseUrl.replace(/\/$/, '')}/api/blog-ideas/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '' },
    body: JSON.stringify({ clientId })
  });
  return res.json();
}
