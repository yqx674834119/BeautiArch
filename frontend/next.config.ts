import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 基础路径 - 用于部署到子目录
  basePath: '/SkeletonSkin',

  images: {
    // 禁用图片优化以避免路径问题 - 适用于部署到子目录
    unoptimized: true,
  },

  // 开发环境 API 重写（生产环境通过 Nginx 代理）
  async rewrites() {
    return {
      // beforeFiles rewrites 在 basePath 应用之前运行
      beforeFiles: [
        {
          // 匹配 /SkeletonSkin/api/* 请求，转发到后端
          source: '/SkeletonSkin/api/:path*',
          destination: 'http://localhost:5050/api/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;