/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  webpack: (config, { dev, isServer }) => {
    // Handle SQLite in webpack
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  },
  // Environment variables for API keys (will be loaded from .env.local)
  env: {
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    IEX_CLOUD_API_KEY: process.env.IEX_CLOUD_API_KEY,
    WINMORE_PASSWORD: process.env.WINMORE_PASSWORD,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  },
  // Security headers for private deployment
  async headers() {
    return [
      {
        // Allow static assets to be cached properly
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Security headers for all other routes
        source: '/((?!_next/static).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;