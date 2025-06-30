import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.optigest.net',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'photos.hotelbeds.com',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'images.xtravelsystem.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.worldota.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'i.travelapi.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
