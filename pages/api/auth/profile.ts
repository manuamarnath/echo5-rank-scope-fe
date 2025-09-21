import jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  // Validate the token (replace with real JWT validation)
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    clientId: decoded.clientId
  };
  return res.status(200).json(user);
}