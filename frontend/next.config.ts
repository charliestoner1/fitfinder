import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'mellow-curiosity-production.up.railway.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.railway.app',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,  
  },
  typescript: {
    ignoreBuildErrors: true,   
  },
};

export default nextConfig;