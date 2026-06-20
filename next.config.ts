import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3002",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.motorsport-magazin.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.sportschau.de",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.redbull.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
