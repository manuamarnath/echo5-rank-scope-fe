// Configuration utility for environment-specific settings
declare const process: {
  env: {
    NEXT_PUBLIC_API_BASE_URL?: string;
    NEXT_PUBLIC_ENVIRONMENT?: string;
  };
};

export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  isDevelopment: process.env.NEXT_PUBLIC_ENVIRONMENT === 'development',
  isProduction: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production',
};

// API endpoints
export const endpoints = {
  auth: {
    login: `${config.apiBaseUrl}/auth/login`,
    register: `${config.apiBaseUrl}/auth/register`,
    profile: `${config.apiBaseUrl}/auth/profile`,
  },
  content: {
    generate: `${config.apiBaseUrl}/content/generate`,
    test: `${config.apiBaseUrl}/content/test`,
  },
  clients: `${config.apiBaseUrl}/clients`,
  briefs: `${config.apiBaseUrl}/briefs`,
  keywords: `${config.apiBaseUrl}/keywords`,
  pages: `${config.apiBaseUrl}/pages`,
  tasks: `${config.apiBaseUrl}/tasks`,
  reports: `${config.apiBaseUrl}/report`,
  health: `${config.apiBaseUrl}/health`,
};

export default config;