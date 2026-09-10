import type { NextConfig } from "next";
import { getApiProxyRewrites } from "./src/lib/api-origin";
import { getSecurityHeaders } from "./src/lib/security-headers";
import { HUB_PLAY_DEEP_LINK_REDIRECTS } from "./src/lib/sports/hub-redirects";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["three"],
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
      {
        protocol: "https",
        hostname: "media.formula1.com",
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
  async redirects() {
    return [
      {
        source: "/athlete-tools",
        destination: "/athletes",
        permanent: true,
      },
      ...HUB_PLAY_DEEP_LINK_REDIRECTS.map((row) => ({
        source: row.source,
        destination: row.destination,
        permanent: false,
      })),
    ];
  },
  async rewrites() {
    // Browser calls `/api/*` on leaguesports.co.za; Vercel reverse-proxies
    // to Railway so OAuth Set-Cookie is first-party. Local Next routes
    // (`/api/matches/:id/events`, `/api/realtime*`, `/api/venues/claim`,
    // `/api/f1-replay*`) are excluded and win via the App Router filesystem. Explicit match
    // and venue sources plus a catch-all proxy the rest to Railway.
    // No rewrites when the Railway origin is unset (Preview / local without env).
    return {
      beforeFiles: [
        // `generateSitemaps` serves `/sitemap/{id}.xml` and 404s `/sitemap.xml`.
        // Keep the conventional URL as an alias of the sitemap index.
        { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
      ],
      afterFiles: getApiProxyRewrites(),
    };
  },
};

export default nextConfig;
