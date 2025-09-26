import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Client id is required' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_BASE_URL || 
                      'https://echo5-rank-scope-be.onrender.com';

    const method = req.method || 'GET';
    if (!['DELETE', 'PUT', 'GET'].includes(method)) {
      res.setHeader('Allow', 'GET, PUT, DELETE');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const targetUrl = `${backendUrl}/api/clients/demo/${id}`;
    const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
    if (method === 'PUT') {
      init.body = JSON.stringify(req.body || {});
    }

    const response = await fetch(targetUrl, init);
    const text = await response.text();
    let data: any = {};
    if (text && text.trim()) {
      try { data = JSON.parse(text); } catch { data = { message: text.substring(0, 200) }; }
    }

    return res.status(response.status).json(data);
  } catch (error: any) {
    console.error('Clients demo [id] API error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
