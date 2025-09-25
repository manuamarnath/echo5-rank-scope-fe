import { NextApiRequest, NextApiResponse } from 'next';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const r = await fetch(`${BACKEND_URL}/api/blog-ideas/plan-from-keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': (req.headers.authorization as string) || '',
      },
      body: JSON.stringify(req.body || {}),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    console.error('BlogIdeas plan-from-keywords proxy error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
