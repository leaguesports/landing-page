import { isPadelSportLabel } from "../padel/venue-options.ts";

export type VenueSportRef = {
  name?: string | null;
  slug?: string | null;
};

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

function sportKeys(sport: VenueSportRef): string[] {
  return [sport.slug, sport.name]
    .map((value) => value?.trim().toLowerCase() ?? "")
    .filter(Boolean);
}

/**
 * Match-start actions for Play sports this venue actually hosts.
 * Watch-only broadcasts (sports bars) are ignored. Padel is the only
 * startable activity today.
 */
export function venueQuickStartActivities(
  sports: VenueSportRef[] | null | undefined,
  venueSlug: string,
): VenueQuickStartActivity[] {
  const slug = venueSlug.trim();
  if (!slug) return [];

  const activities: VenueQuickStartActivity[] = [];
  const seen = new Set<string>();

  for (const sport of sports ?? []) {
    if (!sportKeys(sport).some(isPadelSportLabel)) continue;
    if (seen.has("padel")) continue;
    seen.add("padel");
    activities.push({
      id: "padel",
      sportSlug: "padel",
      name: "Padel",
      href: padelNewHref(slug),
      cta: "Start padel match",
      description: "Open a live scorecard at this court.",
    });
  }

  return activities;
}
