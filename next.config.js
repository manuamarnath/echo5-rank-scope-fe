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
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' ? `https://echo5-rank-scope-be.onrender.com/api/:path*` : `http://localhost:5001/api/:path*`, // Proxy to Backend with /api prefix
      },
      {
        source: '/health',
        destination: process.env.NODE_ENV === 'production' ? `https://echo5-rank-scope-be.onrender.com/health` : `http://localhost:5001/health`, // Direct health check
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
            value: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' 
              ? 'https://echo5-rank-scope-fe-e5i4.vercel.app' 
              : 'http://localhost:3000',
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