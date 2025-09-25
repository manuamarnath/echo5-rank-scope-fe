import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_BASE_URL || 
                      'https://echo5-rank-scope-be.onrender.com';

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        queryParams.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      }
    });

    const targetUrl = `${backendUrl}/api/clients/pagespeed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const data = await response.json();
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (error: any) {
    console.error('Clients/pagespeed proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
