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
  // Configure development server
  experimental: {
    // Disable server-side rendering for API routes in development
    serverComponentsExternalPackages: [],
  },
  async rewrites() {
    // Use local backend when developing so CORS and debugging are simpler.
    const apiDestination = process.env.NODE_ENV !== 'production'
      ? (process.env.API_BASE || 'http://localhost:5001')
      : 'https://echo5-rank-scope-be.onrender.com';

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