import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://echo5-rank-scope-be.onrender.com';
    const { path = [] } = req.query as { path?: string[] };
    const urlPath = Array.isArray(path) ? path.join('/') : String(path || '');
    const targetUrl = `${backendUrl.replace(/\/$/, '')}/api/heatmap/${urlPath}`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const auth = req.headers.authorization;
    if (auth) headers['Authorization'] = auth as string;

    const init: RequestInit = {
      method: req.method,
      headers,
    };
    if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
      init.body = JSON.stringify(req.body || {});
    }

    const r = await fetch(targetUrl + (req.url?.includes('?') ? `?${req.url?.split('?')[1]}` : ''), init);
    const text = await r.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = text; }
    res.status(r.status).send(data);
  } catch (err: any) {
    console.error('heatmap proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}
