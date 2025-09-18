import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Simple demo profile - replace with real JWT validation
  const user = {
    id: '1',
    email: 'demo@example.com',
    role: 'owner' as const,
    clientId: 'demo-client'
  };

  return res.status(200).json(user);
}