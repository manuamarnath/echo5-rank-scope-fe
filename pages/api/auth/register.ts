import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
  // Prefer environment variable for backend URL in production, fall back to deployed backend
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://echo5-rank-scope-be.onrender.com';
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(201).json(data);
  } catch (error) {
    console.error('Register endpoint error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}