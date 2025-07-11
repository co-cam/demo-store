import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  reactStrictMode: false, // true in dev mode
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
