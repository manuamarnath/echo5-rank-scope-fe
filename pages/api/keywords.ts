import { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'https://echo5-rank-scope-be.onrender.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, headers, body, query } = req;

  try {
    const url = new URL(`${BACKEND_URL}/api/keywords`);
    
    // Append query parameters
    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v));
        } else {
          url.searchParams.append(key, value);
        }
      }
    });

    const backendResponse = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': headers.authorization || '',
      },
      ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return res.status(backendResponse.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Keywords API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}