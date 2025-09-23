import type { NextApiRequest, NextApiResponse } from 'next';
import type { IncomingHttpHeaders } from 'http';

interface ExtendedNextApiRequest extends NextApiRequest {
  headers: IncomingHttpHeaders;
}

export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
  // Use environment variable for backend URL, fallback to local
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
    
    // Forward the request to the backend
    const targetUrl = `${backendUrl}/api/auth/login`;
    console.log('Auth proxy: forwarding login to', targetUrl);
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // Inspect content type before parsing
    const contentType = response.headers.get('content-type') || '';
    let data: any;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Non-JSON response (likely HTML error page) — capture text for debugging
      const text = await response.text();
      data = { message: 'Non-JSON response from backend', contentType, body: text.substring(0, 200) };
    }

    if (!response.ok) {
      // Forward backend status + message
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Login endpoint error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}