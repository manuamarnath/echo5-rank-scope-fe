import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingMessage } from 'http';

interface ExtendedNextApiRequest extends NextApiRequest {
  method?: string;
  headers: IncomingMessage['headers'];
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Use environment variable for backend URL, with proper fallbacks for production
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_BASE_URL || 
                      'https://echo5-rank-scope-be.onrender.com';
    
    console.log('Profile endpoint: Making request to:', `${backendUrl}/api/auth/me`);
    
    // Get authorization header properly
    const authHeader = req.headers.authorization as string || '';
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Backend responded with error:', response.status, data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Profile endpoint error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}