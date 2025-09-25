import { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, headers, body, query } = req;

  try {
    const url = new URL(`${BACKEND_URL}/api/keywords`);

    Object.entries(query).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) value.forEach(v => url.searchParams.append(key, v));
        else url.searchParams.append(key, String(value));
      }
    });

    const backendResponse = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': (headers.authorization as string) || '',
      },
      ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
    });

    const data = await backendResponse.json();
    res.status(backendResponse.status).json(data);
  } catch (error) {
    console.error('Keywords API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
