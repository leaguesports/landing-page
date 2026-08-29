/**
 * Railway Express API origin used by:
 * - next.config rewrites (browser `/api/*` → Railway, first-party cookies)
 * - server-side fetches that talk to the API directly
 *
 * Browser code must call same-origin `/api/*` on leaguesports.co.za.
 * Do not point NEXT_PUBLIC_API_URL at the frontend host — that would loop
 * the rewrite.
 */
export const PRODUCTION_RAILWAY_API_ORIGIN =
  "https://league-sports-api-production.up.railway.app";

const SITE_HOSTS = new Set([
  "leaguesports.co.za",
  "www.leaguesports.co.za",
]);

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function hostnameOf(origin: string): string | null {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

/** True when `origin` is this Next.js site (rewrite loop if used as proxy dest). */
export function isFrontendOrigin(origin: string): boolean {
  const host = hostnameOf(origin);
  if (!host) return false;
  if (SITE_HOSTS.has(host)) return true;
  return host.endsWith(".vercel.app");
}

/**
 * Paths served by this Next.js app. Everything else under `/api` is proxied
 * to Railway, including `/api/venues/:cmsId` (not `/api/venues/claim`).
 */
const LOCAL_API_PATH = /^\/api\/(?:matches(?:\/|$)|realtime(?:\/|$)|venues\/claim(?:\/|$))/;

export function shouldProxyApiPath(pathname: string): boolean {
  if (pathname === "/api") return true;
  if (!pathname.startsWith("/api/")) return false;
  return !LOCAL_API_PATH.test(pathname);
}

/** path-to-regexp negative lookahead for next.config `rewrites`. */
export function getApiProxySkipPattern(): string {
  return "matches(?:/|$)|realtime(?:/|$)|venues/claim(?:/|$)";
}

export function getRailwayApiOrigin(): string {
  const candidates = [
    process.env.API_ORIGIN,
    process.env.RAILWAY_API_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];

  for (const raw of candidates) {
    const origin = stripTrailingSlash((raw ?? "").trim());
    if (!origin) continue;
    if (isFrontendOrigin(origin)) continue;
    return origin;
  }

  return PRODUCTION_RAILWAY_API_ORIGIN;
}

export function isApiConfigured(): boolean {
  return getRailwayApiOrigin().length > 0;
}
