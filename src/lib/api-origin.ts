/**
 * Railway Express API origin used by:
 * - next.config rewrites (browser `/api/*` → Railway, first-party cookies)
 * - server-side fetches that talk to the API directly
 *
 * Browser code MUST call same-origin `/api/*` on the frontend host
 * (see `getRequestBase` in api-client.ts). Fetching this origin from the
 * browser skips the first-party proxy and breaks OAuth cookies.
 *
 * Do not point API_ORIGIN / NEXT_PUBLIC_API_URL at the frontend host —
 * that would loop the rewrite.
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

/** True when the proxy target is a local `league-sports-api` process. */
export function isLoopbackApiOrigin(origin: string): boolean {
  const host = hostnameOf(origin);
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]"
  );
}

/**
 * Loopback rewrite target from `API_ORIGIN` / `RAILWAY_API_URL` /
 * `NEXT_PUBLIC_API_URL`. Empty for Railway or an unconfigured origin —
 * production must not tell users to start a local API.
 */
export function getLoopbackApiProxyOrigin(
  env: NodeJS.Dict<string> = process.env,
): string {
  const candidates = [
    env.API_ORIGIN,
    env.RAILWAY_API_URL,
    env.NEXT_PUBLIC_API_URL,
  ];

  for (const raw of candidates) {
    const origin = stripTrailingSlash((raw ?? "").trim());
    if (!origin) continue;
    if (isFrontendOrigin(origin)) continue;
    return isLoopbackApiOrigin(origin) ? origin : "";
  }

  return "";
}

/** True when `origin` is this Next.js site (rewrite loop if used as proxy dest). */
export function isFrontendOrigin(origin: string): boolean {
  const host = hostnameOf(origin);
  if (!host) return false;
  if (SITE_HOSTS.has(host)) return true;
  return host.endsWith(".vercel.app");
}

function getApiProxySkipPattern(): string {
  // Match identity (POST/GET /api/matches, lock) is league-sports-api.
  // Ably live-scoring, fixture social feed/live board, and venue claim stay on Next.
  return "matches/.+/events(?:/|$)|realtime(?:/|$)|venues/claim(?:/|$)|fixtures/.+/(?:feed|live)(?:/|$)";
}

/**
 * Paths served by this Next.js app. Everything else under `/api` is proxied
 * to Railway, including `/api/venues/:cmsId` (not `/api/venues/claim`).
 */
const LOCAL_API_PATH = new RegExp(`^/api/(?:${getApiProxySkipPattern()})`);

export function shouldProxyApiPath(pathname: string): boolean {
  if (pathname === "/api") return true;
  if (!pathname.startsWith("/api/")) return false;
  return !LOCAL_API_PATH.test(pathname);
}

function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Server-side Railway origin. Empty when not configured.
 *
 * The hardcoded production Railway host is a fallback only when
 * `VERCEL_ENV === "production"`. Preview and local `next dev` with no env
 * must not rewrite or server-fetch production. Frontend origins are
 * rejected so the `/api` proxy cannot loop.
 *
 * Do not use this from browser code — call same-origin `/api/*`.
 */
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

  if (isVercelProduction()) {
    return PRODUCTION_RAILWAY_API_ORIGIN;
  }

  return "";
}

export function isApiConfigured(): boolean {
  return getRailwayApiOrigin().length > 0;
}

/**
 * Explicit Railway proxy sources. These must not rely only on the
 * negative-lookahead catch-all. `/api/matches/:id/events` stays local
 * (filesystem + skip pattern); `:id` is a single segment so it cannot
 * swallow `/lock` or `/events`.
 */
export const API_PROXY_EXPLICIT_SOURCES = [
  "/api/matches",
  "/api/matches/capture",
  "/api/matches/:id/lock",
  "/api/matches/:id",
  "/api/golf-rounds",
  "/api/golf-rounds/capture",
  "/api/golf-rounds/:id/lock",
  "/api/golf-rounds/:id",
  "/api/darts",
  "/api/darts/capture",
  "/api/darts/:id/turns",
  "/api/darts/:id",
  "/api/me/followed-venues",
  "/api/me/followed-fixtures",
  "/api/me/friends",
  "/api/me/friends/:userId/accept",
  "/api/me/friends/:userId",
  "/api/me/communities",
  "/api/me/training/plans",
  "/api/me/training/enrollments",
  "/api/me/training/enrollments/:id",
  "/api/me/integrations",
  "/api/me/integrations/:provider/connect",
  "/api/me/integrations/:provider/sync",
  "/api/me/integrations/:provider",
  "/api/communities",
  "/api/communities/:id",
  "/api/communities/:id/join",
  "/api/teams",
  "/api/teams/join",
  "/api/teams/search",
  "/api/teams/:id",
  "/api/teams/:id/invite",
  "/api/teams/:id/invite-link",
  "/api/teams/:id/leave",
  "/api/teams/:id/transfer-ownership",
  "/api/teams/:id/members/:userId",
  "/api/teams/:id/matches",
  "/api/teams/:id/tournaments",
  "/api/team-matches",
  "/api/team-matches/join",
  "/api/team-matches/mine",
  "/api/team-matches/:id",
  "/api/team-matches/:id/lineup",
  "/api/team-matches/:id/accept",
  "/api/team-matches/:id/decline",
  "/api/team-matches/:id/start",
  "/api/team-matches/:id/cancel",
  "/api/team-matches/:id/complete",
  "/api/tournaments",
  "/api/tournaments/join",
  "/api/tournaments/mine",
  "/api/tournaments/:id",
  "/api/tournaments/:id/open-registration",
  "/api/tournaments/:id/register",
  "/api/tournaments/:id/invite",
  "/api/tournaments/:id/registrations/:teamId/accept",
  "/api/tournaments/:id/registrations/:teamId/withdraw",
  "/api/tournaments/:id/registrations/:teamId/decline",
  "/api/tournaments/:id/generate-draw",
  "/api/tournaments/:id/start",
  "/api/tournaments/:id/fixtures/:slotId/start",
  "/api/golf-tours",
  "/api/golf-tours/mine",
  "/api/golf-tours/:id",
  "/api/golf-tours/:id/complete",
  "/api/golf-tours/:id/camps",
  "/api/golf-tours/:id/camps/:campId",
  "/api/golf-tours/:id/camps/:campId/roster",
  "/api/golf-tours/:id/camps/:campId/roster/:memberId",
  "/api/golf-tours/:id/standing-fourballs",
  "/api/golf-tours/:id/standing-fourballs/:templateId",
  "/api/golf-tours/:id/rounds",
  "/api/golf-tours/:id/rounds/:roundId",
  "/api/golf-tours/:id/rounds/:roundId/prepare",
  "/api/golf-tours/:id/rounds/:roundId/copy-from/:sourceRoundId",
  "/api/golf-tours/:id/rounds/:roundId/fourballs",
  "/api/golf-tours/:id/fourballs/:fourballId",
  "/api/golf-tours/:id/fourballs/:fourballId/start",
  "/api/golf-tours/:id/leaderboard",
  "/api/me/badges",
  "/api/me/preferences",
  "/api/users/search",
  "/api/venues/:cmsId/matches",
  "/api/venues/:cmsId/golf-rounds",
  "/api/venues/:cmsId/darts",
  "/api/venues/:cmsId/follow",
  "/api/fixtures/:slug/follow",
  "/api/venues/:cmsId",
  "/api/pools",
  "/api/pools/:idOrCode",
  "/api/pools/:idOrCode/join",
  "/api/pools/:idOrCode/picks",
  "/api/pools/:idOrCode/result",
  "/api/pools/:idOrCode/standings",
  "/api/organised-games",
  "/api/organised-games/invite/:token",
  "/api/organised-games/invite/:token/join",
  "/api/organised-games/:id/invites",
  "/api/organised-games/:id/rsvp",
  "/api/organised-games/:id/start",
  "/api/organised-games/:id/cancel",
  "/api/organised-games/:id",
  "/api/me/organised-games",
  "/api/me/notifications",
  "/api/me/notifications/read-all",
  "/api/me/notifications/:id/read",
  "/api/roadmap/features",
  "/api/roadmap/features/:id/vote",
  "/api/roadmap/features/:id/notify",
  "/api/roadmap/unsubscribe",
  "/api/roadmap/preferences",
  "/api/roadmap/requests",
  "/api/intents/coverage",
  "/api/intents/coverage/unsubscribe",
  "/api/lobby",
  "/api/lobby/looking",
  "/api/lobby/open-games",
  "/api/lobby/open-games/:id/join",
  "/api/lobby/open-games/:id/kick",
  "/api/lobby/proposals",
  "/api/lobby/proposals/:id/accept",
  "/api/lobby/proposals/:id/pass",
  "/api/openf1/meetings",
  "/api/openf1/meetings/:meetingKey",
  "/api/openf1/events/:eventSlug",
  "/api/openf1/sessions",
  "/api/openf1/sessions/:sessionKey",
] as const;

/** next.config `afterFiles` rewrites. Empty when the API is not configured. */
export function getApiProxyRewrites(): { source: string; destination: string }[] {
  const apiOrigin = getRailwayApiOrigin();
  if (!apiOrigin) return [];
  const skip = getApiProxySkipPattern();
  return [
    ...API_PROXY_EXPLICIT_SOURCES.map((source) => ({
      source,
      destination: `${apiOrigin}${source}`,
    })),
    { source: "/api", destination: `${apiOrigin}/api` },
    {
      source: `/api/:path((?!${skip}).*)`,
      destination: `${apiOrigin}/api/:path`,
    },
  ];
}
