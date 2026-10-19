/**
 * Former Play deep links. Destinations are pages that still render.
 * Kept dependency-free so `next.config` can import it safely.
 */

export const HUB_PLAY_DEEP_LINK_REDIRECTS = [
  { source: "/organise", destination: "/play" },
  { source: "/play/organise", destination: "/play" },
  { source: "/play/padel/organise", destination: "/play/padel" },
  { source: "/play/golf/organise", destination: "/play/golf" },
  { source: "/play/lobby", destination: "/play" },
  { source: "/play/team-matches", destination: "/play" },
  {
    source: "/play/team-matches/:path*",
    destination: "/play",
  },
  { source: "/play/tournaments", destination: "/play" },
  {
    source: "/play/tournaments/:path*",
    destination: "/play",
  },
  { source: "/play/golf-tours", destination: "/play/golf" },
  {
    source: "/play/golf-tours/:path*",
    destination: "/play/golf",
  },
  { source: "/play/golf/tours", destination: "/play/golf" },
  {
    source: "/play/golf/tours/:path*",
    destination: "/play/golf",
  },
] as const;

/**
 * Pages that existed only for removed sport API routes.
 * `statusCode: 301` is set in next.config — do not use `permanent: true` (308).
 */
export const REMOVED_SPORT_REDIRECTS = [
  { source: "/padel", destination: "/play/padel" },
  { source: "/padel/:path*", destination: "/play/padel" },
  { source: "/golf", destination: "/play/golf" },
  { source: "/golf/:path*", destination: "/play/golf" },
  { source: "/darts", destination: "/play/darts" },
  { source: "/darts/:path*", destination: "/play/darts" },
  { source: "/golf-tours", destination: "/play/golf" },
  { source: "/golf-tours/:path*", destination: "/play/golf" },
  { source: "/lobby", destination: "/play" },
  { source: "/lobby/:path*", destination: "/play" },
  { source: "/g", destination: "/play/golf" },
  { source: "/g/:path*", destination: "/play/golf" },
  { source: "/w", destination: "/play/golf" },
  { source: "/w/:path*", destination: "/play/golf" },
  { source: "/scorecard", destination: "/play" },
  { source: "/play/quick", destination: "/play" },
  { source: "/play/join", destination: "/play" },
  { source: "/play/join/:path*", destination: "/play" },
  { source: "/play/organised", destination: "/play" },
  { source: "/play/organised/:path*", destination: "/play" },
  { source: "/teams", destination: "/?tab=people" },
  { source: "/teams/:path*", destination: "/?tab=people" },
  { source: "/team-matches", destination: "/play" },
  { source: "/team-matches/:path*", destination: "/play" },
  { source: "/tournaments", destination: "/play" },
  { source: "/tournaments/:path*", destination: "/play" },
  { source: "/training", destination: "/athletes" },
  { source: "/integrations", destination: "/athletes" },
  { source: "/pools", destination: "/play" },
  { source: "/pools/:path*", destination: "/play" },
] as const;
