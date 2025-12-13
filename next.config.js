const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: process.env.NEXT_OUTPUT_MODE,
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer',
      'puppeteer-extra',
      'puppeteer-extra-plugin',
      'puppeteer-extra-plugin-stealth',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: { unoptimized: true },
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
};

module.exports = nextConfig;
