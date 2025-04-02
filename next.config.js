/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  compress: true,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['next-themes'],
  typescript: {
    // Bỏ qua lỗi TypeScript trong quá trình build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua lỗi ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Tối ưu kích thước bundle
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 24400000, // 24MB
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    }
    return config
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