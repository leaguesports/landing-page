import { missingObjectOgTitle } from "../conversion/deep-links.ts";

export type PublishedVenueHit = { slug: string };

export type PublishedVenueRoute<T extends PublishedVenueHit> =
  | { kind: "found"; venue: T }
  | { kind: "not-found" };

/**
 * Gate for `/venues/[venue]`. The page calls `notFound()` when this is
 * `not-found`. `getVenueBySlug` uses the published Sanity client, so drafts
 * and unpublished documents arrive here as null — same exclusion as today.
 */
export function resolvePublishedVenueRoute<T extends PublishedVenueHit>(
  venue: T | null | undefined,
): PublishedVenueRoute<T> {
  if (!venue?.slug) return { kind: "not-found" };
  return { kind: "found", venue };
}

/**
 * Head for a missing venue. Returns a value instead of throwing so
 * `generateMetadata` still completes when Sanity has no published document.
 */
export function metadataForMissingVenue(slug: string): {
  title: string;
  robots: { index: false; follow: false };
} {
  return {
    title: missingObjectOgTitle("venue", slug),
    robots: { index: false, follow: false },
  };
}
