const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use default distDir (.next) and output (undefined/server) for Vercel
  // distDir and output lines removed to use standard Next.js defaults
  // Output standalone for Docker optimization
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', '@sparticuz/chromium'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.abacus.ai',
        pathname: '/images/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias['zod/v3'] = require.resolve('zod');
    if (isServer && Array.isArray(config.externals)) {
      config.externals.push({
        puppeteer: 'commonjs puppeteer',
        'puppeteer-extra': 'commonjs puppeteer-extra',
        'puppeteer-extra-plugin': 'commonjs puppeteer-extra-plugin',
        'puppeteer-extra-plugin-stealth': 'commonjs puppeteer-extra-plugin-stealth',
      });
    }
    return config;
  },
  // Security Headers (defense in depth - also set in middleware.ts)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
