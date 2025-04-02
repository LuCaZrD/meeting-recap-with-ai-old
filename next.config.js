/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
    // Tối ưu kích thước bundle
    config.optimization = {
      ...config.optimization,
      minimize: true,
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 24000000, // 24MB để đảm bảo dưới giới hạn 25MB của Cloudflare
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: (module, chunks) => {
              const allChunksNames = chunks.map((item) => item.name).join('~');
              return `shared~${allChunksNames}`;
            },
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
        },
      },
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