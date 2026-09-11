/**
 * Play-tab deep-link redirects for #192 / #212.
 * Kept dependency-free so `next.config` can import it safely.
 *
 * Global Organise hub URLs fold into the `/play` sport grid. Sport-scoped
 * organise aliases land on the existing `/{sport}/organise` forms.
 */

export const HUB_PLAY_DEEP_LINK_REDIRECTS = [
  { source: "/organise", destination: "/play" },
  { source: "/play/organise", destination: "/play" },
  { source: "/play/padel/organise", destination: "/padel/organise" },
  { source: "/play/golf/organise", destination: "/golf/organise" },
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
  { source: "/play/golf/tours", destination: "/golf-tours" },
  {
    source: "/play/golf/tours/:path*",
    destination: "/golf-tours/:path*",
  },
] as const;
