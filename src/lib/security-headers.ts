type HeaderTuple = { key: string; value: string };

/**
 * Production security headers for leaguesports.co.za.
 *
 * CSP is intentionally compatible with Next.js inline hydration scripts,
 * Google Analytics (`@next/third-parties/google`), next/image remote
 * patterns, CARTO tiles on venue maps, Ably websockets, and Google OAuth
 * as a top-level redirect (not an iframe). `unsafe-eval` is omitted.
 *
 * HSTS matches current Vercel production (`max-age=63072000`) without
 * includeSubDomains — unknown HTTPS coverage on other subdomains.
 *
 * Access-Control-Allow-Origin is not set here. Same-origin `/api/*`
 * does not need CORS; wildcard CORS on HTML is not defined in this repo.
 */
export function getSecurityHeaders(): HeaderTuple[] {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    [
      "img-src 'self' data: blob:",
      "https://images.unsplash.com",
      "https://cdn.sanity.io",
      "https://images.motorsport-magazin.com",
      "https://images.sportschau.de",
      "https://img.redbull.com",
      "https://*.basemaps.cartocdn.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3002"] : []),
    ].join(" "),
    [
      "connect-src 'self'",
      "https://www.google-analytics.com",
      "https://analytics.google.com",
      "https://region1.google-analytics.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://www.googletagmanager.com",
      "https://*.ably.io",
      "https://*.ably.net",
      "https://*.ably-realtime.com",
      "wss://*.ably.io",
      "wss://*.ably.net",
      "wss://*.ably-realtime.com",
      "https://cdn.sanity.io",
      "https://*.api.sanity.io",
      "https://league-sports-api-production.up.railway.app",
    ].join(" "),
    "worker-src 'self' blob:",
    "frame-src 'self' https://www.googletagmanager.com",
    "upgrade-insecure-requests",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value:
        "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
    },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
  ];
}
