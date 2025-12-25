import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 基础路径 - 用于部署到子目录
  basePath: '/SkeletonSkin',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'livablecitylab.hkust-gz.edu.cn',
        pathname: '/SkeletonSkin/static/**',
      },
      {
        protocol: 'http',
        hostname: '10.30.58.75',
        port: '5050',
        pathname: '/static/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5050',
        pathname: '/static/**',
      },
    ],
  },

  // 开发环境 API 重写（生产环境通过 Nginx 代理）
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5050/api/:path*',
      },
    ];
  },
};

export default nextConfig;