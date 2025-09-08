import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    serverActions: {
      bodySizeLimit: '100mb' 
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ]
      }
    ]
  }
};

export default nextConfig;
