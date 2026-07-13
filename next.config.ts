import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "framer-motion"],
  },
  serverExternalPackages: [
    "sweph",
    "pino",
    "pino-pretty",
    "@prisma/client",
    "ioredis",
    "pg",
    "mongoose",
    "mongodb",
  ],
};

export default nextConfig;
