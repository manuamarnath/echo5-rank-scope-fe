import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://echo5-rank-scope-be.onrender.com';
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization header required' });

    const { path } = req.query;
    const pathString = Array.isArray(path) ? path.join('/') : (path || '');
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key === 'path') return;
      if (typeof value === 'string') queryParams.append(key, value);
      else if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
    });
    const targetUrl = `${backendUrl}/api/pagespeed-local${pathString ? `/${pathString}` : ''}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const requestOptions: RequestInit = {
      method: req.method,
      headers: { 'Authorization': authHeader, 'Content-Type': 'application/json' },
    };
    if (req.method && req.method !== 'GET' && req.method !== 'DELETE') {
      requestOptions.body = JSON.stringify(req.body || {});
    }

    const response = await fetch(targetUrl, requestOptions);
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    if (contentType.includes('application/json')) {
      try {
        const json = text ? JSON.parse(text) : {};
        return res.status(response.status).json(json);
      } catch {
        return res.status(500).json({ error: 'Invalid JSON from backend', responseText: text.substring(0, 200) });
      }
    }
    res.setHeader('Content-Type', contentType || 'text/plain');
    return res.status(response.status).send(text);
  } catch (error: any) {
    console.error('pagespeed-local proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
