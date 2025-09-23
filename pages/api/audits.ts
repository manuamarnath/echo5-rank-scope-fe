import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const backendUrl = process.env.BACKEND_URL || 
                      process.env.NEXT_PUBLIC_API_BASE_URL || 
                      'https://echo5-rank-scope-be.onrender.com';
    
    // Get authorization header from the request
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    // Build query string from request query parameters
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        queryParams.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, v));
      }
    });
    
    const queryString = queryParams.toString();
    const targetUrl = `${backendUrl}/api/audits${queryString ? `?${queryString}` : ''}`;
    
    console.log('Audits API: forwarding to', targetUrl);

    // Determine the method and prepare the request options
    const requestOptions: RequestInit = {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST, PUT, PATCH requests
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      requestOptions.body = JSON.stringify(req.body);
    }

    // Forward the request to the backend
    const response = await fetch(targetUrl, requestOptions);

    // Check if the response has content
    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      const text = await response.text();
      if (text.trim()) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Response text:', text.substring(0, 200));
          return res.status(500).json({ 
            error: 'Invalid JSON response from backend',
            responseText: text.substring(0, 200)
          });
        }
      } else {
        data = {};
      }
    } else {
      // Non-JSON response
      const text = await response.text();
      data = { 
        error: 'Non-JSON response from backend', 
        contentType, 
        responseText: text.substring(0, 200) 
      };
    }
    
    if (!response.ok) {
      console.error('Backend audits error:', response.status, data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Audits API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}