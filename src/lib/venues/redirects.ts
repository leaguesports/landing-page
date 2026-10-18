/**
 * Permanent venue aliases for `next.config` `redirects()`.
 *
 * `permanent: true` in this app is HTTP 308 (Next.js default). This alias
 * sets `statusCode: 301` so the move is the classic permanent redirect.
 */
export const VENUE_PERMANENT_REDIRECTS = [
  {
    source: "/venues/bryanston-sports-club-bowls",
    destination: "/venues/bryanston-sports-club",
    statusCode: 301,
  },
] as const;

const VENUE_SLUG = /^\/venues\/([^/]+)$/;

const REDIRECTED_VENUE_SLUGS = new Set(
  VENUE_PERMANENT_REDIRECTS.flatMap((row) => {
    const slug = VENUE_SLUG.exec(row.source)?.[1];
    return slug ? [slug] : [];
  }),
);

export function redirectedVenueSlugs(): ReadonlySet<string> {
  return REDIRECTED_VENUE_SLUGS;
}

export function isRedirectedVenueSlug(slug: string): boolean {
  return REDIRECTED_VENUE_SLUGS.has(slug);
}
