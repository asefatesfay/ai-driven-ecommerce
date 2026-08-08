import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "n.nordstrommedia.com",
      },
    ],
  },
};

export default nextConfig;
