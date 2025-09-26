import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_BASE_URL || 
                      'https://echo5-rank-scope-be.onrender.com';

    if (req.method === 'GET') {
      const response = await fetch(`${backendUrl}/api/clients/demo`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Backend clients demo GET error:', response.status, data);
        return res.status(response.status).json(data);
      }
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const response = await fetch(`${backendUrl}/api/clients/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body || {}),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error('Backend clients demo POST error:', response.status, data);
        return res.status(response.status).json(data);
      }
      return res.status(201).json(data);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Clients demo API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
