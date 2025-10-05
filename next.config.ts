import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maplestory.io',
        pathname: '/api/GMS/83/map/**',
      },
    ],
  },
};

export default nextConfig;
