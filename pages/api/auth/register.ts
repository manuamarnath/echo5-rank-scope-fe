import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, role } = req.body;

  // Simple demo registration - replace with real backend API call
  if (email && password && role) {
    const user = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      role: role as 'owner' | 'employee' | 'client',
      clientId: role === 'owner' ? undefined : 'demo-client'
    };

    return res.status(201).json({
      token: 'demo-jwt-token',
      user
    });
  }

  return res.status(400).json({ message: 'Missing required fields' });
}