import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_BASE_URL || 
                      'https://echo5-rank-scope-be.onrender.com';
    
    console.log('Debug endpoint: Backend URL configured as:', backendUrl);
    
    // Test connection to backend
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.text();
    
    return res.status(200).json({
      message: 'Debug info',
      backendUrl,
      backendResponse: {
        status: response.status,
        statusText: response.statusText,
        data: data.substring(0, 200) // Truncate for safety
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        BACKEND_URL: process.env.BACKEND_URL,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return res.status(500).json({ 
      message: 'Debug endpoint error', 
      error: error.message,
      backendUrl: process.env.BACKEND_URL || 'undefined'
    });
  }
}