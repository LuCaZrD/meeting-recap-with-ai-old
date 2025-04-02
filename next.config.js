/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '.next',
  images: {
    unoptimized: true,
  },
  typescript: {
    // Bỏ qua lỗi TypeScript trong quá trình build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua lỗi ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false,
      "path": false,
      "os": false,
    };
    return config;
  },
  reactStrictMode: true,
};

// Sử dụng cú pháp ES Module để tương thích với Node.js v23+
let withNextOnPages;
try {
  withNextOnPages = require('@cloudflare/next-on-pages/dist/index.js');
} catch (e) {
  console.warn('Cloudflare Pages integration not loaded');
  withNextOnPages = (config) => config;
}

module.exports = withNextOnPages(nextConfig);