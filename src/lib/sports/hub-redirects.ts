/**
 * Play-tab deep-link redirects for #192.
 * Kept dependency-free so `next.config` can import it safely.
 */

export const HUB_PLAY_DEEP_LINK_REDIRECTS = [
  { source: "/organise", destination: "/play/organise" },
  { source: "/play/lobby", destination: "/lobby" },
  { source: "/play/team-matches", destination: "/team-matches" },
  {
    source: "/play/team-matches/:path*",
    destination: "/team-matches/:path*",
  },
  { source: "/play/tournaments", destination: "/tournaments" },
  {
    source: "/play/tournaments/:path*",
    destination: "/tournaments/:path*",
  },
  { source: "/play/golf-tours", destination: "/golf-tours" },
  {
    source: "/play/golf-tours/:path*",
    destination: "/golf-tours/:path*",
  },
] as const;
