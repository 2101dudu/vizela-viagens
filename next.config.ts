import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.optigest.net',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
