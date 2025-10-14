import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'djangobackend.com'],  // Add backend domain here
    formats: ['image/webp', 'image/avif'],
},
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',  // Default to local backend if not set
  },
};

export default nextConfig;
