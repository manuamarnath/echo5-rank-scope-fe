import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage } from 'http';

interface ExtendedNextApiRequest extends NextApiRequest {
  method?: string;
  headers: IncomingMessage['headers'];
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Temporarily hardcode backend URL for testing
    const backendUrl = 'https://echo5-rank-scope-be.onrender.com';
    
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