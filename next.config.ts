import type { NextConfig } from "next";
import {
  getApiProxySkipPattern,
  getRailwayApiOrigin,
} from "./src/lib/api-origin";
import { getSecurityHeaders } from "./src/lib/security-headers";

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
  async headers() {
    const securityHeaders = getSecurityHeaders();
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    // Browser calls `/api/*` on leaguesports.co.za; Vercel reverse-proxies
    // to Railway so OAuth Set-Cookie is first-party. Local Next routes
    // (`/api/matches*`, `/api/realtime*`, `/api/venues/claim`) are excluded.
    const apiOrigin = getRailwayApiOrigin();
    const skip = getApiProxySkipPattern();

    return {
      afterFiles: [
        {
          source: "/api",
          destination: `${apiOrigin}/api`,
        },
        {
          source: `/api/:path((?!${skip}).*)`,
          destination: `${apiOrigin}/api/:path`,
        },
      ],
    };
  },
};

export default nextConfig;
