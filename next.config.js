/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable webpack cache to prevent hot reload issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      // Fix hot reload issues
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**'],
      };
    }
    return config;
  },
  // Ensure proper routing for SPA behavior
  trailingSlash: false,
  generateEtags: false,
  // Configure development server
  experimental: {
    // Disable server-side rendering for API routes in development
    serverComponentsExternalPackages: [],
  },
  async rewrites() {
    // In production, we use API routes (pages/api) instead of direct backend calls
    // In development, we can optionally proxy to local backend
    if (process.env.NODE_ENV === 'production') {
      return []; // No rewrites in production - use API routes
    }
    
    // Development only - optional proxy to local backend
    const apiDestination = process.env.API_BASE || 'http://localhost:5001';
    console.log('Development API destination:', apiDestination);

    return [
      {
        source: '/api/:path*',
        destination: `${apiDestination}/api/:path*`, // Proxy to backend (local in dev)
      },
      {
        source: '/health',
        destination: `${apiDestination.replace(/\/$/,'')}/health`, // Direct health check
      },
    ];
  },
  // Enable CORS for development
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            // Allow local dev origin in development, keep strict origin in production
            value: process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : 'https://echo5-rank-scope-fe-e5i4.vercel.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;