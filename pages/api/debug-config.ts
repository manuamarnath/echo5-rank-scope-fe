import type { NextApiRequest, NextApiResponse } from 'next';

declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_ENVIRONMENT?: string;
  };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'undefined',
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'undefined',
  defaultBackendUrl: 'https://echo5-rank-scope-be.onrender.com',
    timestamp: new Date().toISOString()
  });
}