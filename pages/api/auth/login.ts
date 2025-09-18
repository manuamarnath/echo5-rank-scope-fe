import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Simple demo authentication - replace with real backend API call
  if (email && password) {
    const user = {
      id: '1',
      email,
      role: 'owner' as const,
      clientId: 'demo-client'
    };

    return res.status(200).json({
      token: 'demo-jwt-token',
      user
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}