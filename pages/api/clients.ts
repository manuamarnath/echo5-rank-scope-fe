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

    const targetUrl = `${backendUrl}/api/clients`;
    const method = req.method || 'GET';
    if (!['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].includes(method)) {
      res.setHeader('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const requestInit: RequestInit = {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    };
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      requestInit.body = JSON.stringify(req.body || {});
    }

    const response = await fetch(targetUrl, requestInit);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Backend clients proxy error:', response.status, data);
      return res.status(response.status).json(data);
    }

    // 201 for POST create, else 200
    const status = method === 'POST' ? 201 : 200;
    return res.status(status).json(data);
  } catch (error) {
    console.error('Clients API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}