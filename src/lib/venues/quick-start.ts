import {
  isPadelVenue,
  type VenueOption,
} from "../padel/venue-options.ts";

export type VenueQuickStartActivity = {
  id: string;
  sportSlug: string;
  name: string;
  href: string;
  cta: string;
  description: string;
};

/** Deep link into `/padel/new` with an optional court preselected. */
export function padelNewHref(venueSlug?: string | null): string {
  const slug = venueSlug?.trim();
  if (!slug) return "/padel/new";
  return `/padel/new?venue=${encodeURIComponent(slug)}`;
}

/**
 * Match-start actions for Play sports this venue actually hosts.
 * Uses the same padel predicate as `/padel/new` court locking
 * (`isPadelVenue` on a `toVenueOption` result). Watch-only broadcasts
 * are ignored. Padel is the only startable activity today.
 */
export function venueQuickStartActivities(
  venue: Pick<VenueOption, "slug" | "sports">,
): VenueQuickStartActivity[] {
  const slug = venue.slug.trim();
  if (!slug || !isPadelVenue(venue)) return [];

  return [
    {
      id: "padel",
      sportSlug: "padel",
      name: "Padel",
      href: padelNewHref(slug),
      cta: "Start padel match",
      description: "Open a live scorecard at this court.",
    },
  ];
}
