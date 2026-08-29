import type { NextConfig } from "next";
import { getApiProxyRewrites } from "./src/lib/api-origin";
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
    // (`/api/matches/:id`, `/api/matches/:id/events`, `/api/realtime*`,
    // `/api/venues/claim`) are excluded. POST `/api/matches` is proxied.
    // No rewrites when the Railway origin is unset (Preview / local without env).
    return {
      afterFiles: getApiProxyRewrites(),
    };
  },
};

export default nextConfig;
