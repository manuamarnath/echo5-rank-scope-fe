import { NextApiRequest, NextApiResponse } from 'next';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = new URL(`${BACKEND_URL}/api/heatmap/coverage`);
    Object.entries(req.query).forEach(([k,v]) => {
      if (!v) return; if (Array.isArray(v)) v.forEach(x=>url.searchParams.append(k,x)); else url.searchParams.append(k,String(v));
    });
    const r = await fetch(url.toString(), { headers: { 'Authorization': (req.headers.authorization as string) || '' } });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    console.error('Heatmap coverage proxy error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
